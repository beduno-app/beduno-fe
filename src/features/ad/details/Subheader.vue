<template>
  <div class="row pt-3">
    <div class="col-lg-7 col-md-12 mb-3 align-items-center">
      <font-awesome-icon
        icon="fa-solid fa-location-dot"
        class="location-icon mx-2"
      />
      <u>{{ voivodenship }}</u>, <u> {{ city }} </u>, <u> {{ district }}</u>
    </div>
    <div class="col-lg-3 col-md-6 cursor-pointer">
      <font-awesome-icon
        icon="fa-regular fa-heart"
        class="mx-2 heart-icon"
        style="font-size: large"
      />{{ $t("advertisementDetailsView.subheader.markAsFavorite") }}
    </div>
    <div class="col-lg-2 col-md-6 cursor-pointer">
      <img class="mx-2" src="../../../assets/img/icon_share_orange.png" />
      {{ $t("advertisementDetailsView.subheader.share") }}
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    district: String,
    city: String,
    voivodenship: String, // todo: wait for BE to implement and (probably) rename to (probably) "province"
  },
})
export default class Subheader extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.location-icon {
  color: $primary-color;
}
</style>
