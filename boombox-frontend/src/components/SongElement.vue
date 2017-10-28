<template>
  <div>
    <b-card v-if="songData">
      <b-media>
        <div  slot="aside">
          <h1> {{ song.votes }} </h1>
          <b-button v-if="!voteable" slot="aside" @click="vote" :variant="voteStatus">+1</b-button>
        </div>
        <h3> {{ songData.vidTitle }} </h3>
      </b-media>
      <audio ref="audio" v-if="srcReady" :src="srcURL"></audio>
      <button v-if="srcReady" @click="play">Play</button>
      <div v-if="playing">
        Time bar
      </div>

    </b-card>

  </div>
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
