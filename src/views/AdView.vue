<template>
  <Header />
  <div class="add container-fluid">
    <h3>Dodaj ogłoszenie</h3>
    <base-form>
      <main-section />
    </base-form>
  </div>
  <Footer />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import BaseForm from "@/features/ad/creation/BaseForm.vue";
import MainSection from "@/features/ad/creation/MainSection.vue";

import Header from "@/components/Header.vue"; // @ is an alias to /src
import Footer from "@/components/Footer.vue"; // @ is an alias to /src

@Options({
  components: {
    MainSection,
    BaseForm,
    Header,
    Footer,
  },
})
export default class AdView extends Vue {}
</script>
