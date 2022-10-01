<template>
  <div
    v-for="(equipment, idx) in equipments"
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
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Equipments extends Vue {
  equipments = [
    { content: "TV", key: "tv", icon: "tv" },
    { content: "Pralka", key: "washer", icon: "washing_machine" },
    { content: "Radio", key: "radio", icon: "icon_radio" },
    { content: "WiFi", key: "wifi", icon: "icon_wifi" },
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
