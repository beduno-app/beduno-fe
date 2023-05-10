<template>
  <div>
    <div
      v-for="(rule, idx) in rules"
      :key="idx"
      class="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-xs-12"
    >
          <img
            :src="require(`../../../assets/img/${rule.icon}.png`)"
            class="pe-1"
          />
          {{ rule.content }}
          <span class="form-check-sign"></span>
          {{ rule.label }}: {{ rule.checked }}
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Rules extends Vue {
  rules = [
    {
      label: "Akceptujemy zwierzęta",
      key: "animals",
      icon: "icon_animals",
      checked: "NIE",
    },
    {
      label: "Cisza nocna (22:00-6:00)",
      key: "curfew",
      icon: "icon_curfew",
      checked: "TAK",
    },
    {
      label: "Palenie w budynku",
      key: "smoking",
      icon: "icon_smoking",
      checked: "TAK",
    },
  ];
}
</script>

<style lang="scss"></style>
