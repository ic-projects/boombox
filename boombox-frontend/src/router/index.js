import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Party from '@/components/Party'
import CreateParty from '@/components/CreateParty'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/create',
      name: 'Create Party',
      component: CreateParty,
    },
    {
      path: '/party/:partyId',
      name: 'Party',
      component: Party,
      props: true
    }
  ]
})
