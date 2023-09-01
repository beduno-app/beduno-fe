<template>
  <div class="row">
    <div
      v-for="(equipment, idx) in filteredEquipments"
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
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
  props: { sharedEquipments: Array },

  computed: {
    filteredEquipments() {
      return this.sharedEquipments
        ? this.equipments.filter((equipment) =>
            this.sharedEquipments.includes(equipment.key)
          )
        : [];
    },
  },
})
export default class SharedEquipments extends Vue {
  equipments = [
    { content: "Kuchnia", key: "tv", icon: "icon_kitchen" },
    { content: "Piekarnik", key: "oven", icon: "icon_oven" },
    { content: "Kuchenka mikrofalowa", key: "radio", icon: "icon_microwave" },
    { content: "Zmywarka", key: "wifi", icon: "icon_dishwasher" },
    { content: "Sofa", key: "sofa", icon: "icon_sofa" },
    { content: "Stolik", key: "table", icon: "icon_table" },
    {
      content: "Naczynia",
      key: "dishes",
      icon: "icon_dishes",
    },
    { content: "Garnki i patelnie", key: "pan", icon: "icon_pan" },
    {
      content: "Suszarka do włosów",
      key: "hair_dryer",
      icon: "icon_hair_dryer",
    },
    {
      content: "Suszarka do prania",
      key: "bathRoom",
      icon: "icon_laundry_dryer",
    },
    {
      content: "Żelazko i deska do prasownia",
      key: "iron",
      icon: "icon_iron",
    },

    { content: "TV", key: "tv", icon: "tv" },
    { content: "Pralka", key: "washer", icon: "washing_machine" },
    { content: "Radio", key: "radio", icon: "icon_radio" },
    { content: "WiFi", key: "wifi", icon: "icon_wifi" },
    { content: "Okno", key: "window", icon: "icon_window" },
    { content: "Balkon", key: "balcony", icon: "icon_balcony" },
    {
      content: "Klimatyzacja",
      key: "airConditioning",
      icon: "icon_air_conditioning",
    },
    { content: "Czujnik dymu", key: "tv", icon: "tv" },
    { content: "Wentylacja", key: "ventilation", icon: "icon_ventilation" },
    { content: "Łazienka", key: "bathRoom", icon: "icon_table" },
    { content: "Prysznic", key: "showe", icon: "icon_shower" },

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
    { content: "Inne", key: "other", icon: "icon_others" },
  ];
}
</script>

<style lang="scss"></style>
