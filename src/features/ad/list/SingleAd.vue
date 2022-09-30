<template>
  <div
    class="row justify-content-center m-auto advertisement-section py-5"
    style="max-width: 1300px"
  >
    <div class="col-md-4 col-lg-3 col-xl-2">
      <img
        src="../../../assets/img/placeholder.png"
        alt="host-image"
        class="host-image mb-2"
      />
    </div>
    <div class="col-md-5">
      <div class="d-flex mb-3">
        <u>Mazowieckie </u>,<u> Warszawa </u>,<u>Bemowo</u>
      </div>
      <div class="row"><h4>Łóżko w spokojnej okolicy w Warszawie</h4></div>
      <div class="row">
        <div class="col-xl-3 col-lg-5">
          <ul>
            <li>2 łóżka</li>
            <li>1 pokój</li>
          </ul>
        </div>
        <div class="col-md-9 mb-2">Powierzchnia pokoju: 24m<sup>2</sup></div>
      </div>
      <div class="row">
        <div
          v-for="(equipment, idx) in equipments"
          :key="idx"
          class="col-lg-3 col-md-6 col-sm-3 col-sx-12 my-2 d-flex align-items-center"
        >
          <img
            :src="require(`../../../assets/img/${equipment.icon}.png`)"
            :alt="equipment.icon"
            class="mx-1"
          />
          <span>{{ equipment.content }}</span>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="row">
        <div class="col-xxl-5 col-xl-12 col-lg-12 mb-3 meet-host meet-host">
          POZNAJ GOSPODARZA
        </div>
        <div class="col-xxl-7 col-xl-12 col-lg-12">
          <div class="row mb-2">
            <div class="col-md-6 col">
              <h3>Sara</h3>
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
            <div class="col-md-6 col">
              <img
                src="../../../assets/img/fot_lodz_desktop_01.jpg"
                alt=""
                width="80"
                height="80"
                style="border-radius: 100%"
              />
            </div>
          </div>
          <div class="row">
            <span class="my-3">Używam:</span>
            <div class="d-flex">
              <div v-for="(communicator, idx) in communicators" :key="idx">
                <img
                  :src="require(`../../../assets/img/${communicator.icon}.png`)"
                  :alt="communicator.icon"
                  class="mx-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class SingleAd extends Vue {
  equipments = [
    { content: "Krzesła", key: "chair", icon: "icon_chair" },
    { content: "Stolik", key: "table", icon: "icon_table" },
    { content: "Szafa", key: "wardrobe", icon: "icon_wardrobe" },
    { content: "Kołdra", key: "duvet", icon: "icon_duvet" },
  ];
  languages = [
    {
      value: "Polski",
      text: "Polski",
      icon: "pl",
    },
    {
      value: "English",
      text: "English",
      icon: "uk",
    },
  ];
  communicators = [
    { key: "viber", icon: "icon_viber" },
    { key: "whats-app", icon: "icon_whats_app" },
    { key: "signal", icon: "icon_signal" },
    { key: "telegram", icon: "icon_telegram" },
  ];
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.advertisement-section {
  max-width: 1300px;
  border-bottom: 1px solid $dark-gray;
  .meet-host {
    font-weight: 500;
    border-right: 1px solid $dark-gray;
    color: $dark-gray;
    text-align: end;
  }
  .host-image {
    border-radius: 15px;
    height: 180px;
  }

  @media (max-width: 1400px) {
    .meet-host {
      text-align: left;
      border-right: none;
    }
  }
}
</style>
