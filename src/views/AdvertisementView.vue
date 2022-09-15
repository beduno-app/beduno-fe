<template>
  <div class="add container-fluid">
    <h3>Dodaj ogłoszenie</h3>
    <base-form>
      <main-section />
    </base-form>
    <base-form>
      <host-section />
    </base-form>
    <base-form>
      <description-section />
    </base-form>
    <base-form>
      <current-guests-section />
    </base-form>
    <base-form>
      <equipment-section />
    </base-form>
    <base-form>
      <payment-section />
    </base-form>
    <base-form>
      <rules-section />
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
            <span class="btn-text m-0 label">Zobacz podgląd ogłoszenia</span>
            <p class="text-small">
              (zobaczysz jak podgląd ogłoszenie przed jego publikacją)
            </p>
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
            <span class="btn-text m-0 label">Zapisz ogłoszenie</span>
            <p class="text-small">
              (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym
              momencie)
            </p>
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
            <span class="btn-text m-0 label">Opublikuj ogłoszenie</span>
            <p class="text-small">
              (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym
              momencie)
            </p>
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
            <span class="btn-text m-0 label">
              Zduplikuj ogłoszenie z wypełnionymi danymi
            </span>
            <p class="text-small">
              (zaoszczędzisz czas dodając pokoje w tym samymy budynku)
            </p>
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
export default class AdvertisementView extends Vue {}
</script>
<style>
.text-small {
  font-size: 0.7rem;
}
</style>
