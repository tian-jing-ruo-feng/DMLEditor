import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import path from 'path'

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
    scriptLoading: 'module',
    crossorigin: true,
    mountId: 'app',
  },
  // html: {
  //   template: './index.html',
  //   title: 'Database Modeler',
  //   scriptLoading: 'module',
  //   crossorigin: true,
  //   mountId: 'app',
  // },
  dev: {
    assetPrefix: '/',
  },
  output: {
    assetPrefix: '/',
    distPath: {
      root: 'dist',
      js: 'static/js',
      css: 'static/css',
      html: '',
      image: 'static/images',
      media: 'static/media',
      font: 'static/fonts',
    },
  },
})
