<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="card-title text-start">{{ city }}</h5>
          <span class="px-1">{{ $t("roomCard.district") }}&nbsp;</span>
          <span class="card-text"> {{ district }}</span>
        </div>
        <font-awesome-icon icon="fa-regular fa-heart fa-10x" />
      </div>
      <gallery />
    </div>
    <div class="card-body">
      <ul>
        <li class="text-start">
          {{ $t("roomCard.bedsInRoom", { count: 3 }) }}
        </li>
        <li class="text-start">700m-Biedronka</li>
      </ul>
      <div class="d-flex pt-2">
        <h5 class="px-2">{{ $t("roomCard.dayPrice", { price: "15 zł" }) }}</h5>
        <div>({{ $t("roomCard.bedDayPrice", { price: "5 zł" }) }})</div>
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
  },
})
export default class RoomCard extends Vue {
  msg!: string;
}
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
