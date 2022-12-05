<template>
  <search-input />
  <div class="panel-expert-section container-fluid">
    <div class="d-flex align-items-center">
      <h4 class="pe-2">Panel EXPERT</h4>
      <b-form-checkbox switch size="lg"></b-form-checkbox>
    </div>
    <h3 class="pb-5">Moje ogłoszenia</h3>
    <div class="row">
      <div class="col-md-2"><span class="px-2 header">Adres:</span></div>
      <div class="col-md-1">
        <span class="header">Pokój:</span>
      </div>
      <div class="col-md-1">
        <span class="header">Zajęte łóżka:</span>
      </div>
      <div class="col-md-1"><span class="header">Wolne łóżka:</span></div>

      <div class="col-md-7">
        <span class="header">Aktualni lokatorzy:</span>
      </div>
    </div>
    <single-ad-expert />
    <single-ad-expert />
    <single-ad-expert />
  </div>
</template>

<script lang="ts">
import SingleAdExpert from "@/features/ad/list/SingleAdExpert.vue";
import { Options, Vue } from "vue-class-component";
import SearchInput from "@/features/home/SearchInput.vue";

@Options({
  components: { SingleAdExpert, SearchInput },
})
export default class AdvertisementsPanelExpert extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";

.panel-expert-section {
  font-size: 0.9rem;
  width: 1400px;
  font-weight: 500;
  margin: auto;
}
</style>
