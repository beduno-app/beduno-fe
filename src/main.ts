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

// <font-awesome-icon icon="fa-thin fa-heart" />
// /* add icons to the library */
library.add(faAngleDown)
library.add(faBars)
library.add(faCopyright)
library.add(faHeart)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

createApp(App).use(store).use(BootstrapVue3).use(router).component('font-awesome-icon', FontAwesomeIcon).mount("#app");
