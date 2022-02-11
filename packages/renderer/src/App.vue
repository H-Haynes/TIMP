<template>
  <!-- <Layout /> -->
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  min-width:800px;
  /* margin: 60px auto; */
  /* max-width: 700px; */
}
fieldset {
  margin: 2rem;
  padding: 1rem;
}
html,body{
  width:100%;
  height:100%;
}
.el-message{
  position:fixed;
  top:0px;
  left:0;
  width:100%;
  text-align: center;
  background:#121212;
  color:#999;
  font-size:14px;
  display:flex;
  justify-content: center;
  align-items: center;
  padding:5px;
}
.el-message--error{
  background:#f40;
  color:#fff;
}
</style>
