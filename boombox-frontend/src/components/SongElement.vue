<template>
  <li class="list-group-item"
      :class="{
        'list-group-item-primary' : playing,
        'voteable' : voteable,
        'list-group-item-success' : voted
      }"
      @click="vote"
      v-if="songData">
    {{ songData.vidTitle | decodeTitle }}
    <audio @canplaythrough="isReady"
           @timeupdate="timeUpdate"
           preload="auto" ref="audio" v-if="srcReady" :src="srcURL"></audio>
    <span class="badge badge-primary badge-pill">{{ song.votes }}</span>
    <b-progress :value="songCurrentTime" :max="songDuration" v-if="playing"></b-progress>
    <span class="time">{{ songCurrentTime | moment('mm:ss') }} / {{ songDuration | moment('mm:ss') }}</span>
    <b-button v-if="ready" @click="play">Play</b-button>
  </li>
</template>

<script>
  var he = require('he');

export default {
  name: 'SongElement',
  props: ['song', 'playing', 'voteable','uuid'],
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
    },
    vote () {
      if (this.voteable) {
        if(this.voted) {
          this.axios.get("/voteSong?partyId=" + this.partyid +
          "&songId="+this.song.url+ "&userId="+this.uuid)
          .then(response => {
            console.log("no yo")
          })
        } else {
          this.axios.get("/voteSong?partyId=" + this.partyid +
          "&songId="+this.song.url+ "&userId="+this.uuid)
          .then(response => {
            console.log("yo")
          })
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
    }
  },
  asyncComputed: {
    songData () {
      return this.axios.get(
        "https://youtubemp3api.com/@api/json/mp3/" + this.song.url)
        .then(response => response.data)
    }
  },
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
