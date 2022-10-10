<template>
  <div class="row m-auto advertisement-section py-5" style="max-width: 1300px">
    <div class="col-lg-3 col-md-4 col-xl-2 mb-3">
      <img
        src="../../../assets/img/placeholder.png"
        alt="host-image"
        class="host-image"
      />
    </div>
    <div class="col-lg-5 col-md-8 pb-5">
      <div class="d-flex mb-3 align-items-center">
        <font-awesome-icon
          icon="fa-solid fa-location-dot"
          class="location-icon mx-2"
        />
        <u>Mazowieckie </u>,<u> Warszawa </u>,<u>Bemowo</u>
      </div>
      <div class="row">
        <p>Pokój prywatny w spokojnej okolicy w Warszawie</p>
      </div>
      <div class="row">
        <div class="col-sm-4 col-lg-3 col">
          <span>8 łóżek</span>
        </div>
        <div class="col-sm-8 col-lg-9 mb-2 col text-green">Wolne: 3 łóżka</div>
      </div>
      <div class="row">
        <div class="col-sm-4 col-lg-3 col">Wiadomości:</div>
        <div class="col-sm-8 col-lg-9 col text-green">1 nowa wiadomość</div>
      </div>
    </div>
    <div class="col-lg-4 col-md-12">
      <div class="d-flex align-items-end">
        <div class="col-sm-1 col-lg-2">
          <img
            src="../../../assets/img/icon_preview.png"
            alt="nationality-icon"
            class="me-2"
          />
        </div>
        <div class="col-sm-9 col-lg-10">
          <h5>Edytuj ogłoszenie</h5>
        </div>
      </div>
      <div class="d-flex pt-3">
        <div class="col-sm-1 col-lg-2">
          <img
            src="../../../assets/img/icon_duplicate.png"
            alt="nationality-icon"
            class="me-2"
          />
        </div>
        <div class="col-sm-9 col-lg-10">
          <h5>Stwórz nowe ogłoszenie na podstawie obecnego</h5>
          <p>(zaoszczędzisz czas dodajac pokoje w tym samym budynku)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Equipments from "../details/Equipments.vue";
import Host from "../details/Host.vue";
import Locator from "../details/Locator.vue";

@Options({
  components: { Equipments, Host, Locator },
})
export default class SingleAd extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";

.advertisement-section {
  font-weight: 600;
  border-bottom: 1px solid $dark-gray;
  p {
    color: $dark-gray;
  }
  .text-green {
    color: $success-color;
  }
  .location-icon {
    color: $primary-color;
  }
}
</style>
