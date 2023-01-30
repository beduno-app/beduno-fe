<template>
  <div class="container-fluid">
    <single-full-ad :advertisement-data="advertisement" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleFullAd from "../features/ad/list/SingleFullAd.vue";

@Options({
  components: { SingleFullAd },
})
export default class AdvertisementsDetailsView extends Vue {
  advertisement;

  mounted() {
    // todo: take ID from the params
    this.axios.get('http://localhost:8080/advertisement/details/c3957b5f-8bda-4454-8b3d-8cb5212ce902')
        .then(resp => resp.data)
        .then(advertisement => {
          this.advertisement = advertisement;
        });
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
</style>
