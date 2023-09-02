<template>
  <div class="row">
    <div
      v-for="(rule, idx) in filteredRules"
      :key="idx"
      class="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-xs-12"
    >
      <img
        :src="require(`../../../assets/img/${rule.icon}.png`)"
        class="pe-1"
      />
      <span class="form-check-sign"></span>
      {{ rule.label }}: {{ rule.checked }}
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
  props: { rentalRules: Array },
  computed: {
    filteredRules() {
      return this.rentalRules
        ? this.rules.map((rule) => ({
            ...rule,
            checked: this.rentalRules.includes(rule.key) ? "TAK" : "NIE",
          }))
        : [];
    },
  },
})
export default class Rules extends Vue {
  // todo: make rules and yes/no above translatable
  rules = [
    {
      label: "Akceptujemy zwierzęta",
      key: "animals",
      icon: "icon_animals",
      checked: "",
    },
    {
      label: "Cisza nocna (22:00-6:00)",
      key: "curfew",
      icon: "icon_curfew",
      checked: "",
    },
    {
      label: "Palenie w budynku",
      key: "smoking",
      icon: "icon_smoking",
      checked: "",
    },
  ];
}
</script>

<style lang="scss"></style>
