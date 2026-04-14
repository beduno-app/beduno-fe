import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import pinia from './app/plugins/pinia'
import i18n from './app/plugins/i18n'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
