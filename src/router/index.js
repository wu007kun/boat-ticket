import Vue from 'vue'
import Router from 'vue-router'
import bookHistory from '@/components/bookHistory'
import buyTicket from '@/components/buyTicket'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: {path: '/ticket'}
    },
    {
      path: '/ticket',
      name: 'buyTicket',
      component: buyTicket
    },
    {
      path: '/history',
      name: 'bookHistory',
      component: bookHistory
    }
  ]
})
