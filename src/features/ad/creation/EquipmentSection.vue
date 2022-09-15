<template>
  <div class="equipment-section p-3">
    <div class="row">
      <div class="col-sx-12 col-sm-6 col-lg-2">
        <div>
          <span class="label">{{ $t('advertisementView.equipmentSection.roomEquipment.label') }}</span>
          <div
            v-for="(element, idx) in roomEquipment1"
            :key="idx"
            class="form-check pt-2"
          >
            <label :for="element.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${element.icon}.png`)"
                class="icon"
              />
              {{ element.content }}
              <input
                type="checkbox"
                :id="element.key"
                class="form-check-input"
              />
              <span class="form-check-sign"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="col-sx-12 col-sm-6 col-lg-2">
        <br />
        <div>
          <div
            v-for="(element, idx) in roomEquipment2"
            :key="idx"
            class="form-check pt-2"
          >
            <label :for="element.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${element.icon}.png`)"
                class="icon"
              />
              {{ element.content }}
              <input
                type="checkbox"
                :id="element.key"
                class="form-check-input"
              />
              <span class="form-check-sign"></span>
            </label>
          </div>
        </div>
        <FormKit
          type="text"
          :placeholder="$t('advertisementView.equipmentSection.roomEquipment.placeholder')"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
      <div class="col-sx-12 col-sm-6 col-lg-3">
        <div>
          <span class="label">{{ $t('advertisementView.equipmentSection.sharedEquipment.label') }}</span>
          <div
            v-for="(element, idx) in commonAreaEquipment1"
            :key="idx"
            class="form-check pt-2"
          >
            <label :for="element.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${element.icon}.png`)"
                class="px-1 icon"
              />
              {{ element.content }}
              <input
                type="checkbox"
                :id="element.key"
                class="form-check-input"
              />
              <span class="form-check-sign"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="col-sx-12 col-sm-6 col-lg-2">
        <div>
          <br />
          <div
            v-for="(element, idx) in commonAreaEquipment2"
            :key="idx"
            class="form-check pt-2"
          >
            <label :for="element.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${element.icon}.png`)"
                class="px-1 icon"
              />
              {{ element.content }}
              <input
                type="checkbox"
                :id="element.key"
                class="form-check-input"
              />
              <span class="form-check-sign"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="col-sx-12 col-sm-6 col-lg-2">
        <div>
          <br />
          <div
            v-for="(element, idx) in commonAreaEquipment3"
            :key="idx"
            class="form-check pt-2"
          >
            <label :for="element.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${element.icon}.png`)"
                class="px-1 icon"
              />
              {{ element.content }}
              <input
                type="checkbox"
                :id="element.key"
                class="form-check-input"
              />
              <span class="form-check-sign"></span>
            </label>
          </div>
        </div>
        <FormKit
          type="text"
          :placeholder="$t('advertisementView.equipmentSection.sharedEquipment.placeholder')"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue } from "vue-class-component";

export default class HostSection extends Vue {
  selectedEquipment = <string[]>[];
  roomEquipment1 = [
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
  ];
  roomEquipment2 = [
    { content: "Krzesła", key: "chair", icon: "icon_chair" },
    { content: "Stolik", key: "table", icon: "icon_table" },
    { content: "Szafa", key: "wardrobe", icon: "icon_wardrobe" },
    { content: "Kołdra", key: "duvet", icon: "icon_duvet" },
    { content: "Koc", key: "blanket", icon: "icon_blanket" },
    { content: "Rolety", key: "roller_blinds", icon: "icon_roller_blinds" },
    { content: "TV", key: "tv", icon: "tv" },
    { content: "Inne", key: "others", icon: "icon_others" },
  ];
  commonAreaEquipment1 = [
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
  ];
  commonAreaEquipment2 = [
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
  ];
  commonAreaEquipment3 = [
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

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@formkit/themes/genesis";
@import "@/assets/style.scss";
.equipment-section {
  font-size: 0.94rem;
}
</style>
