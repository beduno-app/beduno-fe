import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/advertisement",
    name: "advertisement",

    component: () =>
      import("../views/AdvertisementView.vue"),
  },
  {
    path: "/advertisements",
    name: "advertisements",
    component: () =>
      import("../views/AdvertisementsView.vue"),
  },
  {
    path: "/host-advertisements",
    name: "HostAdvertisements",
    component: () =>
      import("../views/HostAdvertisementsView.vue"),
  },
  {
    path: "/advertisements-panel-expert",
    name: "AdvertisementsPanelExpert",
    component: () =>
      import("../views/AdvertisementsPanelExpert.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import("../auth/Login.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
