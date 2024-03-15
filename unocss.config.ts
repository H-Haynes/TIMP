import { defineConfig, presetAttributify, presetUno, Rule } from "unocss"

function getSizeRules(Mapping: Record<string, string>): Rule<{}>[] {
  return Object.keys(Mapping).map((key) => {
    const value = Mapping[key]
    return [new RegExp(`^${key}(\\d+)$`), ([, d]) => ({ [value]: `${d}px` })]
  })
}

const sizeMapping: Record<string, string> = {
  h: "height",
  w: "width",
  m: "margin",
  p: "padding",
  mt: "margin-top",
  mr: "margin-right",
  ml: "margin-left",
  mb: "margin-bottom",
  pt: "padding-top",
  pr: "padding-right",
  pl: "padding-left",
  pb: "padding-bottom",
  fs: "font-size",
  br: "border-radius"
}

export default defineConfig({
  /** 排除 */
  exclude: ["node_modules", ".git", ".husky", ".vscode", "dist", "public", "build", "mock", "./stats.html"],
  /** 预设 */
  presets: [
    presetAttributify(), // 属性化模式 & 无值的属性模式
    presetUno() // 默认预设
  ],
  /** 自定义规则 */
  rules: [

    ...getSizeRules(sizeMapping)
  ],
  /** 自定义快捷方式 */
  shortcuts: {
    "border": "border-1 border-solid",
  },

  theme: {
    // extend: {
    colors: {
      red: {
        "100": "#fef4e5",
        "500": "#ff4747",
        "550": "#f23434"
      },
      light: {
        "400": "#f4f4f4"
      },
      blue: {
        "200": "#323940",
        "30": "#E9f0ff",
        "300": "#3168EC",
        "500": "#5789FF",
        "800": "#3e93d5"
      },
      orange: {
        "20": "#fffaf5",
        "30": "#fff6e6",
        "40": "#f2e4d5",
        "50": "#ffe4c7",
        "60": "#f8e0c8",
        "100": "#FFA54B",
        "500": "#ff8909",
        "600": "#FF6B3B",
        "700": "#FF7030"
      },
      yellow: {
        "50": "#FBF9F6",
        "800": "#D9A956"
      },
      gray: {
        "50": "#F8F8F8",
        "200": "#E1E1E1",
        "500": "#d5d5d5",
        "700": "#707070",
        "800": "#212121",
        "900": "#171717"
      }
    }
    // }
  }
})
