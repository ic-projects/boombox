var app = require('express')();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var co = require('co');
var assert = require('assert');
var uuid = require('uuid/v1');
var io = require('socket.io')(http);

var timesyncServer = require('timesync/server');
app.use('/timesync', timesyncServer.requestHandler);

app.get('/sync', function(req, res) {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <!-- note: for support on older browsers, you will need to load es5-shim and es6-shim -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.0.5/es5-shim.min.js"></script> 
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.23.0/es6-shim.min.js"></script> 
 
  <script src="/timesync/timesync.js"></script> 
</head>
<script>
  // create a timesync instance
  var ts = timesync.create({
    server: '/timesync',
    interval: 10000
  });
 
  // get notified on changes in the offset
  ts.on('change', function (offset) {
    document.write('changed offset: ' + offset + ' ms<br>');
  });
 
  // get synchronized time
  setInterval(function () {
    var now = new Date(ts.now());
    document.write('now: ' + now.toISOString() + ' ms<br>');
  }, 1000);
</script> 
<body>

	<script src="https://code.jquery.com/jquery-1.10.2.js"></script>
  <script src="/socket.io/socket.io.js"></script>            
</body>
</html>
`);
});

let hello = `
<!doctype html>  
<html lang="en">  
    <head>

    </head>
    <body>
        <h1>Hello World!</h1>
        <div id="future"></div>
        <form id="form" id="chat_form">
            <input id="chat_input" type="text">
            <input type="submit" value="Send">
        </form>
    </body>
</html>
`;

app.get('/receiver', function (req, res) {
	res.send(`
<!DOCTYPE html>
<html>
<head>
  <!-- note: for support on older browsers, you will need to load es5-shim and es6-shim -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.0.5/es5-shim.min.js"></script> 
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.23.0/es6-shim.min.js"></script> 
 
  <script src="/timesync/timesync.js"></script> 
</head>
<script>
  // create a timesync instance
  var ts = timesync.create({
    server: '/timesync',
    interval: 10000
  });
  
  var OFFSET = 0;
 
  // get notified on changes in the offset
  ts.on('change', function (offset) {
  	OFFSET = offset;
  	console.log(OFFSET);
  });
 
  // get synchronized time
  setInterval(function () {
    var now = new Date(ts.now());
    //document.write('now: ' + now.toISOString() + ' ms<br>');
  }, 1000);

  function submitConnection(event) {
    document.getElementById("waiting").style.color = "black";
    document.getElementById("fs").style.color = "white";
    document.getElementById("ff").style.color = "white";
  }

</script> 
<body>

	<h1 id="boom" style="color:white">BOOM</h1>
	<h2 id="waiting" style="color:white">Waiting....</h2>
	<form action="JavaScript:submitConnection()">
	  <p id="ff" >Connect to waiting list</p>
	  <input id="fs" type='submit' value="Submit">
	</form>
	<script src="https://code.jquery.com/jquery-1.10.2.js"></script>
  <script src="/socket.io/socket.io.js"></script>            
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

  /**
   * GET Parameters:
   *  - name: The name of the new party
   */
  var getCreateParty = async function(req, res) {
    let newPartyId = Math.random().toString(36).substring(6);
    await parties.insertOne({
      partyId: newPartyId,
      currentSong: '',
      currentSongStartTime: 0,
      nextSong: '',
      nextSongStartTime: 0,
      songs: [],
    });
    res.send(newPartyId);
  }

  /**
   * GET Paremeters:
   *  - partyId
   */
  var getJoinParty = async function(req, res) {
    res.send(uuid());
  }
  
http.listen(2001, function(){

  // Handle API calls
  app.get('/createParty', getCreateParty);
  app.get('/joinParty', getJoinParty);
}

co(init).catch(function(err) {
  console.log(err.stack);
});

http.listen(30000);
