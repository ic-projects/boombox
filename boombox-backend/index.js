var express = require('express');
var app = express();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var co = require('co');
var assert = require('assert');
var uuidv4 = require('uuid/v4');
var io = require('socket.io')(http);
var path = require('path');

var timesyncServer = require('timesync/server');
app.use('/timesync', timesyncServer.requestHandler);

app.get('/testAudio', function(req, res) {
    var requestUrl = 'https://www.youtube.com/watch?v=' + req.query.songId
    try {
        stream(requestUrl).pipe(res)
    } catch (exception) {
    res.status(500).send("Oops could not get the song")
  }
})

var STARTOFNEXTSONG = undefined

io.on("connection", function(client) {
    console.log("Client connection");
    client.on("join", function(data) {
        console.log("client join!");
        if (STARTOFNEXTSONG != undefined) {
            client.emit("getReady", {
                nextSong: STARTOFNEXTSONG,
            })
        }
    });
});


app.get('/sync', function(req, res) {
    STARTOFNEXTSONG = new Date().getTime() + 15000
	io.emit("getReady", {time: STARTOFNEXTSONG})

    res.send(`30 seconds start now`)
});

app.use(express.static(path.join(__dirname, 'public')));

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
     * GET Paremeters:
     *  - name
     */
    var getCreateParty = async function(req, res) {
        let newPartyId = Math.random().toString(36).substring(6);
        await parties.insertOne({
            'partyId': newPartyId,
            'name': req.query.name,
            'currentSong': '',
            'currentSongStartTime': 0,
            'nextSong': '',
            'nextSongStartTime': 0,
            'songs': [],
            'users': [],
        });
        res.send(newPartyId);
    }

    /**
     * GET Paremeters:
     *  - partyId
     */
    var getJoinParty = async function(req, res) {
        uuid = uuidv4();

        let party = await parties.findAndModify({
            'partyId': req.query.partyId,
        }, [], {
            '$push': {
                'users': uuid
            }
        });

        res.send({
            'uuid': uuid,
            'name': party.value.name,
        });
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
        let nextSong = await parties.findOne({
            'partyId': req.query.partyId,
        }, {
            'fields': {
                'nextSong': 1,
                'nextSongStartTime': 1,
            },
        });
        res.send(nextSong);
    }

    /**
     * GET Parameters:
     *  - partyId
     *  - songId
     *  - userId
     */
    var getAddSong = async function(req, res) {
        let songList = await parties.findAndModify({
            'partyId': req.query.partyId,
            'songs.songId': {
                '$ne': req.query.songId
            },
        }, [], {
            '$push': {
                'songs': {
                    'songId': req.query.songId,
                    'userId': req.query.userId,
                    'voterIds': [],
                }
            },
        });

        if (songList.value) {
            res.send(true);
        } else {
            res.send(false);
        }
    }

    /**
     * GET Parameters:
     *  - partyId
     *  - songId
     *  - userId
     */
    var getRemoveSong = async function(req, res) {
        let songList = await parties.findAndModify({
            'partyId': req.query.partyId,
            'songs.songId': req.query.songId,
            'songs.userId': req.query.userId,
        }, [], {
            '$pull': {
                'songs': {
                    'songId': req.query.songId,
                }
            },
        });

        if (songList.value) {
            res.send(true);
        } else {
            res.send(false);
        }
    }

    /**
     * GET Parameters:
     *  - partyId
     *  - songId
     *  - userId
     */
    var getVoteSong = async function(req, res) {
        let songList = await parties.findAndModify({
            'partyId': req.query.partyId,
            'songs': {
                '$elemMatch': {
                    '$and': [{
                        'songId': req.query.songId,
                    }, {
                        'voterIds': {
                            '$ne': req.query.userId,
                        },
                    }]
                },
            },
        }, [], {
            '$push': {
                'songs.$.voterIds': req.query.userId,
            },
        });

        if (songList.value) {
            res.send(true);
        } else {
            res.send(false);
        }
    }

    /**
     * GET Parameters:
     *  - partyId
     *  - songId
     *  - userId
     */
    var getUnvoteSong = async function(req, res) {
        let songList = await parties.findAndModify({
            'partyId': req.query.partyId,
            'songs': {
                '$elemMatch': {
                    '$and': [{
                        'songId': req.query.songId,
                    }, {
                        'voterIds': req.query.userId,
                    }]
                },
            },
        }, [], {
            '$pull': {
                'songs.$.voterIds': req.query.userId,
            },
        });

        if (songList.value) {
            res.send(true);
        } else {
            res.send(false);
        }
    }

    // Handle API calls
    app.get('/createParty', getCreateParty);
    app.get('/joinParty', getJoinParty);
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
