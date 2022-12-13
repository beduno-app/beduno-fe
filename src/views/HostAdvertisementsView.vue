<template>
  <div class="container-fluid host-advertisements">
    <div class="row">
      <div class="col-sm-9"><h3 class="pb-3">Moje ogłoszenia</h3></div>
      <div class="col-sm-3">
        <button class="panel-expert-btn">Panel EXPERT</button>
      </div>
    </div>
    <div class="active-ad pt-5">
      <div class="d-flex active cursor-pointer pb-4">
        <img
          src="../assets/img/dot_green_big.png"
          alt="green-dot"
          class="me-2"
        />
        <h4>Aktywne</h4>
      </div>
      <single-host-ad :isActive="isActive" />
      <single-host-ad :isActive="isActive" />
      <div class="d-flex justify-content-end align-items-center py-3">
        <img
          src="../assets/img/icon_duplicate.png"
          alt="add advertisement"
          class="me-3"
        />
        <h5>Dodaj nowe ogłoszenie</h5>
      </div>
    </div>
    <div class="inactive-ad pt-5">
      <div class="d-flex inactive cursor-pointer pb-4">
        <img
          src="../assets/img/dot_orange_big.png"
          alt="green-dot"
          class="me-2"
        />
        <h4>Nieaktywne</h4>
      </div>
      <single-host-ad />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleHostAd from "../features/ad/list/SingleHostAd.vue";

@Options({
  components: { SingleHostAd },
})
export default class HostAdvertisementsView extends Vue {
  isActive = true;
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.host-advertisements {
  max-width: 1300px;
  span {
    font-weight: 600;
  }

  .active {
    color: $success-color;
    border-bottom: 1px solid $dark-gray;
  }
  .inactive {
    color: $primary-color;
    border-bottom: 1px solid $dark-gray;
  }
  .panel-expert-btn {
    height: 40px;
    width: 200px;
    border-radius: 5px;
  }
}
</style>
