<template>
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

@Options({
  components: { SingleAd },
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
