# Boombox

Boombox is an easy way to play music at a party. Simply upvote songs on the 
playlist to get them elected or even add your own choices to the playlist!  
The songs can be played on any device, turning your party in a multiroom 
experience if you feel like it!

## Installation

1. Install MongoDB using instructions found [here](https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/#install-mongodb-enterprise-from-tarball).
2. Install Node ^8.8.1 and npm [here](https://nodejs.org/en/)
3. Go in the directory and make sure every deps is installed:
```
$ cd boombox-backend
$ npm install
$ cd ../boombox-frontend
$ npm install
```
You should now be ready to go!


## Usage

Run the client (in `boombox/boombox-frontend`)
```
$ npm run dev
```  
and run the server (in `boombox/boombox-backend`)
```
$ node index.js
```

Head to `http://localhost:8080` and enjoy the party!

