<template>
  <div>
    <div class="container text-center">
      <h3>Welcome to {{ partyName }}</h3>
      <br>
      <ul class="list-group">
        <SongElement :song="playingNow" :uuid="uuid" :voteable="false" :playing="true"></SongElement>
        <SongElement :song="playingNext" :uuid="uuid" :voteable="false" :playing="false"></SongElement>
      </ul>
      <br>
      <br>
      <ul class="list-group" v-for="song in songqueue">
        <li class="list-group-item list-header">Song List</li>
        <SongElement :song="song" :uuid="uuid" :voteable="true" :playing="false"></SongElement>
      </ul>
      <br>
      <b-form @submit.prevent="addSong">
        <b-input-group>
          <b-form-input type="text"
                        v-model="songId"
                        placeholder="Enter the YouTube ID"></b-form-input>
          <b-input-group-button>
              <b-button type="submit" variant="primary">Add Song</b-button>
          </b-input-group-button>
        </b-input-group>
      </b-form>
      <br>
      <a href="#" @click="leaveParty" id="join-party">Leave a party!</a>
    </div>
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
      songqueue: [{url: "3M_5oYU-IsU", votes: 69}],
      playingNext: {url: "3M_5oYU-IsU", votes: 69},
      playingNow: {url: "4LfJnj66HVQ", votes: 420},
      partyName: 'Nik\'s 31\'st Birthday',
      isSpeaker: false,
      songId: '',
    }
  },
  methods: {
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
    joinParty() {
      this.axios.get("/joinParty?partyId=" + this.partyid)
        .then(response => {
          console.log(response.data)
          this.uuid = response.data.playerid;
          this.partyName = response.data.name;
          this.initSocket()
          this.getSongList()
        })
    },
    addSong () {
      this.axios.get("/addSong?partyId=" + this.partyid + "&songId=" + this.songId + "&userId=" + this.uuid)
        .then(response => {
          console.log(response.data)
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
<style scoped>
ul li.list-header {
  background: #f5f5f5;
  text-align: center;
}

ul {
  text-align: left;
}
</style>
