<template>
  <Header />
  <div class="add container-fluid">
    <h3>Dodaj ogłoszenie</h3>
    <base-form> Tutaj beda sekcje formularza </base-form>
  </div>
  <Footer />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import BaseForm from "@/features/add/creation/BaseForm.vue";

import Header from "@/components/Header.vue"; // @ is an alias to /src
import Footer from "@/components/Footer.vue"; // @ is an alias to /src

@Options({
  components: {
    BaseForm,
    Header,
    Footer,
  },
})
export default class AddView extends Vue {}
</script>
