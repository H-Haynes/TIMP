export default defineStore({
  id: "test",
  persist: {
    enabled: true
  },
  state: () => {
    return {
      name: "状态数据"
    }
  },
  getters: {
    fullName: (state: any) => {
      return "我叫" + state.name
    }
  },
  actions: {
    updateName(name: string) {
      this.name = name
    }
  }
})

// 使用:
// 任意地方使用： const {fullName,updateName,name} = useStore('test')
