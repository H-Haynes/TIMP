<template>
  <div class="p-6 pt-0">
    <h4 class="text-24px">设置</h4>
    <div class="my-6">
      <el-form class="w-600px mx-auto" label-width="200px" label-position="left">
        <div class="my-6 text-18px">界面设置</div>

        <el-form-item label="皮肤">
          <el-select class="w-full" v-model="settingForm.skin">
            <el-option label="跟随系统" :value="0"></el-option>
            <el-option label="浅色" :value="1"></el-option>
            <el-option label="深色" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="settingForm.skin === 3" label="设置皮肤"></el-form-item>

        <div class="my-6 text-18px">下载设置</div>
        <el-form-item label="下载路径">
          <p>当前路径：{{ downloadPath }}</p>
          <el-button @click="chooseDir">选择文件夹</el-button>
        </el-form-item>

        <el-form-item label="下载通知">
          <el-select v-model="settingForm.downloadNotice" class="w-full" placeholder="是否开启下载通知">
            <el-option label="开启" :value="1"></el-option>
            <el-option label="关闭" :value="0"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="自动下载歌词">
          <el-select v-model="settingForm.downloadLyric" class="w-full" placeholder="是否自动下载歌词">
            <el-option label="开启" :value="1"></el-option>
            <el-option label="关闭" :value="0"></el-option>
          </el-select>
        </el-form-item>

        <div class="my-6 text-18px">播放设置</div>

        <el-form-item label="播放模式">
          <el-select class="w-full" v-model="settingForm.loop">
            <el-option label="顺序播放" :value="0"></el-option>
            <el-option label="随机播放" :value="1"></el-option>
            <el-option label="单曲循环" :value="2"></el-option>
          </el-select>
        </el-form-item>

        <div class="my-6 text-18px">歌词设置</div>

        <el-form-item label="桌面歌词">
          <el-select v-model="settingForm.deskLyric" class="w-full" placeholder="是否开启桌面歌词">
            <el-option label="开启" :value="1"></el-option>
            <el-option label="关闭" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单栏歌词">
          <el-select v-model="settingForm.trayLyric" class="w-full" placeholder="是否开启菜单栏歌词">
            <el-option label="开启" :value="1"></el-option>
            <el-option label="关闭" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setDownloadPath, downloadPath } = useStore("playSetting")

const { setting, updateSetting } = useStore("playSetting")

const settingForm = ref(
  Object.assign(
    {
      skin: 0,
      loop: 0,
      downloadLyric: 0, //下载歌词
      downloadNotice: 1, // 下载通知
      deskLyric: 0, // 桌面歌词
      trayLyric: 0 // 菜单栏歌词
    },
    setting.value
  )
)

const chooseDir = () => {
  window.electron.send("select-folder", downloadPath.value)
}

window.electron.receive("select-folder-reply", (event, folder) => {
  setDownloadPath(folder)
})

watch(
  () => settingForm.value,
  (val) => {
    updateSetting(val)
  },
  {
    deep: true
  }
)
</script>

<style scoped></style>
