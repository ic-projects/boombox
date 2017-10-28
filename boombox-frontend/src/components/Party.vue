<template>
  <div class="container">
    <h1>Welcome to "{{ partyName }}" </h1>
    <b-button>Become a speaker</b-button>
    <div class="bd-content">
      Playing Now:
      <SongElement :song="playingNow" :voteable="false" :playing="true"></SongElement>
    </div>
    <div class="bd-content">
      Playing Next:
      <SongElement :song="playingNext" :voteable="false" :playing="false"></SongElement>
    </div>
    Queue:
    <ul v-for="song in songqueue">
      <SongElement :song="song" :voteable="true" :playing="false"></SongElement>
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
      playingNext: {url: 'dQw4w9WgXcQ'},
      playingNow: {url: 'xw2Im4aDvAI'},
      partyName: ''
    }
  },
  method: {
    leaveParty () {
      //TODO CALL API leaveParty
    }
  },
  mounted () {
    //TODO CALL API joinParty, getSongList connect to socket io
  }
}
</script>
