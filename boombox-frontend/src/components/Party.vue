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
          <SongElement :songId="song.songId" :song="song.voteCount" :uuid="uuid" :voteable="true" :partyId="partyId" :playing="false"></SongElement>
        </div>
      </ul>
      <br>
      <b-form @submit.prevent="searchSongs">
        <b-input-group>
          <b-form-input type="text"
                        v-model="searchInput"
                        placeholder="Search for a song"></b-form-input>
          <b-input-group-button>
              <b-button type="submit" variant="primary">Search</b-button>
          </b-input-group-button>
        </b-input-group>
      </b-form>
      <ul class="list-group" >
        <div v-for="song in searchresults" :key="song.id.videoId">
          <SearchElement :songId="song.id.videoId" :songTitle="song.snippet.title"></SearchElement>
        </div>
      </ul>
      <br>
      <router-link to="/" id="join-party">Leave a party!</router-link>
    </div>
  </div>
</template>

<script>
  import SongElement from '@/components/SongElement'
  import SearchElement from '@/components/SearchElement'

export default {
  name: 'party',
  components: {
    SongElement,
    SearchElement
  },
  props: ['partyId'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js PWA',
      uuid: '',
      songqueue: [],
      searchInput: '',
      searchresults: [],
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
    searchSongs: async function() {
      await this.axios.get(
        'https://www.googleapis.com/youtube/v3/search?q='+ this.searchInput
            + '&part=snippet&maxResults=10&type=video&key=AIzaSyClC71UhsWz3tr3ukz68b8_FuvpBQABYM0').then((response) => {
        this.searchresults = response.data.items
      });
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
