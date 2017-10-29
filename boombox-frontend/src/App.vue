<template>
  <div id="app">
    <header>
      <h1><router-link to="/">📻 BOOMBox</router-link></h1>
    </header>
    <main><router-view></router-view></main>
    <footer>&copy; BOOMBox 2017</footer>
  </div>
</template>

<script>
var timesync = require('timesync')
/*window.ts = timesync.create({
  server: '/timesync',
  interval: 100000
})*/

export default {
  name: 'app'
}
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: 'Raleway', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  text-align: center;
  margin: 0;
  padding: 10px 0;
  background-color: #f5f5f5;
}

header a {
  color: #2c3e50 !important;
  text-decoration: none !important;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}

footer {
  text-align: center;
  margin-top: 20px;
}
</style>
