<template>
  <div class="add container-fluid">
    <h3>{{ $t('advertisementView.header') }}</h3>
    <base-form>
      <main-section ref="main" />
    </base-form>
    <base-form>
      <host-section ref="host" />
    </base-form>
    <base-form>
      <description-section ref="description" />
    </base-form>
    <base-form>
      <current-guests-section ref="guests" />
    </base-form>
    <base-form>
      <equipment-section ref="equipment" />
    </base-form>
    <base-form>
      <payment-section ref="payment" />
    </base-form>
    <base-form>
      <rules-section ref="rules" />
    </base-form>
  </div>
  <div class="p-3 container">
    <div class="row">
      <div class="col-md-3 col-sm-6 col-sx-12">
        <div class="d-flex align-items-center">
          <img
            src="../assets/img/icon_preview.png"
            style="width: 40px; height: 40px"
            class="mx-2"
            alt="icon_preview"
          />
          <div class="pt-2 w-500">
            <span class="btn-text m-0 label">{{ $t('advertisementView.actions.preview.label') }}</span>
            <p class="text-small">{{ $t('advertisementView.actions.preview.tip') }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-sx-12">
        <div class="d-flex align-items-center">
          <img
            src="../assets/img/icon_save.png"
            style="width: 40px; height: 40px"
            class="mx-2"
            alt="icon_save"
          />
          <div class="pt-2 w-500">
            <span class="btn-text m-0 label">{{ $t('advertisementView.actions.save.label') }}</span>
            <p class="text-small">{{ $t('advertisementView.actions.save.tip') }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-sx-12">
        <div class="d-flex align-items-center" @click="publishAdvertisement">
          <img
            src="../assets/img/icon_save.png"
            style="width: 40px; height: 40px"
            class="mx-2"
            alt="icon_save"
          />
          <div class="pt-2 w-500">
            <span class="btn-text m-0 label">{{ $t('advertisementView.actions.publish.label') }}</span>
            <p class="text-small">{{ $t('advertisementView.actions.publish.tip') }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-sx-12">
        <div class="d-flex align-items-center">
          <img
            src="../assets/img/icon_duplicate.png"
            style="width: 40px; height: 40px"
            class="mx-2"
            alt="icon_duplicate"
          />
          <div class="pt-2 w-500">
            <span class="btn-text m-0 label">{{ $t('advertisementView.actions.duplicate.label') }}</span>
            <p class="text-small">{{ $t('advertisementView.actions.duplicate.tip') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import BaseForm from "@/features/ad/creation/BaseForm.vue";
import MainSection from "@/features/ad/creation/MainSection.vue";
import HostSection from "@/features/ad/creation/HostSection.vue";
import DescriptionSection from "@/features/ad/creation/DescriptionSection.vue";
import EquipmentSection from "@/features/ad/creation/EquipmentSection.vue";
import CurrentGuestsSection from "@/features/ad/creation/CurrentGuestsSection.vue";
import Header from "@/components/Header.vue"; // @ is an alias to /src
import Footer from "@/components/Footer.vue"; // @ is an alias to /src
import RulesSection from "@/features/ad/creation/RulesSection.vue";
import PaymentSection from "@/features/ad/creation/PaymentSection.vue";

@Options({
  components: {
    CurrentGuestsSection,
    EquipmentSection,
    DescriptionSection,
    PaymentSection,
    RulesSection,
    MainSection,
    HostSection,
    BaseForm,
    Header,
    Footer,
  },
})
export default class AdvertisementView extends Vue {
  publishAdvertisement() {
    const mainData = (this.$refs.main as any).getData();
    const hostData = (this.$refs.host as any).getData();
    const descriptionData = (this.$refs.description as any).getData();
    const guestsData = (this.$refs.guests as any).getData();
    const equipmentData = (this.$refs.equipment as any).getData();
    const paymentData = (this.$refs.payment as any).getData();
    const rulesData = (this.$refs.rules as any).getData();

    // todo: hide host section when user is logged in; separate request for creating host if not logged in
    // change the value according to the ID in your DB
    const hostId = '59e45463-0384-480e-8957-cae2d89717d4';

    const advertisementData = {
      hostId,
      title: mainData.title,
      district: 1, // todo: where do we get that from? should be text instead of enum
      city: mainData.city,
      postCode: mainData.zipCode,
      streetName: mainData.street,
      roomDescription: descriptionData.descriptionOwn, // todo: handle descriptions from templates
      roomArea: descriptionData.roomSize,
      roomGender: descriptionData.roomType,
      numBeds: descriptionData.bedsCount,
      usedBeds: descriptionData.bedsCount - descriptionData.freeBeds,
      price: paymentData.price,
      firstStageDiscount: paymentData.discount1,
      secondStageDiscount: paymentData.discount2,
      thirdStageDiscount: paymentData.discount3,
      fourthStageDiscount: paymentData.discount4,
      discountMonth: paymentData.discountMonth,
      paymentType: paymentData.paymentForms,
      sharedBeds: descriptionData.sharedBeds,
      language: 'pl', // todo: where do we get that from?
      roomEquipment: equipmentData.roomEquipment,
      sharedEquipment: equipmentData.commonEquipment,
      rentalRules: Object.keys(rulesData).filter(key => !!rulesData[key])
    };

    this.axios.post(
        'http://localhost:8080/advertisement',
        advertisementData,
        { headers: { 'Content-Type': 'application/json' } }
    )
        .then(response => response.data)
        .then(id => {
          if (!mainData.images || mainData.images.length === 0) {
            return;
          }

          let formData = new FormData();
          formData.append('advertisementId', id)
          mainData.images.forEach(image => {
            formData.append('photos', image);
          });

          this.axios.put(
              'http://localhost:8080/advertisement/photos',
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        });
  }
}
</script>
<style>
.text-small {
  font-size: 0.7rem;
}
</style>
