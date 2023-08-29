<template>
  <div class="container-fluid">
    <single-ad
        v-for="advertisementData in advertisements"
        :advertisement-data="advertisementData"
        :criteria="criteria"
    />
    <div v-if="advertisements.length === 0" class="empty-list-hint">
      {{ $t('advertisements.emptyListHint') }}
    </div>
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
  criteria = {};

  mounted() {
    const queryParams = this.$route.query;
    this.criteria = {
      ...(queryParams.from ? { from: queryParams.from } : {}),
      ...(queryParams.to ? { to: queryParams.to } : {}),
      ...(queryParams.guestsCount ? { guestsCount: queryParams.guestsCount } : {}),
    };
    const data = {
        ...(queryParams.location ? { location: queryParams.location } : {}),
        ...this.criteria
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

.empty-list-hint {
  font-size: 16pt;
  margin: 24px 0;
  text-align: center;
}
</style>
