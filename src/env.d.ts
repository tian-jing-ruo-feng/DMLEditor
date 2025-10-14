import mitt from 'mitt'

declare module 'vue' {
  interface ComponentCustomProperties {
    $emitter: typeof mitt
  }
}
