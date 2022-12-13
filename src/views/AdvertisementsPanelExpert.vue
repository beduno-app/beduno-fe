<template>
  <search-input />
  <div class="scroll">
    <table class="table table-responsive">
      <div class="panel-expert-section container-fluid">
        <div class="d-flex align-items-center">
          <h4 class="pe-5">Panel EXPERT</h4>
          <b-form-checkbox switch size="lg"></b-form-checkbox>
        </div>
        <h3 class="pb-5">Moje ogłoszenia</h3>
        <div class="row">
          <div class="col-2"><span class="px-2 header">Adres:</span></div>
          <div class="col-1">
            <span class="header">Pokój:</span>
          </div>
          <div class="col-1">
            <span class="header">Zajęte łóżka:</span>
          </div>
          <div class="col-1"><span class="header">Wolne łóżka:</span></div>

          <div class="col-7">
            <span class="header">Aktualni lokatorzy:</span>
          </div>
        </div>
        <single-ad-expert />
        <single-ad-expert />
        <single-ad-expert />
        <div class="d-flex justify-content-end align-items-center py-4">
          <img
            src="../assets/img/icon_add_big_expert.png"
            class="cursor-pointer"
          />
          <h5 class="cursor-pointer">Dodaj nowe ogłoszenie</h5>
        </div>
      </div>
    </table>
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
@import "@/assets/style.scss";


.panel-expert-section {
  font-size: 0.9rem;
  width: 1400px;
  font-weight: 500;
  margin: auto;
}
.scroll {
  overflow-x: scroll;
}
.form-check-input:checked {
  background-color: $success-color !important;
  border-color: $success-color !important;
}
</style>
