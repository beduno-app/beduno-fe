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
      <span>{{advertisement.occupied_beds}}</span>
    </div>
    <div class="column pt-2 col-1">
      <span>{{advertisement.free_beds}}</span>
    </div>
    <div class="column pt-2 col-4">
      <div class="row">
        <div class="col-7">
          <div v-for="(locator, idx) in advertisement.locators" :key="idx" class="">
            <div class="row">
              <div class="col-5 d-flex align-items-center">
                <img
                  :src="require(`../../../assets/img/${locator.icon}.png`)"
                  :alt="locator.icon"
                  class="mx-1"
                />
                <span>{{ locator.text }}</span>
              </div>
              <div class="col-7 d-flex align-items-center">
                <img
                  src="../../../assets/img/icon_del_small_expert.png"
                  alt="remove-locator"
                  class="cursor-pointer"
                />
                <span class="cursor-pointer">Usuń lokatora</span>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end align-items-center pe-2">
            <img
              class="cursor-pointer"
              src="../../../assets/img/icon_add_small_expert.png"
              alt="add-locator"
            />
            <span class="cursor-pointer">Dodaj lokatora</span>
          </div>
        </div>
        <div class="col-5 d-flex align-items-center">
          <img
            class="cursor-pointer"
            src="../../../assets/img/icon_del_big_expert.png"
            alt="remove"
          />
          <div class="cursor-pointer">Usuń wszystkich lokatorów</div>
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
          <p>Edytuj ogłoszenie</p>
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
            Stwórz nowe ogłoszenie na podstawie obecnego
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
export default class SingleAdExpert extends Vue {
}
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
