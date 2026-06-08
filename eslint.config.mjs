import jsdoc from "eslint-plugin-jsdoc"
import tseslint from "typescript-eslint"
import vueParser from "vue-eslint-parser"

export default [
  {
    files: ["**/*.{js,ts,jsx,tsx,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { jsdoc },
    rules: {
      // 要求函数/类必须有 JSDoc 注释
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          contexts: ["TSMethodSignature"],
          checkGetters: false,
          checkSetters: false,
        },
      ],
      // JSDoc — 文档注释规范
      // 要求 @param 参数描述（写了 JSDoc 就要写完整）
      "jsdoc/check-access": "warn", // 要求 @access 标签有效
      "jsdoc/check-property-names": "warn", // 要求 @property 名称与实际属性匹配
      "jsdoc/check-tag-names": "warn", // 要求 JSDoc 标签名称有效
      "jsdoc/empty-tags": "warn", // 禁止空的 JSDoc 标签
      "jsdoc/implements-on-classes": "warn", // 要求 @implements 仅在类上使用
      "jsdoc/no-defaults": "warn", // 禁止 @default 与默认值重复
      "jsdoc/require-property": "warn", // 要求 @property 描述属性
      "jsdoc/require-property-description": "warn", // 要求 @property 有描述
      "jsdoc/require-property-name": "warn", // 要求 @property 有名称
      "jsdoc/require-property-type": "warn", // 要求 @property 有类型
      "jsdoc/require-returns": "warn", // 要求有返回值的函数写 @returns
      "jsdoc/require-yields": "warn", // 要求生成器函数写 @yields
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns-description": "warn",
    },
  },
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "unpackage/",
      ".pnpm-store/",
      "*.config.*",
      "auto-imports.d.ts",
      "**/auto-imports.d.ts",
      "**/*.d.ts"
    ],
  },
]
