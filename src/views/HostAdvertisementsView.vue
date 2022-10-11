<template>
  <div class="container-fluid host-advertisements">
    <div class="row"><h3 class="px-4 pb-3">Moje ogłoszenia</h3></div>
    <single-host-ad />
    <single-host-ad />
    <div class="d-flex justify-content-end align-items-center py-3">
      <img
        src="../assets/img/icon_duplicate.png"
        alt="add advertisement"
        class="me-3"
      />
      <h5>Dodaj nowe ogłoszenie</h5>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleHostAd from "../features/ad/list/SingleHostAd.vue";

@Options({
  components: { SingleHostAd },
})
export default class HostAdvertisementsView extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.host-advertisements {
  max-width: 1300px;
  span {
    font-weight: 600;
  }
  h3 {
    border-bottom: 1px solid $dark-gray;
  }
}
</style>
