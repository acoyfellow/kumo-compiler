import { createSSRApp } from 'vue'
import App from './App.vue'
const props = JSON.parse(document.querySelector('#app').dataset.props)
globalThis.__events = []
createSSRApp(App, props).mount('#app')
globalThis.__hydrated = true
