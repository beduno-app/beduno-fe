import { createApp } from "vue";

import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import BootstrapVue3 from 'bootstrap-vue-3'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {  faAngleDown } from '@fortawesome/free-solid-svg-icons'
import {faBars}  from '@fortawesome/free-solid-svg-icons'
import {faCopyright}  from '@fortawesome/free-solid-svg-icons'
import {faHeart}  from '@fortawesome/free-regular-svg-icons'

import { UploadMedia, UpdateMedia } from 'vue-media-upload';

// /* add icons to the library */

library.add(faAngleDown)
library.add(faBars)
library.add(faCopyright)
library.add(faHeart)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

import { plugin, defaultConfig } from '@formkit/vue'
import '@formkit/themes/genesis'
import { createI18n } from 'vue-i18n';
import translations from './assets/translations';

const i18n = createI18n({
    locale: 'pl',
    messages: translations,
    globalInjection: true
});

createApp(App).use(store).use(i18n).use(BootstrapVue3).use(router).use(
    plugin,
    defaultConfig({
        theme: 'genesis'
    })
  ).component('font-awesome-icon', FontAwesomeIcon).component('upload-media' , UploadMedia).component('update-media' , UpdateMedia).mount("#app");
