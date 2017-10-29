var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const decoder = require('lame').Decoder
var path = require('path');
var uuidv4 = require('uuid/v4');
var stream = require('youtube-audio-stream');
var timesyncServer = require('timesync/server');
app.use('/timesync', timesyncServer.requestHandler);
var fs = require('fs');

app.get('/testAudio', function(req, res) {
})

var STARTOFNEXTSONG = undefined

function prepareAudio(youtubeCode) {
    var requestUrl = 'https://www.youtube.com/watch?v=' + youtubeCode
    try {
        let writable = fs.createWriteStream('audio.mp3');
        writable.on('open', function(w) {
            stream(requestUrl).pipe(writable)
        })
        writable.on('close', function(w) {
           io.emit("downloadNextSong")
        })
    } catch (exception) {
    res.status(500).send("Oops could not get the song")
    }
}

app.get('/sync', function(req, res) {
    STARTOFNEXTSONG = new Date().getTime() + 15000
	io.emit("getReady", {time: STARTOFNEXTSONG})

    res.send(`30 seconds start now`)
});

app.use(express.static(path.join(__dirname, 'public')));

let init = async function() {
    var db = await MongoClient.connect('mongodb://localhost:27017/boombox');
    console.log('Connected correctly to server');

    // Create parties collection if needed
    let partiesCollections = await db.listCollections({
        name: 'parties'
    }).toArray();
    if (partiesCollections.length == 0) {
        parties = await db.createCollection('parties');
        console.log('Created parties collection');
    } else {
        parties = db.collection('parties');
        console.log('Found parties collection');
    }
}

// Setup mongoDB
var parties;
init();

// Setup timesync
var timesyncServer = require('timesync/server');
app.use('/timesync', timesyncServer.requestHandler);
var START_OF_NEXT_SONG = undefined;

