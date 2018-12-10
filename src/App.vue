<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  width: 100%;
  height: 100%;
}
html * {
  outline: 0;
  -webkit-text-size-adjust: none;
  -webkit-tap-highlight-color: transparent;
}
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 36px;
}
body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
p {
  margin: 0;
}
</style>
