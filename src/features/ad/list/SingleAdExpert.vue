<template>
  <div class="row">
    <div class="column pt-2 col-2">
      <div class="d-flex align-items-center">
        <font-awesome-icon
          icon="fa-solid fa-location-dot"
          class="location-icon mx-2"
        />
        <div class="d-flex flex-column">
          <span>{{advertisement.street}}</span>
          <span>{{advertisement.city}}</span>
        </div>
      </div>
    </div>
    <div class="column pt-2 col-1">
      <span>Pokój nr 1</span>
    </div>
    <div class="column pt-2 col-1">
      <span>{{advertisement.usedBeds}}</span>
    </div>
    <div class="column pt-2 col-1">
      <span>{{advertisement.numBeds - advertisement.usedBeds}}</span>
    </div>
    <div class="column pt-2 col-4">
      <div class="row">
        <div class="col-7">
          <div v-for="(tenant, idx) in advertisement.guests" :key="idx" class="">
            <div class="row">
              <div class="col-5 d-flex align-items-center">
<!--                 todo: adjust after aligning DTO -->
<!--                <img-->
<!--                  :src="require(`../../../assets/img/${tenant.icon}.png`)"-->
<!--                  :alt="tenant.icon"-->
<!--                  class="mx-1"-->
<!--                />-->
                <span>{{ tenant.text ?? tenant }}</span>
              </div>
              <div class="col-7 d-flex align-items-center">
                <img
                  src="../../../assets/img/icon_del_small_expert.png"
                  alt="remove-tenant"
                  class="cursor-pointer"
                />
                <span class="cursor-pointer">{{ $t('expertPanelView.removeTenant') }}</span>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end align-items-center pe-2">
            <img
              class="cursor-pointer"
              src="../../../assets/img/icon_add_small_expert.png"
              alt="add-tenant"
            />
            <span class="cursor-pointer">{{ $t('expertPanelView.addTenant') }}</span>
          </div>
        </div>
        <div class="col-5 d-flex align-items-center">
          <img
            class="cursor-pointer"
            src="../../../assets/img/icon_del_big_expert.png"
            alt="remove"
          />
          <div class="cursor-pointer">{{ $t('expertPanelView.removeAllTenants') }}</div>
        </div>
      </div>
    </div>
    <div class="col-3 settings pt-2">
      <div class="d-flex align-items-center">
        <div class="col-2">
          <img
            src="../../../assets/img/icon_preview.png"
            alt="nationality-icon"
            class="me-2 cursor-pointer"
          />
        </div>
        <div class="col-2 cursor-pointer">
          <p>{{ $t('expertPanelView.editAd') }}</p>
        </div>
      </div>
      <div class="d-flex pt-3">
        <div class="col-2 cursor-pointer">
          <img
            src="../../../assets/img/icon_duplicate.png"
            alt="nationality-icon"
            class="me-2"
          />
        </div>
        <div class="col-8">
          <p class="cursor-pointer">
            {{ $t('expertPanelView.createAdFromCurrent') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
   advertisement: Object,
  },
})
export default class SingleAdExpert extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.header {
  color: grey;
}
.column {
  border-right: 1px solid grey;
  border-top: 1px solid grey;
}
.settings {
  border-top: 1px solid grey;
}
.location-icon {
  color: $primary-color;
}
</style>