// Listen on sockets'
io.on('connection', function(client) {
    client.on('join', function(data) {
        if (START_OF_NEXT_SONG != undefined) {
            client.emit('getReady', {
                nextSong: START_OF_NEXT_SONG,
            });
        }
    });

    client.on('createParty', async function(data) {
        let newPartyId = Math.random().toString(36).substring(6);
        await parties.insertOne({
            'partyId'             : newPartyId,
            'name'                : data.name,
            'currentSong'         : '',
            'currentSongStartTime': 0,
            'currentSongVoteCount': 0,
            'nextSong'            : '',
            'nextSongStartTime'   : 0,
            'nextSongVoteCount'   : 0,
            'songs'               : [],
            'users'               : [],
        });

        client.emit('createdParty', {
            'newPartyId': newPartyId,
        });
    });

    client.on('joinParty', async function(data) {
        uuid = uuidv4();
        let songList = await parties.findAndModify({
            'partyId': data.partyId,
        }, [], {
            '$push': {
                'users': uuid
            }
        }, {
          'new': true
        });

        client.emit('joinedParty', {
            'uuid': uuid,
            'party': songList.value,
        });
        io.emit(data.partyId + '/userListAdd');
    });

    client.on('getNextSong', async function(data) {
        let nextSong = await parties.findOne({
            'partyId': data.partyId,
        }, {
            'fields': {
                'nextSong': 1,
                'nextSongStartTime': 1,
                'nextSongVoteCount': 1,
            },
        });

        client.emit(data.partyId + '/gotNextSong', {
            'nextSong': nextSong.nextSong,
            'nextSongStartTime': nextSong.nextSongStartTime,
            'nextSongVoteCount': nextSong.nextSongVoteCount,
        });
    });

    client.on('addSong', async function(data) {
        let songList = await parties.findAndModify({
            'partyId': data.partyId,
            'songs.songId': {
                '$ne': data.songId
            },
        }, [], {
            '$push': {
                'songs': {
                    'songId': data.songId,
                    'userId': data.userId,
                    'voterIds': [],
                }
            },
        });

        if (songList.value) {
            io.emit(data.partyId + '/songListAdd', {
                'songId': data.songId,
            })
        }

        await checkQueue(data.partyId)
    });

    async function checkQueue(id) {
      let party = await parties.findOne({
        'partyId': id
      })

      let noCur = (party.currentSongStartTime === 0)
      let noNext = (party.nextSongStartTime === 0)

      if(noCur && noNext) {
        let nextSong = party.songs.reduce((a, b) => {
          return a.voterIds.length >= b.voterIds.length ? a : b
        },{voterIds: []})
        if(nextSong) {
          removeSongAdmin(nextSong.songId, id)
          for (var i = party.songs.length - 1; i >= 0; --i) {
              if (party.songs[i].songId == nextSong.songId) {
                  party.songs.splice(i,1);
                  break;
              }
          }
          await parties.findAndModify({
              'partyId': id
            }, [], {
              '$set': {
                'currentSong': nextSong.songId,
                'currentSongStartTime': (new Date()) + 1000 * 10,
                'currentSongVoteCount': nextSong.voterIds.length,}
            })
        }

        nextSong = party.songs.reduce((a, b) => {
          return a.voterIds.length >= b.voterIds.length ? a : b
        },{voterIds: {length: -1}})
        if(nextSong) {
          removeSongAdmin(nextSong.songId, id)
          await parties.findAndModify({
              'partyId': id
            }, [], {
              '$set': {
                'nextSong': nextSong.songId,
                'nextSongStartTime': 1,
                'nextSongVoteCount': nextSong.voterIds.length,}
            })
        }

      } else if(noCur) {
        await parties.findAndModify({
            'partyId': id
          }, [], {
            '$set': {
              'currentSong': party.nextSong,
              'currentSongStartTime': (new Date()) + 1000 * 10,
              'currentSongVoteCount': party.nextSongVoteCount,}
          })
        let nextSong = party.songs.reduce((a, b) => {
          return a.voterIds.length >= b.voterIds.length ? a : b
        },{voterIds: {length: -1}})
        if(nextSong) {
          removeSongAdmin(nextSong.songId, id)
          await parties.findAndModify({
              'partyId': id
            }, [], {
              '$set': {
                'nextSong': nextSong.songId,
                'nextSongStartTime': 1,
                'nextSongVoteCount': nextSong.voterIds.length,}
            })
        }

      } else if(noNext) {
        let nextSong = party.songs.reduce((a, b) => {
          return a.voterIds.length >= b.voterIds.length ? a : b
        },{voterIds: {length: -1}})
        if(nextSong) {
          removeSongAdmin(nextSong.songId, id)
          await parties.findAndModify({
              'partyId': id
            }, [], {
              '$set': {
                'nextSong': nextSong.songId,
                'nextSongStartTime': 1,
                'nextSongVoteCount': nextSong.voterIds.length,}
            })
        }

      }

      party = await parties.findOne({
        'partyId': id
      })

      io.emit(id + '/queueUpdate', {
        'playingNow': {'songId': party.currentSong, 'time': party.currentSongStartTime, 'voteCount': party.currentSongVoteCount},
        'playingNext': {'songId': party.nextSong, 'time': party.nextSongStartTime, 'voteCount': party.nextSongVoteCount},

      })

    }

    async function removeSongAdmin(songId, partyId) {
        let songList = await parties.findAndModify({
            'partyId': partyId,
            'songs.songId': songId,
        }, [], {
            '$pull': {
                'songs': {
                    'songId': songId,
                }
            },
        });

        if (songList.value) {
            io.emit(partyId + '/songListRemove', {
                'songId': songId,
            })
        }
    }

    client.on('removeSong', async function(data) {
        let songList = await parties.findAndModify({
            'partyId': data.partyId,
            'songs.songId': data.songId,
            'songs.userId': data.userId,
        }, [], {
            '$pull': {
                'songs': {
                    'songId': data.songId,
                }
            },
        });

        if (songList.value) {
            io.emit(data.partyId + '/songListRemove', {
                'songId': data.songId,
            })
        }
    })

    client.on('voteSong', async function(data) {
        let songList = await parties.findAndModify({
            'partyId': data.partyId,
            'songs': {
                '$elemMatch': {
                    '$and': [{
                        'songId': data.songId,
                    }, {
                        'voterIds': {
                            '$ne': data.userId,
                        },
                    }]
                },
            },
        }, [], {
            '$push': {
                'songs.$.voterIds': data.userId,
            },
        });

        if (songList.value) {
            io.emit(data.partyId + '/' + data.songId + '/songListVote', {
                'votes': songList.value.songs.find((element) => element.songId == data.songId).voterIds.length + 1,
            })
        }
    });

    client.on('unvoteSong', async function(data) {
        let songList = await parties.findAndModify({
            'partyId': data.partyId,
            'songs': {
                '$elemMatch': {
                    '$and': [{
                        'songId': data.songId,
                    }, {
                        'voterIds': data.userId,
                    }]
                },
            },
        }, [], {
            '$pull': {
                'songs.$.voterIds': data.userId,
            },
        });

        if (songList.value) {
            io.emit(data.partyId + '/' + data.songId + '/songListVote', {
                'votes': songList.value.songs.find((element) => element.songId == data.songId).voterIds.length - 1,
            })
        }
    });
});

// Testing
app.get('/sync', function(req, res) {
    START_OF_NEXT_SONG = new Date().getTime() + 15000
    io.emit('getReady', {time: START_OF_NEXT_SONG})
    res.send(`30 seconds start now`)
});
app.use(express.static(path.join(__dirname, 'public')));

http.listen(30000);
