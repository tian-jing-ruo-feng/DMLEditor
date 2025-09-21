import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import { pluginBabel } from '@rsbuild/plugin-babel'
// import { pluginTypeScript } from '@rsbuild/plugin-typescript';

export default defineConfig({
  plugins: [
    ,
    // pluginBabel({
    //   include: /\.(?:jsx|tsx)$/,
    // }),
    pluginVue(),
  ],
  source: {
    entry: {
      index: './src/main.ts',
    },
  },
  server: {
    port: 3001,
    // open: true,
  },
  html: {
    template: './index.html',
    title: 'Database Modeler',
    inject: 'body',
    scriptLoading: 'module',
  },
  dev: {
    assetPrefix: '/',
  },
  output: {
    assetPrefix: './',
    cleanDistPath: true,
  },
})
