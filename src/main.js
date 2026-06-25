import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initStorage } from './data/storage'

// 先加载静态 JSON 数据，再挂载应用，避免首屏读取到空缓存。
initStorage().then(() => {
  createApp(App).use(router).mount('#app')
})
