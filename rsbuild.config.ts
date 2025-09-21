import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'

export default defineConfig({
  plugins: [pluginVue()],
  source: {
    entry: {
      index: './src/main.ts',
    },
  },
  server: {
    port: 3001,
  },
  html: {
    template: './index.html',
    title: 'Database Modeler',
  },
  dev: {
    assetPrefix: '/',
  },
  output: {
    assetPrefix: '/DMLEditor/',
  },
})
