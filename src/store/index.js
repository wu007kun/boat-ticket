
import Vue from 'vue'
import Vuex from 'vuex'
// import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)
const state = {
  historyList: []
}

const store = new Vuex.Store({
  state,
  mutations
})

export default store
