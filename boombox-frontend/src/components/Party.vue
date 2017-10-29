<template>
  <div>
    <div class="container text-center">
      <h3>Welcome to {{ partyName }}</h3>
      <h4>{{ partyId }}</h4>
      <b-button @click="songFinish">POP</b-button>
      <br>
      <ul class="list-group">
        <li class="list-group-item list-header">Now Playing</li>
        <SongElement :songId="playingNow.songId" :time="playingNow.time":uuid="uuid" :voteable="false" :partyId="partyId" :playing="true"></SongElement>
        <li class="list-group-item list-header">Up Next</li>
        <SongElement :songId="playingNext.songId" :uuid="uuid" :voteable="false" :partyId="partyId" :playing="false"></SongElement>
      </ul>
      <br>
      <br>
      <ul class="list-group" >
        <li class="list-group-item list-header">Song List</li>
        <div v-for="song in songqueue" :key="song.songId">
          <SongElement :songId="song.songId" :voteCount="song.voteCount" :uuid="uuid" :voteable="true" :partyId="partyId" :playing="false"></SongElement>
        </div>
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
      <router-link to="/" id="join-party">Leave a party!</router-link>
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
    songFinish () {
      this.$socket.emit('songFinish', { partyId: this.partyId , songId: this.playingNow.songId})
    },
    updateVoteCount (id, votes) {
      console.log("id:"+id+" votes:"+votes)
      this.songqueue.find((element) => element.songId == id).voteCount = votes;
      this.resortQueue()
    },
    resortQueue () {
      console.log("sorting")
      this.songqueue = this.songqueue.sort((a,b) => { return b.voteCount - a.voteCount})
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
    this.$options.sockets[`${this.partyId}/queueUpdate`] = (response) => {
      this.playingNext = response.playingNext
      this.playingNow = response.playingNow
    }
    this.$options.sockets[`${this.partyId}/songListAdd`] = (response) => {
      this.songqueue.push({songId: response.songId, voteCount: 0})
      this.resortQueue()
    }
    this.$options.sockets[`${this.partyId}/songListRemove`] = (response) => {

      for (var i = this.songqueue.length - 1; i >= 0; --i) {
          if (this.songqueue[i].songId == response.songId) {
              this.songqueue.splice(i,1);
              break;
          }
      }
      this.resortQueue()
    }
    this.joinParty()
  },
  sockets: {
    joinedParty(response) {
      this.uuid = response.uuid
      console.log(response)
      this.partyName = response.party.name
      this.songqueue = response.party.songs
      this.songqueue.map((elem) => {elem.voteCount = elem.voterIds.length})
      this.playingNow = {songId: response.party.currentSong, time: response.party.currentSongStartTime, voteCount: response.party.currentSongVoteCount}
      this.playingNext = {songId: response.party.nextSong, time: response.party.nextSongStartTime, voteCount: response.party.nextSongVoteCount}
      this.resortQueue()
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
