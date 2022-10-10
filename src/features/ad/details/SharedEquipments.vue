<template>
  <div
    v-for="(equipment, idx) in sharedEquipments"
    :key="idx"
    class="col-xl-2 col-lg-3 col-md-6 col-sm-6 col-xs-12 p-1 d-flex align-items-center"
  >
    <img
      :src="require(`../../../assets/img/${equipment.icon}.png`)"
      :alt="equipment.icon"
      class="mx-1"
    />
    <span>{{ equipment.content }}</span>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class SharedEquipments extends Vue {
  sharedEquipments = [
    { content: "Toaleta", key: "toilet", icon: "icon_toilet" },
    {
      content: "Ekspres do kawy",
      key: "coffee_machine",
      icon: "icon_coffee_machine",
    },
    { content: "Czujnik elektryczny", key: "sensor", icon: "icon_sensor" },
    {
      content: "Odkurzacz",
      key: "icon_vacuum_cleaner",
      icon: "icon_vacuum_clenaer",
    },
  ];
}
</script>

<style lang="scss"></style>
