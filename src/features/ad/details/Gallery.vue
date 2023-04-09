<template>
  <div class="row row-images py-4">
    <div class="col">
      <img
        class="img-card-big p-0 room-img"
        :src="photo"
      />
    </div>
    <div class="col">
      <div class="row row-images">
        <div class="col">
          <img class="room-img" :src="photos[0]" />
        </div>
        <div class="col">
          <img class="room-img" :src="photos[1]" />
        </div>
      </div>
      <div class="row row-images">
        <div class="col">
          <img class="room-img" :src="photos[2]" />
        </div>
        <div class="col">
          <img class="room-img" :src="photos[3]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    mainPhoto: String,
    otherPhotos: Array
  },
  computed: {
    photo() {
      return `data:image/png;base64,${this.mainPhoto?.toString('base64')}`;
    },
    photos() {
      return [0, 1, 2, 3].map(id => {
          const img = this.otherPhotos[id];
          return img ? `data:image/png;base64,${img.toString('base64')}` : require('../../../assets/img/placeholder.png');
      })
    }
  }
})
export default class Gallery extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";


</style>
