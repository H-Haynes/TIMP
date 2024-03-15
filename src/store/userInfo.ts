export default defineStore({
  id: "userInfo",
  persist: {
    enabled: true
  },
  state: () => {
    return {
      userInfo: {
        token: "kkkkkk"
      }
    }
  },
  actions: {
    getUserInfo() {

    },
    logout() {

    },
    getToken() {
      return this.userInfo.token
    }
  }
})
