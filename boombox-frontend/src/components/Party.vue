<template>
  <div class="container">
    <h1>Welcome to "{{ partyName }}" </h1>
    <b-button>Become a speaker</b-button>
    <div class="bd-content" v-if="playingNow">
      Playing Now:
      <SongElement :song="playingNow" :uuid="uuid" :voteable="false" :playing="true"></SongElement>
    </div>
    <div class="bd-content" v-if="playingNext">
      Playing Next:
      <SongElement :song="playingNext" :uuid="uuid" :voteable="false" :playing="false"></SongElement>
    </div>
    Queue:
    <ul v-for="song in songqueue">
      <SongElement :song="song" :uuid="uuid" :voteable="true" :playing="false"></SongElement>
    </ul>

    <b-button @click="leaveParty">Leave Party</b-button>
  </div>
</template>

<script>
  import SongElement from '@/components/SongElement'

export default {
  name: 'party',
  components: {
    SongElement
  },
  props: ['partyid'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js PWA',
      uuid: '',
      songqueue: [],
      playingNext: {},
      playingNow: {},
      partyName: '',
      isSpeaker: false
    }
  },
  method: {
    leaveParty () {
      this.axios.get("/leaveParty?partyId=" + this.partyid)
        .then(response => {
          router.push("/");
        })
    },
    getSongList () {
      this.axios.get("/songList?partyId=" + this.partyid)
        .then(response => {
          console.log(response.data)
        })
    },
    joinParty () {
      this.axios.get("/joinParty?partyId=" + this.partyid)
        .then(response => {
          this.uuid = response.data
          this.initSocket();
          this.getSongList();
        })
    },
    initSocket () {

    }
  },
  mounted () {
    //TODO CALL API joinParty, getSongList connect to socket io
    this.joinParty()

  }
}
</script>
