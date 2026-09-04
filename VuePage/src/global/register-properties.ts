import { App } from 'vue'

// App is used to determine the type
export default function registerProperties(app: App) {
	// First approach
  // app.config.globalProperties.$filters = {
  //   foo() {
  //     console.log('foo')
  //   },
  //   formatTime(value: string) {
  //     return '2023-02-22'
  //   }
  // }
  // Second approach
  app.provide('$api', (value: object) => {
    return undefined
  })
}
