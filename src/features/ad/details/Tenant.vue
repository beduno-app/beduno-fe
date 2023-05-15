<template>
  <div class="row">
    <div class="col-md-4 col">
      {{ $t("roomCard.tenantInfo", { name, age }) }}
    </div>
    <div class="col-md-8 col d-flex align-items-center">
      <div
        v-for="(lang, idx) in splitLanguages"
        :key="idx"
        class="d-flex align-items-center"
      >
        <img
          :src="require(`../../../assets/img/${lang.icon}.png`)"
          :alt="lang.icon"
          class="mx-2"
        />
        <div>{{ lang.text }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
import { mapLanguageCodeToLanguageData } from "@/util";

@Options({
  props: {
    name: String,
    age: Number,
    languages: Array,
  },
  computed: {
    splitLanguages() {
      return this.languages
        .split(",")
        .filter(Boolean)
        .map(mapLanguageCodeToLanguageData);
    },
  },
})
export default class Tenant extends Vue {}
</script>

<style lang="scss"></style>
