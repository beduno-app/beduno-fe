<template>
  <div
    class="row justify-content-center m-auto advertisement-section py-5"
    style="max-width: 1300px"
  >
    <div class="col-md-4 col-lg-3 col-xl-2 mb-4">
      <img
        src="../../../assets/img/placeholder.png"
        alt="host-image"
        class="host-image"
      />
      <font-awesome-icon
        icon="fa-regular fa-heart"
        class="mx-2 heart-icon fa-2x"
      />
      <div class="card-footer">
        <div class="d-flex justify-content-between align-items-center btn-join">
          <span>{{ $t("roomCard.join") }}</span>
          <img class="img-join" src="../../../assets/img/join_ppl.png" />
        </div>
      </div>
    </div>
    <div class="col-md-5">
      <div class="d-flex mb-3 align-items-center">
        <font-awesome-icon
          icon="fa-solid fa-location-dot"
          class="location-icon mx-2"
        />
        <u>Mazowieckie </u>,<u> Warszawa </u>,<u>Bemowo</u>
      </div>
      <div class="row"><h4>Łóżko w spokojnej okolicy w Warszawie</h4></div>
      <div class="row">
        <div class="col-xl-3 col-lg-5">
          <ul>
            <li>2 łóżka</li>
            <li>1 pokój</li>
          </ul>
        </div>
        <div class="col-md-9 mb-2">Powierzchnia pokoju: 24m<sup>2</sup></div>
      </div>
      <div class="row"><p class="locators">Aktualnie u nas mieszka: 1</p></div>
      <div class="row">
        <locator />
      </div>
      <div class="row mt-4">
        <equipments />
      </div>
      <div class="d-flex align-items-center my-3">
        <img
          src="../../../assets/img/search_green.png"
          alt="nationality-icon"
          class="me-2"
        />
        <div class="more-amenities">Zobacz pozostałe udogodnienia</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="row">
        <host />
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
  max-width: 1300px;
  border-bottom: 1px solid $dark-gray;


  .heart-icon {
    position: relative;
    top: -180px;
    left: 0;
    color: $white-color;
  }
  .locators {
    color: $primary-color;
  }
  .location-icon {
    color: $primary-color;
  }
  .more-amenities {
    font-size: 1.2rem;
  }
  .card-footer {
    background: $success-color;
    color: $white-color;
    font-size: 1rem;
    padding: 5px;
    border-radius: 5px;
    width: 180px;
    margin-top: 5px;

    .btn-join {
      cursor: pointer;

      .img-join {
        width: 40px;
      }
    }
  }

}
</style>
