<template>
  <div class="row">
    <div
      v-for="(equipment, idx) in filteredEquipments"
      :key="idx"
      class="col-xl-2 col-lg-3 col-md-6 col-sm-6 col-xs-12 my-2 d-flex align-items-center"
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
  props: {
    roomEquipments: Array,
  },
  computed: {
    filteredEquipments() {
      return this.roomEquipments
        ? this.equipments.filter((equipment) =>
            this.roomEquipments.includes(equipment.key)
          )
        : [];
    },
  },
})
export default class Equipments extends Vue {
  // todo: make equipment names translatable
  equipments = [
    { content: "Brak pościeli", key: "no_linen", icon: "icon_no_linen" },
    { content: "Pralka", key: "washer", icon: "washing_machine" },
    { content: "Radio", key: "radio", icon: "icon_radio" },
    { content: "WiFi", key: "wifi", icon: "icon_wifi" },
    { content: "Okno", key: "window", icon: "icon_window" },
    { content: "Balkon", key: "balcony", icon: "icon_balcony" },
    {
      content: "Klimatyzacja",
      key: "air_conditioning",
      icon: "icon_air_conditioning",
    },
    { content: "Wentylacja", key: "tv", icon: "tv" },
    { content: "Biurko", key: "table", icon: "icon_desk" },
    { content: "Łazienka", key: "bathroom", icon: "icon_bathroom" },
    { content: "Krzesła", key: "chair", icon: "icon_chair" },
    { content: "Stolik", key: "table", icon: "icon_table" },
    { content: "Szafa", key: "wardrobe", icon: "icon_wardrobe" },
    { content: "Kołdra", key: "duvet", icon: "icon_duvet" },
    { content: "Koc", key: "blanket", icon: "icon_blanket" },
    { content: "Rolety", key: "roller_blinds", icon: "icon_roller_blinds" },
    { content: "TV", key: "tv", icon: "tv" },
    { content: "Inne", key: "others", icon: "icon_others" },
  ];
}
</script>

<style lang="scss">
#map {
  width: 200px;
  height: 200px;
  border-radius: 100%;
}
</style>
