<template>
  <el-dialog
    v-model="visible"
    :title="updateInfo.forceUpdate ? '重要更新（必须更新）' : '发现新版本'"
    :close-on-click-modal="!updateInfo.forceUpdate"
    :close-on-press-escape="!updateInfo.forceUpdate"
    :show-close="!updateInfo.forceUpdate"
    width="420px"
    @close="onClose"
  >
    <div class="mb-4">
      <p class="text-16px font-bold">
        v{{ updateInfo.versionName }}
        <el-tag size="small" class="ml-2" :type="updateTypeTag">
          {{ updateTypeLabel }}
        </el-tag>
      </p>
      <p class="text-14px text-gray-500 mt-2" v-if="updateInfo.updateDesc">
        {{ updateInfo.updateDesc }}
      </p>
    </div>

    <el-progress
      v-if="downloadState !== 'idle'"
      :percentage="downloadPercent"
      :status="downloadState === 'error' ? 'exception' : downloadState === 'completed' ? 'success' : ''"
      class="mb-4"
    />

    <p class="text-12px text-gray-400 mb-4" v-if="downloadState === 'downloading'">
      {{ formatSize(downloadTransferred) }} / {{ formatSize(downloadTotal) }}
    </p>

    <p class="text-14px text-green-600 mb-4" v-if="downloadState === 'completed'">
      {{ completedMessage }}
    </p>

    <p class="text-14px text-red-500 mb-4" v-if="downloadState === 'error'">
      {{ errorMessage }}
    </p>

    <template #footer>
      <el-button v-if="!updateInfo.forceUpdate && downloadState === 'idle'" @click="onClose"> 稍后提醒 </el-button>
      <el-button type="primary" @click="onAction" :loading="downloadState === 'downloading'">
        {{ actionLabel }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
interface UpdateInfo {
  hasUpdate: boolean
  forceUpdate: boolean
  updateType: "wgt" | "apk" | "patch"
  versionName: string
  versionCode: number
  updateDesc: string
  wgtUrl: string
  apkUrl: string
  patchUrl: string
}

const visible = ref(false)
const updateInfo = ref<UpdateInfo>({
  hasUpdate: false,
  forceUpdate: false,
  updateType: "wgt",
  versionName: "",
  versionCode: 0,
  updateDesc: "",
  wgtUrl: "",
  apkUrl: "",
  patchUrl: ""
})

const downloadState = ref<"idle" | "downloading" | "completed" | "error">("idle")
const downloadPercent = ref(0)
const downloadTransferred = ref(0)
const downloadTotal = ref(0)
const errorMessage = ref("")
const completedFilePath = ref("")
const completedUpdateType = ref("")

const updateTypeLabel = computed(() => {
  const t = updateInfo.value.updateType
  if (t === "wgt") {
    return "热更新"
  }
  if (t === "patch") {
    return "补丁更新"
  }
  return "整包更新"
})

const updateTypeTag = computed(() => {
  const t = updateInfo.value.updateType
  if (t === "wgt" || t === "patch") {
    return "success"
  }
  return "warning"
})

const completedMessage = computed(() => {
  const t = completedUpdateType.value
  if (t === "wgt" || t === "patch") {
    return "下载完成，即将重启应用..."
  }
  if (t === "apk") {
    return "下载完成，即将自动安装..."
  }
  return "下载完成，请手动安装更新"
})

const actionLabel = computed(() => {
  if (downloadState.value === "downloading") {
    return "下载中..."
  }
  if (downloadState.value === "completed") {
    const t = completedUpdateType.value
    return t === "wgt" || t === "patch" ? "立即重启" : "安装"
  }
  if (downloadState.value === "error") {
    return "重新下载"
  }
  return "立即更新"
})

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onClose(): void {
  if (downloadState.value === "downloading") {
    window.electron.send("cancel-download")
  }
  downloadState.value = "idle"
  downloadPercent.value = 0
  visible.value = false
}

function onAction(): void {
  if (downloadState.value === "idle" || downloadState.value === "error") {
    startDownload()
  } else if (downloadState.value === "completed") {
    window.electron.send("install-update", {
      updateType: completedUpdateType.value,
      filePath: completedFilePath.value
    })
    if (completedUpdateType.value === "wgt" || completedUpdateType.value === "patch") {
      // WGT install triggers reload via main process
    } else {
      visible.value = false
    }
  }
}

function startDownload(): void {
  downloadState.value = "downloading"
  downloadPercent.value = 0
  downloadTransferred.value = 0
  downloadTotal.value = 0
  errorMessage.value = ""

  window.electron.send("start-download", updateInfo.value)
}

function open(info: UpdateInfo): void {
  updateInfo.value = info
  downloadState.value = "idle"
  downloadPercent.value = 0
  visible.value = true
}

// Listen for download progress from main process
window.electron.receive("update-download-progress", (_event, data: { percent: number; transferred: number; total: number }) => {
  if (!visible.value) {
    return
  }
  downloadPercent.value = data.percent
  downloadTransferred.value = data.transferred
  downloadTotal.value = data.total
})

window.electron.receive("update-download-completed", (_event, data: { filePath: string; updateType: string; updateInfo: UpdateInfo }) => {
  if (!visible.value) {
    return
  }
  downloadState.value = "completed"
  downloadPercent.value = 100
  completedFilePath.value = data.filePath
  completedUpdateType.value = data.updateType
})

window.electron.receive("update-download-error", (_event, message: string) => {
  if (!visible.value) {
    return
  }
  downloadState.value = "error"
  errorMessage.value = message
})

// Listen for show-update-dialog from settings
window.electron.receive("show-update-dialog", (_event, info: UpdateInfo) => {
  open(info)
})

defineExpose({ open })
</script>
