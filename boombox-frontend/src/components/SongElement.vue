<template>
  <li class="list-group-item"
      :class="{
        'list-group-item-primary' : playing,
        'voteable' : voteable,
        'list-group-item-success' : voted
      }"
      @click="vote"
      v-if="songData">
    {{ songData.vidTitle }}
    <audio preload="auto" ref="audio" v-if="srcReady" :src="srcURL"></audio>
    <span class="badge badge-primary badge-pill">{{ song.votes }}</span>
    <b-progress :value="songCurrentTime" :max="songDuration" show-progress animated v-if="playing"></b-progress>
    <!-- <b-button v-if="srcReady" @click="play">Play</b-button> -->
  </li>
</template>

<script>
export default {
  name: 'SongElement',
  props: ['song', 'playing', 'voteable','uuid'],
  data () {
    return {
      voted: false
    }
  },
  methods: {
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

.progress {
  margin-top: 10px;
}
</style>
