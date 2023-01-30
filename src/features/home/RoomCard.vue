<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="card-title text-start">{{ city }}</h5>
          <span class="px-1">{{ $t("roomCard.district") }}</span>&nbsp;
          <span class="card-text"> {{ district }}</span>
        </div>
        <font-awesome-icon icon="fa-regular fa-heart fa-10x" />
      </div>
      <gallery :main-photo="mainPhoto" />
    </div>
    <div class="card-body">
      <ul>
        <li class="text-start">
          {{ $t("roomCard.bedsInRoom", { count: bedCount }) }}
        </li>
        <li class="text-start">700m-Biedronka</li>
      </ul>
      <div class="d-flex pt-2">
        <h5 class="px-2">{{ $t("roomCard.dayPrice", { price: (bedDayPrice * bedCount).toFixed(2) }) }}</h5>
        <div>({{ $t("roomCard.bedDayPrice", { price: bedDayPrice.toFixed(2) }) }})</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Gallery from "../ad/details/Gallery.vue";
@Options({
  components: {
    Gallery,
  },
  props: {
    district: String,
    city: String,
    bedCount: Number,
    bedDayPrice: Number,
    mainPhoto: String
  },
})
export default class RoomCard extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";

.card-title,
h5,
span {
  font-weight: 600;
}
img {
  width: 100%;
  height: 100%;
}

.fa-heart {
  cursor: pointer;
}
span {
  text-decoration: underline;
}
</style>
