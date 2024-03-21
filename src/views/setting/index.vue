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
            <el-option label="自定义" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="settingForm.skin === 3" label="设置皮肤"></el-form-item>

        <div class="my-6 text-18px">下载设置</div>
        <el-form-item label="下载路径">
          <p>当前路径：{{ downloadPath }}</p>
          <el-button @click="chooseDir">选择文件夹</el-button>
        </el-form-item>

        <el-form-item label="下载通知">
          <el-input placeholder="请选择下载失败是否通知"></el-input>
        </el-form-item>

        <div class="my-6 text-18px">播放设置</div>

        <el-form-item label="播放顺序">
          <el-select class="w-full" v-model="settingForm.loop">
            <el-option label="顺序播放" :value="0"></el-option>
            <el-option label="随机播放" :value="1"></el-option>
            <el-option label="单曲循环" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单栏">
          <el-form-item label="菜单栏歌词">
            <el-select>
              <el-option label="显示" :value="1"></el-option>
              <el-option label="不显示" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="菜单栏控制">
            <el-select></el-select>
          </el-form-item>
        </el-form-item>
        <div class="my-6 text-18px">歌词设置</div>

        <el-form-item label="桌面歌词"> </el-form-item>
        <div class="my-6 text-18px">快捷键设置</div>

        <el-form-item label="快捷键"></el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setDownloadPath, downloadPath } = useStore("playSetting")
const settingForm = ref({
  skin: 0,
  loop: 0
})

const chooseDir = () => {
  window.electron.send("select-folder", downloadPath.value)
}

window.electron.receive("select-folder-reply", (event, folder) => {
  setDownloadPath(folder)
})
</script>

<style scoped></style>
