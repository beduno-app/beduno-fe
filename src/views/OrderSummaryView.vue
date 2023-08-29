<template>
  <div class="container-fluid order-summary p-4" style="max-width: 1300px">
    <h3 class="order-summary-title pb-3">{{ $t('order.header') }}</h3>
    <div class="row m-auto5">
      <div class="col-lg-9 col-md-12">
        <p>{{ advertisement?.title }}</p>
        <div class="d-flex mb-3 align-items-center">
          <font-awesome-icon
            icon="fa-solid fa-location-dot"
            class="location-icon mx-2"
          />
          <u>{{ advertisement?.city }}</u>,&nbsp;<u>{{ advertisement?.district }}</u>
        </div>

        <div class="col-sm-4 col-lg-3 col mb-3"></div>
        <div class="d-flex mb-3">
          <img src="../assets/img/icon_man_blue.png" alt="man_icon" />
          <span v-if="roomGenderText" class="mx-2">{{ $t(roomGenderText) }}</span> <span>{{ $t("roomCard.bedsInRoom", { count: advertisement?.numBeds }) }}</span>
        </div>
        <div>
          {{ $t('order.currentGuests') }}
          <tenant
            v-for="(guest, idx) in advertisement?.guestsList"
            :key="idx"
            :name="guest.name"
            :age="guest.age"
            :languages="guest.languages"
          />
          <div v-if="advertisement?.guestsList.length === 0">{{ $t('order.noGuests') }}</div>
        </div>

        <div class="row my-4">
          <h4>{{ $t('order.totalAmount', { price: totalPrice, currency: 'zł', duration: duration }) }}</h4>
        </div>
      </div>
      <div class="col-lg-1 col-md-12 d-none d-lg-block">
        <div>{{ $t('order.host') }}</div>

        <h5 class="text-end">Sara</h5>
        <div>
          <img
            src="../assets/img/fot_waw_desktop_01.jpg"
            alt="host-image"
            style="border-radius: 50%"
            :width="100"
          />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-9 col-md-12">
        <p class="details">{{ $t('order.hint') }}</p>
      </div>
      <div class="col-lg-3 col-md-12">
        <button class="cursor-pointer">{{ $t('order.proceedToPayment') }}</button>
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
  totalPrice = 0;
  duration = 0;
  advertisement;
  roomGenderText;

  mounted() {
    const { id, guestsCount, from, to } = this.$route.query;

    if (!(id && guestsCount !== null && from && to)) {
      return;
    }

    // @ts-ignore
    this.duration = (new Date(to).getTime() - new Date(from).getTime()) / 1000 / 60 / 60 / 24;

    this.axios.get(`http://localhost:8080/advertisement/details?advertisementId=${id}`)
        .then(resp => resp.data)
        .then(advertisement => {
          console.log(advertisement);
          this.totalPrice = this.duration * Number(guestsCount) * advertisement.price;
          this.advertisement = advertisement;

          this.roomGenderText = this.advertisement.roomGender === 'FEMALE'
              ? 'roomCard.femaleRoom'
              : this.advertisement.roomGender === 'MALE' ? 'roomCard.maleRoom' : 'roomCard.otherGenderRoom';
        });
  }
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
