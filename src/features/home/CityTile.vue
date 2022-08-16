<template>
  <div class="card" style="width: 20rem">
    <img
      class="card-img-top"
      :src="require(`../../assets/img/${src}.jpg`)"
      alt="Card image cap"
    />
    <div class="card-body img-card-wro" :style="{ background: color }">
      <h4 class="card-title">{{ title }}</h4>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    src: String,
    title: String,
    color: String,
  },
})
export default class CityTile extends Vue {}
</script>

<style scoped lang="scss">
@import "@/assets/_variables.scss";
.card-title {
  color: white;
  font-weight: 600;
}
</style>
