<template>
  <div class="row justify-content-center advertisement-section py-5">
    <div class="single-section pb-4">
      <Header />
      <subheader />
      <gallery />
      <div class="row">
        <div class="col-md-8 mb-3">
          <div class="row">
            <div class="col-lg-3 col-md-6 col-sm-6 col-xs-3">
              <ul>
                <li>2 łóżka</li>
                <li>1 pokój</li>
              </ul>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-9 mb-2">
              <span class="me-1">Pokój męski</span>
              <img src="../../../assets/img/icon_man.png" alt="icon-man" />
            </div>
            <div class="col-lg-5">
              <div class="col-md-9 mb-2">
                {{ $t('advertisementDetailsView.roomArea') }} 24m<sup>2</sup>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              {{ $t('advertisementDetailsView.sharedArea') }}
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <img
                  src="../../../assets/img/icon_exclamation_orange.png"
                  alt="icon-exclamation-orange"
                  class="pe-2"
                />

                <div class="col-lg-5 col-md-12 col shared-room">
                  {{ $t('advertisementDetailsView.roomSplitToBeds') }}
                </div>
              </div>

              <p class="room-desc">{{ $t('advertisementDetailsView.sharedRoom') }}</p>
            </div>
            <div class="col-md-6">
              <div class="d-flex">
                <img
                  src="../../../assets/img/icon_exclamation_grey.png"
                  alt="icon-exclamantion-grey"
                  class="pe-2"
                  width="34" height="27"
                />

                <div class="col-lg-7 col-md-12 col">
                  {{ $t('advertisementDetailsView.currentTenantsCount') }} 2
                </div>
              </div>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-sm-12 col-md-4">{{ $t('advertisementDetailsView.currentTenants') }}</div>
            <div class="col-sm-12 col-md-8">
              <tenant />
              <tenant />
              <tenant />
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <host />
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-md-12 mb-2">{{ $t('advertisementDetailsView.roomEquipment') }}</div>
        <equipments />
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">{{ $t('advertisementDetailsView.sharedEquipment') }}</div>
        <shared-equipments />
      </div>
    </div>
    <div class="single-section py-3">
      <description-with-map />
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">{{ $t('advertisementDetailsView.paymentMethods') }}</div>
        <payments />
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">{{ $t('advertisementDetailsView.rulesOfStay') }}</div>
        <rules />
      </div>
    </div>
    <div class="py-3">
      <div class="row">
        <div class="col-md-5 mb-3">{{ $t('advertisementDetailsView.pricePerBed', { price: 88, currency: 'zł', duration: '4 noce'}) }}</div>
        <div class="col md-7" style="cursor: pointer">
          <img
            src="../../../assets/img/dot_green_big.png"
            alt="green-dot"
            class="me-2"
          /><span>{{ $t('advertisementDetailsView.book') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
import Header from "../details/Header.vue";
import Subheader from "../details/Subheader.vue";
import Gallery from "../details/Gallery.vue";
import Host from "../details/Host.vue";
import Equipments from "../details/Equipments.vue";
import SharedEquipments from "../details/SharedEquipments.vue";
import Rules from "../details/Rules.vue";
import Payments from "../details/Payments.vue";
import DescriptionWithMap from "../details/DescriptionWithMap.vue";
import Tenant from "../details/Tenant.vue";

@Options({
  components: {
    Header,
    Subheader,
    Gallery,
    Host,
    Equipments,
    SharedEquipments,
    Rules,
    Payments,
    DescriptionWithMap,
    Tenant,
  },
})
export default class SingleAd extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";
.advertisement-section {
  font-size: 0.9rem;
  max-width: 1400px;
  font-weight: 500;
  margin: auto;
  .single-section {
    border-bottom: 1px solid $dark-gray;
  }
  .heart-icon {
    color: $success-color;
  }
  .shared-room {
    color: $primary-color;
  }
  .room-desc {
    font-size: 0.8rem;
    color: $dark-gray;
  }
}
</style>
