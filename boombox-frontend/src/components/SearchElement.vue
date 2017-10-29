<template>
  <li class="list-group-item"
      @click="addSong">
    {{ songTitle }}
  </li>
</template>
<script>
  var he = require('he');
export default {
  name: 'SearchElement',
  props: ['songId', 'songTitle'],
  methods: {
    addSong () {
      this.$socket.emit('addSong', { partyId: this.partyId, songId: this.songId, userId: this.uuid })
    }
  }
}
</script>
<style>
ul li:hover {
  cursor: pointer;
}
</style>