// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'
import AsyncComputed from 'vue-async-computed'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSocketio from "vue-socket.io"

Vue.use(VueSocketio, "ws://localhost:30000")
Vue.use(require('vue-moment'))
Vue.use(VueAxios, axios)
Vue.use(AsyncComputed)
Vue.config.productionTip = false
Vue.use(BootstrapVue);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
