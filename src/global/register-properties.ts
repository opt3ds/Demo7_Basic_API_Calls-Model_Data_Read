import { App } from 'vue'

// App是用来确定类型
export default function registerProperties(app: App) {
	// 第一种
  // app.config.globalProperties.$filters = {
  //   foo() {
  //     console.log('foo')
  //   },
  //   formatTime(value: string) {
  //     return '2023-02-22'
  //   }
  // }
  // 第二种
  app.provide('$api', (value: object) => {
    return undefined
  })
}
