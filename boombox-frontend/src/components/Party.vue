<template>
  <div>
    <div class="container text-center">
      <h3>Welcome to {{ partyName }}</h3>
      <br>
      <ul class="list-group">
        <SongElement :song="playingNow" :uuid="uuid" :voteable="false" :partyId="partyId" :playing="true"></SongElement>
        <SongElement :song="playingNext" :uuid="uuid" :voteable="false" :partyId="partyId" :playing="false"></SongElement>
      </ul>
      <br>
      <br>
      <ul class="list-group" v-for="song in songqueue">
        <li class="list-group-item list-header">Song List</li>
        <SongElement :song="song" :uuid="uuid" :voteable="true" :partyId="partyId" :playing="false"></SongElement>
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
  props: ['partyId'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js PWA',
      uuid: '',
      songqueue: [],
      playingNext: {songId:""},
      playingNow: {songId:""},
      partyName: '',
      isSpeaker: false,
      songId: '',
    }
  },
  methods: {
    leaveParty () {
      this.$socket.emit('leaveParty', { partyId: this.partyId }, (response) => {
          router.push("/");
        })
    },
    joinParty() {
      console.log
      this.$socket.emit('joinParty', { partyId: this.partyId })
    },
    addSong () {
      this.$socket.emit('addSong', { partyId: this.partyId, songId: this.songId, userId: this.uuid })
    }
  },
  mounted () {
    this.$options.sockets[`${this.partyId}/addedSong`] = (response) => {
      console.log(response)
    }

    this.joinParty()
  },
  sockets: {
    joinedParty(response) {
      this.uuid = response.uuid
      console.log(response)
      this.partyName = response.party.name
      this.songqueue = response.party.songs
      this.playingNext = {songId: response.party.currentSong, time: response.party.currentSongStartTime}
      this.playingNow = {songId: response.party.nextSong, time: response.party.nextSongStartTime}
    }
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
