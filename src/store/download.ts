interface Task {
  url: string,
  fileName: string
  dir: string
}
export default defineStore({
  id: "download",
  // persist: {
  //   enabled: true
  // },
  state: () => {
    return {
      tasks: [] as Task[]
    }
  },

  actions: {
    pushTasks(tasks: Task[]) {
      // this.tasks.push(...tasks)
      this.tasks = this.tasks.concat(tasks)
    },
    removeTask() {
      this.tasks.shift()
    },
  }
})
