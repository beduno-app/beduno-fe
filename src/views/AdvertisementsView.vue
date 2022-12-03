<template>
  <!--  todo: remove placeholder -->
  <div class="container-fluid">
    <single-ad />
    <single-ad />
    <single-full-ad />
  </div>
  <div class="container-fluid">
    <single-ad
        v-for="advertisementData in advertisements"
        :advertisement-data="advertisementData"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleAd from "../features/ad/list/SingleAd.vue";
import SingleFullAd from "../features/ad/list/SingleFullAd.vue";

@Options({
  components: { SingleFullAd, SingleAd },
})
export default class AdvertisementsView extends Vue {
  advertisements = [];

  mounted() {
    this.axios.get('http://localhost:8080/advertisement/list')
        .then(resp => resp.data)
        .then(advertisements => {
          this.advertisements = advertisements;
        });
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
</style>
