<template>
  <div class="payment-section p-3">
    <div formGroupName="paymentForms">
      <span class="label">{{ $t('advertisementView.paymentSection.paymentMethod.label') }}</span>
      <div class="row mb-4 mt-4">
        <div v-for="(form, idx) in paymentForms" :key="idx" class="col-sm-2">
          <div class="form-check">
            <label :for="form.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${form.icon}.png`)"
                class="px-1"
              />
              {{ form.content }}
              <input
                  type="checkbox"
                  :id="form.key"
                  class="form-check-input"
                  v-on:change="paymentFormChecked(form.key, $event.target.checked)"
              />
              <span class="form-check-sign"></span>
              {{ form.label }}
            </label>
          </div>
        </div>
      </div>
      <span class="label">{{ $t('advertisementView.paymentSection.pricing.label') }}</span>
      <div class="row mt-5 mx-3">
        <div class="col-md-4">
          <div class="row pb-3 align-items-center">
            <input
              type="number"
              v-model="price"
              class="col"
              style="
                max-width: 90px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.day') }}</span>
          </div>
          <div class="row pb-3 pt-4 align-items-center">
            <input
              type="number"
              class="col"
              v-model="discount1"
              style="
                max-width: 90px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.discount1') }}</span>
          </div>
        </div>

        <div class="col-md-4">
          <div class="row pb-3 align-items-center">
           <input
              type="number"
              class="col"
              v-model="discount2"
              style="
                max-width: 90px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.discount2') }}</span>
          </div>
          <div class="row pb-3 pt-4 align-items-center">
            <input
              type="number"
              class="col"
              v-model="discount3"
              style="
            max-width: 90px;
            border-radius: 10px;
            border: 1px solid grey;
          "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.discount3') }}</span>
          </div>
        </div>

        <div class="col-md-4">
          <div class="row pb-3 align-items-center">
            <input
              type="number"
              class="col"
              v-model="discount4"
              style="
                max-width: 90px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.discount4') }}</span>
          </div>
          <div class="row pb-3 pt-4 align-items-center">
            <input
              type="number"
              class="col"
              v-model="discountMonth"
              style="
                max-width: 90px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.discountMonth') }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Slider from "@vueform/slider";

@Options({ components: { Slider } })
export default class HostSection extends Vue {
  price = 0;
  discount1 = 0;
  discount2 = 0;
  discount3 = 0;
  discount4 = 0;
  discountMonth = 0;
  selectedPaymentForms = <string[]>[];
  paymentForms = [
    { label: "gotówka", key: "cash", icon: "icon_cash" },
    {
      label: "karta płatnicza/kredytowa",
      key: "credit_card",
      icon: "icon_credit_card",
    },
    {
      label: "szybki przelew",
      key: "fast_transfer",
      icon: "icon_fast_transfer",
    },
    { label: "BLIK", key: "blik", icon: "icon_BLIK" },
  ];

  paymentFormChecked(form, checked) {
    if (checked && !this.selectedPaymentForms.includes(form)) {
      this.selectedPaymentForms.push(form);
    }
    if (!checked && this.selectedPaymentForms.includes(form)) {
      this.selectedPaymentForms = this.selectedPaymentForms.filter(sf => sf !== form);
    }
  }

  getData() {
    return {
      paymentForms: this.selectedPaymentForms,
      price: this.price,
      discount1: this.discount1,
      discount2: this.discount2,
      discount3: this.discount3,
      discount4: this.discount4,
      discountMonth: this.discountMonth,
    }
  }
}
</script>
<style src="@vueform/slider/themes/default.css">
@import "@/assets/style.scss";
</style>
