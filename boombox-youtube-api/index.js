var stream = require('youtube-audio-stream');
var app = require('express')();
var http = require('http').Server(app);

var getAudio = function(req, res) {
  var requestUrl = 'https://www.youtube.com/watch?v=' + req.query.songId
  try {
    stream(requestUrl).pipe(res)
  } catch (exception) {
    res.status(500).send(exception)
  }
}

app.get('/', getAudio);

http.listen(30001);
