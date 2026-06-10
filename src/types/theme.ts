/** 主题模式 */
export type ThemeMode = "system" | "light" | "dark" | "custom"

/** skin 数值 → ThemeMode 映射 */
export const SKIN_TO_MODE: Record<number, ThemeMode> = {
  0: "system",
  1: "light",
  2: "dark"
}

/** ThemeMode → skin 数值映射 */
export const MODE_TO_SKIN: Record<ThemeMode, number> = {
  system: 0,
  light: 1,
  dark: 2,
  custom: 3
}

/** 自定义主题配置（预留） */
export interface CustomTheme {
  name: string
  colors: {
    /** 主色调 */
    primary: string
    /** 背景色 */
    background: string
    /** 卡片/面板背景 */
    surface: string
    /** 主文字色 */
    text: string
    /** 次要文字色 */
    textSecondary: string
    /** 边框色 */
    border: string
    /** 强调色 */
    accent: string
  }
}
