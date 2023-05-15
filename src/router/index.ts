import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/advertisement",
    name: "Advertisement",
    component: () =>
      import("../views/AdvertisementView.vue"),
  },
  {
    path: "/advertisements",
    name: "Advertisements",
    component: () =>
      import("../views/AdvertisementsView.vue"),
  },
  {
    path: "/advertisements/:id",
    name: "AdvertisementDetails",
    component: () =>
        import("../views/AdvertisementsDetailsView.vue"),
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
  {
    path: "/register",
    name: "Register",
    component: () =>
      import("../auth/Register.vue"),
  },
  {
    path: "/become-host",
    name: "BecomeHost",
    component: () =>
      import("../views/BecomeHostView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
