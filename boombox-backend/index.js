var app = require('express')();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var co = require('co');
var assert = require('assert');
var uuid = require('uuid/v1');

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

  // Handle API calls
  app.get('/createParty', getCreateParty);
  app.get('/joinParty', getJoinParty);
}

co(init).catch(function(err) {
  console.log(err.stack);
});

http.listen(30000);
