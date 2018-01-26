export default {
  addToHistory (state, payload) {
    let id = state.historyList.length + 1
    payload.id = id
    state.historyList.push(payload)
  }
}
