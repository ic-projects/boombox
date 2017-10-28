var app = require('express')();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

app.get('/', function(req, res) {

});

http.listen(3000, function() {

});
