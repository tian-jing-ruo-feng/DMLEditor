// ESLint v9 扁平配置
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const vuePlugin = require('eslint-plugin-vue')
const prettierPlugin = require('eslint-plugin-prettier')
// 导入Vue解析器
const vueParser = require('vue-eslint-parser')

module.exports = [
  // 忽略文件配置
  {
    ignores: ['node_modules/**', 'dist/**', '*.md', '*.json'],
  },
  // JavaScript 文件的基本配置
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        // 全局变量
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      vue: vuePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // 基本规则
      'no-console': 'warn',
      'no-debugger': 'warn',

      // TypeScript 规则
      '@typescript-eslint/no-explicit-any': 'off',

      // Vue 规则
      'vue/multi-word-component-names': 'off',

      // Prettier 规则
      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          semi: false,
          singleQuote: true,
          trailingComma: 'all',
          bracketSpacing: true,
          arrowParens: 'always',
          endOfLine: 'auto',
        },
      ],
    },
  },
  // Vue 文件的特定配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // 用于解析<script>标签中的内容
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      // Vue 特定规则
      'vue/multi-word-component-names': 'off',
    },
  },
]
