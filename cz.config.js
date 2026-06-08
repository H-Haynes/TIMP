const { defineConfig } = require("czg")

module.exports = defineConfig({
  messages: {
    type: "选择你要提交的变更类型：",
    scope: "填写变更范围（模块/包名，可选）：",
    customScope: "输入自定义范围：",
    subject: "填写简短精炼的变更描述：\n",
    body: '填写详细的变更说明（可选，使用 "|" 换行）：\n',
    breaking: "列出任何 BREAKING CHANGE（破坏性变更，可选）：\n",
    footer: "列举关联的 issue（可选，例如 #31）：\n",
    confirmCommit: "确认提交以上信息？"
  },
  types: [
    { value: "feat", name: "feat:     ✨ 新功能", emoji: ":sparkles:" },
    { value: "fix", name: "fix:      🐛 修复缺陷", emoji: ":bug:" },
    { value: "docs", name: "docs:     📝 文档变更", emoji: ":memo:" },
    { value: "style", name: "style:    💄 样式/格式调整", emoji: ":lipstick:" },
    { value: "refactor", name: "refactor: ♻️  代码重构", emoji: ":recycle:" },
    { value: "perf", name: "perf:     ⚡ 性能优化", emoji: ":zap:" },
    { value: "test", name: "test:     ✅ 测试相关", emoji: ":white_check_mark:" },
    { value: "build", name: "build:    📦 构建/依赖", emoji: ":package:" },
    { value: "ci", name: "ci:       🎡 CI 配置", emoji: ":ferris_wheel:" },
    { value: "chore", name: "chore:    🔧 杂项/工具", emoji: ":wrench:" },
    { value: "revert", name: "revert:   ⏪ 回滚变更", emoji: ":rewind:" }
  ],
  scopes: [
    { value: "components", name: "components  共享组件" },
    { value: "utils", name: "utils       工具函数" },
    { value: "types", name: "types       类型定义" },
    { value: "styles", name: "styles      样式变量" },
    { value: "workspace", name: "workspace   工作区/根配置" }
  ],
  allowCustomScopes: true,
  allowBreakingChanges: ["feat", "fix", "refactor"],
  subjectLimit: 100,
  breaklineNumber: 100
})
