<template>
  <div class="add container-fluid">
    <h3>{{ $t('advertisementView.header') }}</h3>
    <button @click="x">XXX</button>
    <button @click="y">YYY</button>
    <button @click="checkData">Check data</button>
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
        <div class="d-flex align-items-center">
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
  checkData() {
    const mainData = (this.$refs.main as any).getData();
    const hostData = (this.$refs.host as any).getData();
    const descriptionData = (this.$refs.description as any).getData();
    const guestsData = (this.$refs.guests as any).getData();
    const equipmentData = (this.$refs.equipment as any).getData();
    const paymentData = (this.$refs.payment as any).getData();
    const rulesData = (this.$refs.rules as any).getData();

    // extract hostId - separate request

    console.log({
      mainData,
      hostData,
      descriptionData,
      guestsData,
      equipmentData,
      paymentData,
      rulesData
    });

    const advertisementData = {
      hostId: '12af9758-f690-4098-9985-d9886bc62a8d',
      postCode: mainData.zipCode,
      hostStreet: mainData.street,
      numBeds: 3,
      usedBeds: 1,
      sharedBeds: true,
      language: 'pl',
      priceList: [
        {rangeFrom: 1, rangeTo: 2, value: 3},
        {rangeFrom: 4, rangeTo: 5, value: 6},
      ],
      roomEquipment: ['TV', 'RADIO'],
      sharedEquipment: ['BATHROOM', 'IRON'],
      paymentType: ['CACHE', 'BLIK'],
      rentalRules: []
    };

    // save id

    // const photosFormData = new FormData();
    // use saved id
    // iterate through photos - mainData.images
    // photosFormData.append('advertisementId', 'f3d277d0-4698-4d07-9842-4834dbc034cc')
    // photosFormData.append('photos', mainData.images[0]);
    // photosFormData.append('photos', mainData.images[1]);
  }

  x() {
    this.axios.post('http://localhost:8080/advertisement', {
      hostId: '12af9758-f690-4098-9985-d9886bc62a8d',
      postCode: '53312',
      hostStreet: 'Drukarska',
      numBeds: 3,
      usedBeds: 1,
      sharedBeds: true,
      language: 'pl',
      priceList: [
        {rangeFrom: 1, rangeTo: 2, value: 3},
        {rangeFrom: 4, rangeTo: 5, value: 6},
      ],
      roomEquipment: ['TV', 'RADIO'],
      sharedEquipment: ['BATHROOM', 'IRON'],
      paymentType: ['CACHE', 'BLIK'],
      rentalRules: []
    }, { headers: {
      'Content-Type': 'application/json'
      }})
  }

  y() {
    let formData = new FormData();

    const mainData = (this.$refs.main as any).getData();
    // console.log(mainData);
    // Object.entries(mainData).forEach(([key, value]) => {
    //   console.log(key, value);
    //   formData.append(key, value as string | Blob);
    // });
    // console.log(...formData);

    formData.append('advertisementId', 'f3d277d0-4698-4d07-9842-4834dbc034cc')
    formData.append('photos', mainData.images[0]);
    formData.append('photos', mainData.images[1]);

    this.axios.put('http://localhost:8080/advertisement/photos', formData, { headers: {
        'Content-Type': 'multipart/form-data'
      }})
  }
}
</script>
<style>
.text-small {
  font-size: 0.7rem;
}
</style>
