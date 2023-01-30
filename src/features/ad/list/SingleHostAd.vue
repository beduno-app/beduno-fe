<template>
  <div class="row m-auto advertisement-section py-5" style="max-width: 1300px">
    <div class="col-lg-3 col-xl-2 mb-3">
      <img
        src="../../../assets/img/placeholder.png"
        alt="host-image"
        class="host-image"
      />
    </div>
    <div class="col-lg-9 col-xl-4 pb-5">
      <div class="d-flex mb-3 align-items-center">
        <font-awesome-icon
          icon="fa-solid fa-location-dot"
          class="location-icon mx-2"
        />
        <u>{{ advertisementData.district }}</u>
      </div>
      <div class="row">
        <p>{{ advertisementData.title }}</p>
      </div>
      <div class="row">
        <div class="col-sm-4 col-lg-3 col">
          <span>8 łóżek</span>
        </div>
        <div class="col-sm-8 col-lg-9 mb-2 col text-green">{{ $t('hostAdvertisementsView.freeBeds', { count: advertisementData.numBeds - advertisementData.usedBeds }) }}</div>
      </div>
      <div class="row">
        <div class="col-sm-4 col-lg-3 col">{{ $t('hostAdvertisementsView.messages') }}</div>
        <div class="col-sm-8 col-lg-9 col text-green">{{ $t('hostAdvertisementsView.newMessagesCount', { count: 1 }) }}</div>
      </div>
    </div>
    <div class="col-lg-6 col-xl-3">
      <div class="d-flex align-items-end">
        <div class="col-sm-1 col-lg-2">
          <img
            src="../../../assets/img/icon_preview.png"
            alt="nationality-icon"
            class="me-2"
          />
        </div>
        <div class="col-sm-9 col-lg-10">
          <h5>{{ $t('hostAdvertisementsView.editAd') }}</h5>
        </div>
      </div>
      <div class="d-flex pt-3">
        <div class="col-sm-1 col-lg-2">
          <img
            src="../../../assets/img/icon_duplicate.png"
            alt="duplicate-icon"
            class="me-2"
          />
        </div>
        <div class="col-sm-9 col-lg-10">
          <h5>{{ $t('hostAdvertisementsView.createFromCurrent') }}</h5>
          <p>{{ $t('hostAdvertisementsView.createFromCurrentHint') }}</p>
        </div>
      </div>
    </div>
    <div v-if="advertisementData.isActive" class="col-lg-6 col-xl-3">
      <div class="d-flex pt-3">
        <div class="col-sm-1 col-lg-2">
          <img
            src="../../../assets/img/icon_close.png"
            alt="close-icon"
            class="me-2"
          />
        </div>
        <div class="col-sm-9 col-lg-10">
          <h5>{{ $t('hostAdvertisementsView.deactivateAd') }}</h5>
          <p>{{ $t('hostAdvertisementsView.deactivateAdHint') }}</p>
        </div>
      </div>
    </div>

    <div class="col-lg-6 col-xl-3" v-else>
      <div class="d-flex">
        <div class="col-sm-1 col-lg-2">
          <img
            src="../../../assets/img/icon_post_advertisement.png"
            alt="nationality-icon"
            class="me-2"
          />
        </div>
        <div class="col-sm-9 col-lg-10">
          <h5>{{ $t('hostAdvertisementsView.publishAd') }}</h5>
          <p>{{ $t('hostAdvertisementsView.publishAdHint') }}</p>
        </div>
      </div>
      <div class="d-flex pt-3">
        <div class="col-sm-1 col-lg-2">
          <img
            src="../../../assets/img/icon_remove_advertisement.png"
            alt="duplicate-icon"
            class="me-2"
          />
        </div>
        <div class="col-sm-9 col-lg-10">
          <h5>{{ $t('hostAdvertisementsView.removeAd') }}</h5>
          <p>{{ $t('hostAdvertisementsView.removeAdHint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Equipments from "../details/Equipments.vue";
import Host from "../details/Host.vue";
import Tenant from "../details/Tenant.vue";

@Options({
  components: { Equipments, Host, Tenant },
  props: {
    advertisementData: Object
  },
})
export default class SingleHostAd extends Vue {}
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
