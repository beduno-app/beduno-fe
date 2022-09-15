<template>
  <div class="payment-secrion p-3">
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
              <input type="checkbox" :id="form.key" class="form-check-input" />
              <span class="form-check-sign"></span>
              {{ form.label }}
            </label>
          </div>
        </div>
      </div>
      <span class="label">{{ $t('advertisementView.paymentSection.pricing.label') }}</span>
      <div class="row mt-5">
        <div class="col-md-4">
          <div class="row pb-3 align-items-center">
            <Slider
              class="col-7 slider-red"
              v-model="value1"
              :min="minDay"
              :max="maxDay"
            /><input
              type="number"
              class="col"
              style="
                max-width: 50px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.day') }}</span>
            <span class="text-left">{{ $t('advertisementView.paymentSection.shortRentRange') }}</span>
          </div>
          <div class="row pb-3 pt-4 align-items-center">
            <Slider
              class="col-7"
              v-model="value2"
              :min="minDay"
              :max="maxDay"
            /><input
              type="number"
              class="col"
              style="
                max-width: 50px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.day') }}</span>
            <span class="text-left">{{ $t('advertisementView.paymentSection.shortRentRange') }}</span>
          </div>
          <div class="d-flex pb-5">
            <img
              src="../../../assets/img/icon_minus.png"
              alt="add_price"
              class="px-2"
              style="cursor: pointer"
            />
            <span>{{ $t('advertisementView.paymentSection.addPriceRange') }}</span>
          </div>
        </div>

        <div class="col-md-5">
          <div class="row pb-3 align-items-center">
            <Slider
              class="col-7"
              v-model="value3"
              :min="minMonth"
              :max="maxMonth"
            /><input
              type="number"
              class="col"
              style="
                max-width: 50px;
                border-radius: 10px;
                border: 1px solid grey;
              "
            />
            <span class="col" style="font-size: 10px">{{ $t('advertisementView.paymentSection.month') }}</span>
            <span class="text-left">{{ $t('advertisementView.paymentSection.longRentRange') }}</span>
          </div>
          <div class="d-flex">
            <img
              src="../../../assets/img/icon_minus.png"
              alt="add_price"
              class="px-2"
              style="cursor: pointer"
            />
            <span>{{ $t('advertisementView.paymentSection.addPriceRange') }}</span>
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
  value1 = [1, 10];
  value2 = [11, 15];
  value3 = [2, 5];
  minDay = 1;
  maxDay = 30;
  minMonth = 1;
  maxMonth = 12;
  selectedPaymentForm = <string[]>[];
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
}
</script>
<style src="@vueform/slider/themes/default.css">
@import "@/assets/style.scss";
</style>
