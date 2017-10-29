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
    <span class="time" v-if="playing">{{ songCurrentTime }} / {{ songDuration | moment('mm:ss') }}</span>
    <b-button v-if="ready" @click="play">Play</b-button>
  </li>
</template>

<script>
  var he = require('he');

export default {
  name: 'SongElement',
  props: ['songId', 'playing', 'voteCount', 'voteable','uuid', 'partyId'],
  data () {
    return {
      voted: false,
      songCurrentTime: 0,
      songDuration: 0,
      ready: false
    }
  },
  mounted () {
    this.$options.sockets[`${this.partyId}/${this.songId}/songListVote`] = (response) => {
      this.$parent.updateVoteCount(this.songId, response.votes)
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
      //return "http://9141937e.ngrok.io/testAudio";
    }
  },
  asyncComputed: {
    songData () {
      return this.axios.get(
        "https://youtubemp3api.com/@api/json/mp3/" + this.songId)
        .then(response => response.data)
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
