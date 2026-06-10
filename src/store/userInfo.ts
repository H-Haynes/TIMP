export default defineStore("userInfo", {
  persist: {
    enabled: true
  },
  state: () => {
    return {
      userInfo: {
        token: ""
      }
    }
  },
  actions: {
    getUserInfo() {},
    logout() {},
    getToken() {
      return this.userInfo.token
    }
  }
})
