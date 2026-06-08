/**@type {import('cz-git').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 允许更长的 header
    "header-max-length": [2, "always", 100],
    // scope 可选
    "scope-empty": [0, "never"],
    // 自定义 type 枚举
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复 bug
        "docs", // 文档更新
        "style", // 代码格式（不影响逻辑）
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试
        "chore", // 构建/工具变更
        "revert", // 回滚
        "build", // 构建系统
        "ci" // CI 配置
      ]
    ]
  }
}
