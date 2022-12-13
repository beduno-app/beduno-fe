<template>
  <div class="row">
    <div class="col-lg-7 col-md-12 mb-3 align-items-center">
      <font-awesome-icon
        icon="fa-solid fa-location-dot"
        class="location-icon mx-2"
      />
      <u>Mazowieckie </u>,<u> Warszawa </u>,<u>Bemowo</u>
    </div>
    <div class="col-lg-3 col-md-6">
      <font-awesome-icon
        icon="fa-regular fa-heart"
        class="mx-2 heart-icon"
        style="font-size: large"
      />Dodaj do ulubionych
    </div>
    <div class="col-lg-2 col-md-6">
      <img class="mx-2" src="../../../assets/img/icon_share_orange.png" />
      Udostępnij
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Subheader extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.location-icon {
  color: $primary-color;
}
</style>
