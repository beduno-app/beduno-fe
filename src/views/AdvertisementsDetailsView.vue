<template>
  <div v-if="advertisement !== null" class="container-fluid">
    <single-full-ad
        :advertisement-data="advertisement"
        :guests-count-query="guestsCount"
        :from-query="from"
        :to-query="to"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleFullAd from "../features/ad/list/SingleFullAd.vue";

@Options({
  components: { SingleFullAd },
})
export default class AdvertisementsDetailsView extends Vue {
  advertisement = null;
  guestsCount;
  from;
  to;

  mounted() {
    const { guestsCount, from, to } = this.$route.query;
    this.guestsCount = guestsCount;
    this.from = from;
    this.to = to;

    const { id } = this.$route.params;
    this.axios.get(`http://localhost:8080/advertisement/details?advertisementId=${id}`)
        .then(resp => resp.data)
        .then(advertisement => {
          console.log(advertisement);
          // todo: remove mock data after handling reservations
          this.advertisement = {
              ...advertisement,
              guestsList: [
                  { name: 'Dawid', age: 30, languages: 'pl,en,de'},
                  { name: 'Anita', age: 34, languages: 'pl,en'},
              ]
          };
        });
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
</style>
