<template>
  <li class="list-group-item"
      :class="{
        'list-group-item-primary' : playing,
        'voteable' : voteable,
        'list-group-item-success' : voted
      }"
      @click="vote"
      v-if="songId && songData">
    {{ songData.vidTitle | decodeTitle }}
    <audio @canplaythrough="isReady"
           @timeupdate="timeUpdate"
           preload="auto" ref="audio" v-if="srcReady" :src="srcURL"></audio>
    <span class="badge badge-primary badge-pill">{{ voteCount }}</span>
    <b-progress :value="songCurrentTime" :max="songDuration" v-if="playing"></b-progress>
    <span class="time" v-if="playing">{{ songCurrentTime }} / {{ songDuration }}</span>
    <b-button v-if="ready">Ready</b-button>
  </li>
</template>

<script>
  var he = require('he');

export default {
  name: 'SongElement',
  props: ['songId', 'playing', 'voteCount', 'voteable','uuid', 'partyId', 'time'],
  data () {
    return {
      voted: false,
      songCurrentTime: 0,
      songDuration: 0,
      ready: false
    }
  },

  filters: {
    decodeTitle: function(title) {
      return he.decode(title)
    }
  },
  methods: {
    isReady () {
      console.log("ready "+this.songData.vidTitle)
      this.ready = true
    },
    timeUpdate () {
      let music = this.$refs.audio
      console.log(music.duration)
      this.songDuration = music.duration
      this.songCurrentTime = music.currentTime
      if( this.songDuration  - this.songCurrentTime < 1) {
        console.log("FINISH")
        console.log({ partyId: this.partyId, songId: this.songId})
        this.$socket.emit('songFinish', { partyId: this.partyId, songId: this.songId})
        this.songCurrentTime = 0;
        music.currentTime = 0;
        music.pause();
      }
    },
    vote () {
      if (this.voteable) {
        if(this.voted) {
          this.$socket.emit('unvoteSong', { partyId: this.partyId, songId: this.songId, userId: this.uuid })
        } else {
          this.$socket.emit('voteSong', { partyId: this.partyId, songId: this.songId, userId: this.uuid })
        }
        this.voted = !this.voted;
        console.log(this.voted)
      }
    },
    play () {
      let music = this.$refs.audio
      if(music.paused) {
        music.play();
      } else {
        music.pause();
      }
    }
  },
  computed: {
    voteStatus () {
      return this.voted ? 'success' : ''
    },
    srcReady () {
      return (!this.voteable && this.songData && !this.songData.error)
    },
    srcURL () {
      return this.srcReady ? this.songData.vidInfo['3'].dloadUrl : "";
      //return "http://bb03797f.ngrok.io/"++".mp3";
    }
  },
  sockets: {
    downloadNextSong(response) {
      let music = this.$refs.audio
      if(!this.playing && !this.voteable) {
          music.load()
      }
    },
    getReady(response) {
      if(this.songId == response.songId) {
        let music = this.$refs.audio
        setTimeout(() => {
          music.play();
        }, response.time - window.ts.now())
      }
    }
  },
  asyncComputed: {
    songData () {
      return this.axios.get(
        "https://youtubemp3api.com/@api/json/mp3/" + this.songId)
        .then(response => response.data)
    }
  },
  watch: {
    time: function(newTime) {
      /*console.log(newTime)
      console.log(Date.now())
      if(newTime > Date.now()) {
        console.log("starting timer for "+newTime - Date.now())
        setTimeout(() => {
          if(this.playing && this.songId) {
            //console.log("PLAYED")
            let music = this.$refs.audio
            //music.play()
        }
        }, newTime - window.ts.now())
      } else {
        if(newTime > 0) {
          /*let checkReady = () => {
            //console.log(this)
            if(this.ready) {
              console.log("caught up")
              let music = this.$refs.audio
              let skip =  (window.ts.now() - newTime )/1000
              console.log(skip)
              music.currentTime = skip
              music.play();
              music.currentTime = skip

              clearInterval(waiter)
            }
          }
          var waiter = setInterval(checkReady, 1000)
        }

        console.log("missed start time")
      }*/
    }
  },
  mounted () {
      this.$options.sockets[`${this.partyId}/${this.songId}/songListVote`] = (response) => {
        this.$parent.updateVoteCount(this.songId, response.votes)
      }

    this.$options.sockets[`${this.partyId}/${this.songId}/play`] = (response) => {
      let music = this.$refs.audio
      music.play()
    }
  }
}
</script>

<style scoped>
ul li.voteable:hover {
  cursor: pointer;
}

ul li .badge {
  float: right;
}

.progress,
.time {
  margin-top: 10px;
}

.time {
  display: block;
}
</style>
