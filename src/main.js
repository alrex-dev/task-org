import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

//Adding title mixin so any view or component can change the document title
import titleMixin from './mixins/titleMixin'

import './assets/style.scss'

const app = createApp(App)

app.mixin(titleMixin)

app.use(createPinia())
app.use(router)

app.config.globalProperties = {
}

app.mount('#app')
