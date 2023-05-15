<template>
  <div class="container-fluid order-summary p-4" style="max-width: 1300px">
    <h3 class="order-summary-title pb-3">Podsumowanie zamówienia:</h3>
    <div class="row m-auto5">
      <div class="col-lg-9 col-md-12">
        <p>Łóżko w spokojnej okolicy w Warszawie</p>
        <div class="d-flex mb-3 align-items-center">
          <font-awesome-icon
            icon="fa-solid fa-location-dot"
            class="location-icon mx-2"
          />
          <u>Mazowieckie </u>,<u> Warszawa </u>,<u>Bemowo</u>
        </div>

        <div class="col-sm-4 col-lg-3 col mb-3"></div>
        <div class="d-flex mb-3">
          <img src="../assets/img/icon_man_blue.png" alt="man_icon" />
          <span class="mx-2">Pokój męski,</span> <span>1 łóżko</span>
        </div>
        <div>
          Aktualnie zamieszkany przez:
          <tenant
            v-for="(guest, idx) in guests"
            :key="idx"
            :name="guest.name"
            :age="guest.age"
            :languages="guest.languages"
          />
        </div>

        <div class="row my-4">
          <h4>Całkowita kwota do zapłaty: 88zł (4 noce)</h4>
        </div>
      </div>
      <div class="col-lg-1 col-md-12 d-none d-lg-block">
        <div>Gospodarz:</div>

        <h5 class="text-end">Sara</h5>
        <div>
          <img
            src="../assets/img/fot_waw_desktop_01.jpg"
            alt="host-image"
            style="border-radius: 50%"
            width="100"
          />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-9 col-md-12">
        <p class="details">
          Dokładny adres i wskazówki dojazdu do miejsca zamieszkania zostaną
          udostępnione po dokonaniu płatności.
        </p>
      </div>
      <div class="col-lg-3 col-md-12">
        <button class="cursor-pointer">Przejdź do płatności</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
import Tenant from "../features/ad/details/Tenant.vue";
@Options({
  components: {
    Tenant,
  },
})
export default class OrderSummaryView extends Vue {
  guests = [
    {
      age: 23,
      name: "Sasza",
      languages: ["pl", "uk"],
    },
  ];
}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";
.order-summary {
  &-title {
    border-bottom: 1px solid $dark-gray;
  }
  button {
    border-radius: 10px;
    padding: 5px 15px;
    background: $success-color;
    border: 1px solid $success-color;
    color: white;
  }
  .details {
    font-size: 0.85rem;
  }
  .location-icon {
    color: $primary-color;
  }
}
</style>
