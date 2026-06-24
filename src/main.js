import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initStorage } from './data/storage'

// 异步初始化存储后再挂载应用
initStorage().then(() => {
  createApp(App).use(router).mount('#app')
})
