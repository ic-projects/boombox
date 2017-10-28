var app = require('express')();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var co = require('co');
var assert = require('assert');
var uuid = require('uuid/v1');
var io = require('socket.io')(http);

var timesyncServer = require('timesync/server');
app.use('/timesync', timesyncServer.requestHandler);

io.on("connection", function(client) {
	console.log("Client connection");
	client.on("join", function(data) {
		console.log("client join!");
	});
});

app.get('/sync', function(req, res) {
	io.emit("getReady", {time: (new Date().getTime()) + 15000});
  res.send(`30 seconds start now`);
});

app.get('/receiver', function (req, res) {
	res.send(`
<!DOCTYPE html>
<html>
<head>
  <!-- note: for support on older browsers, you will need to load es5-shim and es6-shim -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.0.5/es5-shim.min.js"></script> 
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.23.0/es6-shim.min.js"></script> 
 
  <script src="/timesync/timesync.js"></script> 
	<script src="https://code.jquery.com/jquery-1.10.2.js"></script>
  <script src="/socket.io/socket.io.js"></script>            
	<script>
	  // create a timesync instance
	  var ts = timesync.create({
	    server: '/timesync',
	    interval: 10000
	  });
	  
	  var OFFSET = 0;

	  var socket = io.connect('http://localhost:2001');
	  socket.on('connection', function(data) {
	  	console.log("successfully connected to the browser")
	  });
	 
	  // get notified on changes in the offset
	  ts.on('change', function (offset) {
	  	OFFSET = offset;
	  	console.log("OFFSET: ", OFFSET);
	  });
	 
	  function submitConnection(event) {
	    document.getElementById("waiting").style.color = "black";
	    document.getElementById("fs").style.color = "white";
	    document.getElementById("ff").style.color = "white";
	    socket.emit('join', "Add me please");
	  }

	  socket.on("getReady", function(data) {
	  	console.log(data.time);
	  	console.log(ts.now());
	  	console.log(data.time - ts.now())
	  	setTimeout(function () {
	  		document.getElementById("boom").style.color = "red";
	  		document.getElementById("waiting").style.color = "white";
	  	}, data.time - ts.now())
	  	data.time ;
	  });

	</script> 
</head>
<body>

	<h1 id="boom" style="color:white">BOOM</h1>
	<h2 id="waiting" style="color:white">Waiting....</h2>
	<form action="JavaScript:submitConnection()">
	  <p id="ff" >Connect to waiting list</p>
	  <input id="fs" type='submit' value="Submit">
	</form>
</body>
</html>
		`);
});

let init = async function() {
  // Setup MongoDB database
  var db = await MongoClient.connect('mongodb://localhost:27017/boombox');
  console.log('Connected correctly to server');

  // Create parties collection if needed
  let partiesCollections = await db.listCollections({
    name: 'parties'
  }).toArray();
  if (partiesCollections.length == 0) {
    var parties = await db.createCollection('parties');
    console.log('Created parties collection');
  } else {
    var parties = db.collection('parties');
    console.log('Found parties collection');
  }

  var getCreateParty = async function(req, res) {
    let newPartyId = Math.random().toString(36).substring(6);
    await parties.insertOne({
      'partyId': newPartyId,
      'currentSong': '',
      'currentSongStartTime': 0,
      'nextSong': '',
      'nextSongStartTime': 0,
      'songs': [],
  	});
    res.send(newPartyId);
  }

  /**
   * GET Parameters:
   *  - partyId
   */
  var getSongList = async function(req, res) {
  	let songList = await parties.findOne({
  		'partyId': req.query.partyId,
  	});
  	res.send(songList);
  }

  /**
   * GET Parameters:
   *  - partyId
   */
  var getNextSong = async function(req, res) {
  	let songList = await parties.findOne({
  		'partyId': req.query.partyId,
  	}, {
  		'fields': { nextSong: 1, nextSongStartTime: 1 }
  	});
  	res.send(songList);
  }

  /**
   * GET Parameters:
   *  - partyId
   *  - songId
   *  - userId
   */
  var getAddSong = async function(req, res) {
  	// TODO: Don't allow the same song to be added twice?

  	await parties.findAndModify({
  		'partyId': req.query.partyId,
  	}, [], {
  		'$push': { 
  			'songs': {
  				'songId': req.query.songId,
  				'userId': req.query.userId,
  				'voterIds': [],
  			}
  		}
  	});

  	res.send(true);
  }

  /**
   * GET Parameters:
   *  - partyId
   *  - songId
   *  - userId
   */
  var getRemoveSong = async function(req, res) {
  	await parties.findAndModify({
  		'partyId': req.query.partyId,
  	}, [], {
  		'$pull': { 
  			'songs': {
  				'songId': req.query.songId,
  				'userId': req.query.userId,
  			}
  		}
  	});

  	res.send(true);
  }

  /**
   * GET Parameters:
   *  - partyId
   *  - songId
   *  - userId
   */
  var getVoteSong = async function(req, res) {
  	await parties.findAndModify({
  		'partyId': req.query.partyId,
  		'songs.songId': req.query.songId,
  	}, [], {
  		'$push': { 
  			'songs.$.voterIds': req.query.userId
  		}
  	});

  	res.send(true);
  }

  /**
   * GET Parameters:
   *  - partyId
   *  - songId
   *  - userId
   */
  var getUnvoteSong = async function(req, res) {
  	await parties.findAndModify({
  		'partyId': req.query.partyId,
  		'songs.songId': req.query.songId,
  	}, [], {
  		'$pull': { 
  			'songs.$.voterIds': req.query.userId
  		}
  	});

  	res.send(true);
  }

  // Handle API calls
  app.get('/createParty', getCreateParty);
  app.get('/songList', getSongList);
  app.get('/nextSong', getNextSong);
  app.get('/addSong', getAddSong);
  app.get('/removeSong', getRemoveSong);
  app.get('/voteSong', getVoteSong);
  app.get('/unvoteSong', getUnvoteSong);
}

co(init).catch(function(err) {
  console.log(err.stack);
});

http.listen(30000);
