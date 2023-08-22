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
    const queryParams = this.$route.query;
    const data = {
        ...(queryParams.location ? { location: queryParams.location } : {}),
        ...(queryParams.from ? { from: queryParams.from } : {}),
        ...(queryParams.to ? { to: queryParams.to } : {}),
        ...(queryParams.guestsCount ? { guestsCount: queryParams.guestsCount } : {}),
    };
    this.axios('http://localhost:8080/advertisement/criteria', { method: 'POST', data })
        .then(resp => resp.data)
        .then(data => {
          this.advertisements = data.content;
        });
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
</style>
