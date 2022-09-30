<template>
  <div class="container-fluid">
    <single-ad />
    <single-ad />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleAd from "../features/ad/list/SingleAd.vue";

@Options({
  components: { SingleAd },
})
export default class AdvertisementsView extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
</style>
