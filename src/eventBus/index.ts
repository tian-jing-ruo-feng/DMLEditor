import mitt, { Emitter } from 'mitt'

type Events = {
  /** 节点点击事件 */
  'node:click': void
  /** 空白区域点击事件 */
  'blank:click': void
}

const emitter: Emitter<Events> = mitt<Events>()

export default emitter
