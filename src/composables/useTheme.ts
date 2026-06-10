import type { ThemeMode, CustomTheme } from "@/types/theme"
import { SKIN_TO_MODE, MODE_TO_SKIN } from "@/types/theme"

/** CSS 变量前缀 */
const CSS_VAR_PREFIX = "--timp"

/** 自定义主题 CSS 变量 → 颜色字段映射 */
const CUSTOM_COLOR_VARS: Record<string, keyof CustomTheme["colors"]> = {
  [`${CSS_VAR_PREFIX}-primary`]: "primary",
  [`${CSS_VAR_PREFIX}-bg`]: "background",
  [`${CSS_VAR_PREFIX}-surface`]: "surface",
  [`${CSS_VAR_PREFIX}-text`]: "text",
  [`${CSS_VAR_PREFIX}-text-secondary`]: "textSecondary",
  [`${CSS_VAR_PREFIX}-border`]: "border",
  [`${CSS_VAR_PREFIX}-accent`]: "accent"
}

function applyCustomCSSVars(theme: CustomTheme) {
  const root = document.documentElement
  for (const [cssVar, colorKey] of Object.entries(CUSTOM_COLOR_VARS)) {
    root.style.setProperty(cssVar, theme.colors[colorKey])
  }
}

function removeCustomCSSVars() {
  const root = document.documentElement
  for (const cssVar of Object.keys(CUSTOM_COLOR_VARS)) {
    root.style.removeProperty(cssVar)
  }
}

export function useTheme() {
  const { setting, updateSetting } = useStore("playSetting")

  const isDark = useDark({
    selector: "html",
    attribute: "class",
    valueDark: "dark",
    valueLight: "",
    storageKey: "theme-mode"
  })

  const toggleDark = useToggle(isDark)

  /** 当前主题模式 */
  const themeMode = computed<ThemeMode>(() => {
    return SKIN_TO_MODE[setting.value.skin] || "system"
  })

  /** 是否为自定义主题模式 */
  const isCustom = computed(() => themeMode.value === "custom")

  /** 当前自定义主题配置 */
  const currentCustomTheme = ref<CustomTheme | null>(null)

  let updating = false

  /**
   * 设置主题模式
   * @param mode - 主题模式
   */
  function setTheme(mode: ThemeMode) {
    updating = true
    updateSetting({ ...setting.value, skin: MODE_TO_SKIN[mode] })

    switch (mode) {
      case "system":
        isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches
        break
      case "light":
        isDark.value = false
        break
      case "dark":
        isDark.value = true
        break
      // custom 模式由 applyCustomTheme 处理
    }

    nextTick(() => {
      updating = false
    })
  }

  /**
   * 应用自定义主题（预留）
   * @param theme - 自定义主题配置
   */
  function applyCustomTheme(theme: CustomTheme) {
    currentCustomTheme.value = theme
    applyCustomCSSVars(theme)
    setTheme("custom")
  }

  /** 移除自定义主题，恢复为跟随系统 */
  function removeCustomTheme() {
    currentCustomTheme.value = null
    removeCustomCSSVars()
    setTheme("system")
  }

  // 监听系统主题变更（仅在 system 模式下生效）
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const onSystemChange = (e: MediaQueryListEvent) => {
    if (themeMode.value === "system") {
      isDark.value = e.matches
    }
  }

  onMounted(() => {
    mediaQuery.addEventListener("change", onSystemChange)

    // 初始化：根据 store 中的 skin 设置正确的初始主题
    const mode = themeMode.value
    if (mode === "system") {
      isDark.value = mediaQuery.matches
    } else if (mode === "light") {
      isDark.value = false
    } else if (mode === "dark") {
      isDark.value = true
    }
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener("change", onSystemChange)
  })

  // 当主题通过 toggle 按钮切换时（非 store 驱动），同步 store
  watch(isDark, val => {
    if (updating) {
      return
    }
    if (themeMode.value === "system") {
      return
    }
    const skin = val ? 2 : 1
    updateSetting({ ...setting.value, skin })
  })

  return {
    isDark,
    toggleDark,
    themeMode,
    isCustom,
    currentCustomTheme,
    setTheme,
    applyCustomTheme,
    removeCustomTheme
  }
}
