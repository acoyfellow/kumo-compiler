import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
export async function render(props) { globalThis.__events = []; return renderToString(createSSRApp(App, props)) }
