<template>
  <div class="container-fluid my-4">
    <carousel :items-to-show="3" :wrap-around="true" :breakpoints="breakpoints">
      <slide v-for="slide in slides" :key="slide">
        <room-card :city="slide.city" :district="slide.district" />
      </slide>

      <template #addons>
        <navigation />
      </template>
    </carousel>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";

import "vue3-carousel/dist/carousel.css";
import RoomCard from "./RoomCard.vue";

@Options({
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation,
    RoomCard,
  },
})
export default class CardsCarousel extends Vue {
  slides = [
    { id: "1", city: "Warszawa", district: "Bemowo" },
    { id: "2", city: "Lódź", district: "Bałuty" },
    { id: "3", city: "Wrocław", district: "Psie Pole" },
    { id: "4", city: "Warszawa", district: "Bemowo" },
    { id: "5", city: "Lódź", district: "Bałuty" },
    { id: "6", city: "Wrocław", district: "Psie Pole" },
  ];
  breakpoints = {
    // 100px and up
    100: {
      itemsToShow: 1,
      snapAlign: "center",
    },
    // 1024 and up
    1200: {
      itemsToShow: 3,
      snapAlign: "start",
      itemsToScroll: 3,
    },
  };
}
</script>

<style>
@import "@/assets/_variables.scss";

.container-fluid {
  --bs-gutter-x: 8rem !important;
}
:root {
  --vc-clr-primary: grey;
}
.card {
  width: 100%;
}
</style>
