<template>
  <div class="container-fluid my-4">
    <carousel :items-to-show="3" :wrap-around="true" :breakpoints="breakpoints">
      <slide v-for="ad in advertisementsData" :key="ad.id">
        <room-card
            :id="ad.id"
            :city="ad.city"
            :district="ad.district"
            :bed-count="ad.bedCount"
            :bed-day-price="ad.bedDayPrice"
            :main-photo="ad.mainPhoto"
            :other-photos="ad.otherPhotos"
        />
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
  props: {
    advertisements: {
      type: Array
    }
  },
  computed: {
    advertisementsData() {
      return this.advertisements.map(ad => ({
        id: ad.advertisementId,
        city: ad.city,
        district: ad.district,
        bedCount: ad.numBeds,
        bedDayPrice: ad.price,
        mainPhoto: ad.mainPhotos[0]?.data || '',
        otherPhotos: ad.mainPhotos.slice(1, 5).map(img => img.data)
      }))
    }
  }
})
export default class CardsCarousel extends Vue {
  breakpoints = {
    // 100px and up
    100: {
      itemsToShow: 1,
      snapAlign: "center",
    },
    // 1200 and up
    1200: {
      itemsToShow: 3,
      itemsToScroll: 1,
      snapAlign: "start",
      dir: "ltr",
      transition: 600,
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
.carousel__item {
  min-height: 200px;
  width: 100%;
  background-color: var(--vc-clr-primary);
  color: var(--vc-clr-white);
  font-size: 20px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
}

.carousel__slide {
  padding: 10px;
}

.carousel__prev,
.carousel__next {
  box-sizing: content-box;
  border: 5px solid white;
}
</style>
