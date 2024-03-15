module.exports = {

  extends: [
    "vue-global-api",
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/eslint-config-typescript", // "@vue/prettier",
    "./.eslintrc-auto-import.json" // unplugin-auto-import 自动生成的文件
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
    jsxPragma: "React",
    ecmaFeatures: {
      jsx: true,
      tsx: true
    }
  },
  plugins: ["vue", "@typescript-eslint", "prettier"],
  rules: {
    // TS
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",

    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-use-before-define": "off",

    "@typescript-eslint/no-unused-vars": "warn",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    // Vue
    "vue/no-v-html": "off",
    "vue/require-default-prop": "off",
    "vue/require-explicit-emits": "off",
    "vue/multi-word-component-names": "off",
    "vue/html-self-closing": [
      "off",
      {
        html: { void: "always", normal: "always", component: "always" },

        svg: "always",
        math: "always"
      }
    ],
    // Prettier
    "prettier/prettier": ["error", { endOfLine: "auto" }],
    "no-debugger": "off",
    // "no-unref": "off",
    "no-console": "off", // 禁止出现console
    "no-duplicate-case": "warn", // 禁止出现重复的 case 标签
    "no-empty": "warn", // 禁止出现空语句块
    "no-extra-parens": "off", // 禁止不必要的括号
    "no-func-assign": "warn", // 禁止对 function 声明重新赋值
    "no-unreachable": "warn", // 禁止在 return、throw、continue 和 break 语句之后出现不可达代码
    "default-case": "warn", // 要求 switch 语句中有 default 分支
    "dot-notation": "warn", // 强制尽可能地使用点号
    "no-else-return": "warn", // 禁止 if 语句中 return 语句之后有 else 块
    "no-empty-function": "warn", // 禁止出现空函数
    "no-lone-blocks": "warn", // 禁用不必要的嵌套块
    "no-multi-spaces": "warn", // 禁止使用多个空格
    "no-redeclare": "warn", // 禁止多次声明同一变量
    "no-return-assign": "warn", // 禁止在 return 语句中使用赋值语句
    "no-return-await": "warn", // 禁用不必要的 return await
    "no-self-assign": "warn", // 禁止自我赋值
    "no-self-compare": "warn", // 禁止自身比较
    "no-useless-catch": "warn", // 禁止不必要的 catch 子句
    "no-useless-return": "warn", // 禁止多余的 return 语句
    "no-shadow": "off", // 禁止变量声明与外层作用域的变量同名
    "no-delete-var": "off", // 允许delete变量
    "array-bracket-spacing": "warn", // 强制数组方括号中使用一致的空格
    "brace-style": "warn", // 强制在代码块中使用一致的大括号风格
    // "jsx-quotes": "warn",// 强制在 JSX 属性中一致地使用双引号或单引号
    "max-depth": "warn", // 强制可嵌套的块的最大深度4
    "max-lines": ["warn", { max: 2500 }], // 强制最大行数 300
    // "max-lines-per-function": ["warn", { max: 70 }],// 强制函数最大代码行数 50
    "max-statements": ["warn", 150], // 强制函数块最多允许的的语句数量20
    "max-nested-callbacks": ["warn", 4], // 强制回调函数最大嵌套深度
    "max-params": ["warn", 4], // 强制函数定义中最多允许的参数数量
    "max-statements-per-line": ["warn", { max: 1 }], // 强制每一行中所允许的最大语句数量
    "newline-per-chained-call": ["warn", { ignoreChainWithDepth: 3 }], // 要求方法链中每个调用都有一个换行符
    "no-lonely-if": "warn", // 禁止 if 作为唯一的语句出现在 else 语句中
    "no-mixed-spaces-and-tabs": "warn", // 禁止空格和 tab 的混合缩进
    "no-multiple-empty-lines": "warn", // 禁止出现多行空行
    "space-before-blocks": "warn", // 强制在块之前使用一致的空格
    // "space-before-function-paren": ["warn", "never"],// 强制在 function的左括号之前使用一致的空格
    "space-in-parens": "warn", // 强制在圆括号内使用一致的空格
    "space-infix-ops": "warn", // 要求操作符周围有空格
    "space-unary-ops": "warn", // 强制在一元操作符前后使用一致的空格
    // "spaced-comment": "warn",// 强制在注释中 // 或 /* 使用一致的空格
    "switch-colon-spacing": "warn", // 强制在 switch 的冒号左右有空格
    "arrow-spacing": "warn", // 强制箭头函数的箭头前后使用一致的空格
    "prefer-const": "warn",
    "prefer-rest-params": "warn",
    "no-useless-escape": "warn",
    "no-irregular-whitespace": "warn",
    "no-prototype-builtins": "warn",
    "no-fallthrough": "warn",
    "no-extra-boolean-cast": "warn",
    "no-case-declarations": "warn",
    "no-async-promise-executor": "warn",
    eqeqeq: "off", // 要求使用 === 和 !==
    curly: "warn", // 强制所有控制语句使用一致的括号风格
    semi: ["warn", "never"], // 禁止出现;
    camelcase: "warn", // 强制使用骆驼拼写法命名约定
    indent: "off" // 强制使用一致的缩进
  },
  globals: {
    // script setup
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly"
  }
}
