<template>
  <div
    v-for="(form, idx) in paymentForms"
    :key="idx"
    class="col-xl-2 col-lg-3 col-md-6 col-sm-6 col-xs-12 p-2"
  >
        <img
          :src="require(`../../../assets/img/${form.icon}.png`)"
          class="px-1"
        />
        {{ form.content }}
        <span class="form-check-sign"></span>
        {{ form.label }}

  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Payments extends Vue {
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

<style lang="scss"></style>
