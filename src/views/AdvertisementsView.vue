<template>
  <div class="container-fluid">
    <single-ad />
    <single-ad />
    <single-full-ad />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleAd from "../features/ad/list/SingleAd.vue";
import SingleFullAd from "../features/ad/list/SingleFullAd.vue";

@Options({
  components: { SingleFullAd, SingleAd },
})
export default class AdvertisementsView extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
</style>
