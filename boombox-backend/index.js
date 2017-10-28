var app = require('express')();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var co = require('co');
var assert = require('assert');

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
