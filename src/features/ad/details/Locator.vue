<template>
  <div class="row">
    <div class="col-md-4 col">Ania, lat 34</div>
    <div class="col-md-8 col d-flex align-items-center">
      <div
        v-for="(lang, idx) in languages"
        :key="idx"
        class="d-flex align-items-center"
      >
        <img
          :src="require(`../../../assets/img/${lang.icon}.png`)"
          :alt="lang.icon"
          class="mx-1"
        />
        <span>{{ lang.text }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Locator extends Vue {
  languages = [
    { content: "polski", key: "polish", text: "Polski", icon: "pl" },
    { content: "angielski", key: "englsh", text: "Angielski", icon: "uk" },
  ];
}
</script>

<style lang="scss"></style>
