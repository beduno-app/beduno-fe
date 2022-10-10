<template>
  <div class="row row-images py-4">
    <div class="col">
      <img
        class="img-card-big p-0 room-img"
        src="../../../assets/img/placeholder.png"
      />
    </div>
    <div class="col">
      <div class="row row-images">
        <div class="col">
          <img class="room-img" src="../../../assets/img/placeholder.png" />
        </div>
        <div class="col">
          <img class="room-img" src="../../../assets/img/placeholder.png" />
        </div>
      </div>
      <div class="row row-images">
        <div class="col">
          <img class="room-img" src="../../../assets/img/placeholder.png" />
        </div>
        <div class="col">
          <img class="room-img" src="../../../assets/img/placeholder.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Gallery extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";


</style>
