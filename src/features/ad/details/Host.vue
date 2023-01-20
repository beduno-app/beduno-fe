<template>
  <div class="row">
    <div class="col-xxl-5 col-xl-12 col-lg-12 mb-3 meet-host">
      {{ $t('advertisementDetailsView.host.meetTheHost') }}
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
        <span class="my-3">{{ $t('advertisementDetailsView.host.communicators') }}</span>
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
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Host extends Vue {
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

.meet-host {
  font-weight: 500;
  border-right: 1px solid $dark-gray;
  color: $dark-gray;
  text-align: end;
}
.host-image {
  border-radius: 15px;
  height: 190px;
  width: 180px;
}
@media (max-width: 1400px) {
  .meet-host {
    text-align: left;
    border-right: none;
  }
}
</style>
