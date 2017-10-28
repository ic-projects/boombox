var app = require('express')();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Setup MongoDB database
var url = 'mongodb://localhost:27017/boombox';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});

app.get('/', function(req, res) {

});

http.listen(3000, function() {

});
