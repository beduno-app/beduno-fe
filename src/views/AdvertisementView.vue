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
      <equipment-section />
    </base-form>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import BaseForm from "@/features/ad/creation/BaseForm.vue";
import MainSection from "@/features/ad/creation/MainSection.vue";
import HostSection from "@/features/ad/creation/HostSection.vue";
import DescriptionSection from "@/features/ad/creation/DescriptionSection.vue";
import EquipmentSection from "@/features/ad/creation/EquipmentSection.vue";

import Header from "@/components/Header.vue"; // @ is an alias to /src
import Footer from "@/components/Footer.vue"; // @ is an alias to /src

@Options({
  components: {
    EquipmentSection,
    DescriptionSection,
    MainSection,
    HostSection,
    BaseForm,
    Header,
    Footer,
  },
})
export default class AdvertisementView extends Vue {}
</script>
