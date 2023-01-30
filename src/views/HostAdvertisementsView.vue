<template>
  <div class="container-fluid host-advertisements">
    <div class="row">
      <div class="col-sm-9"><h3 class="pb-3">{{ $t('hostAdvertisementsView.myAdvertisements') }}</h3></div>
      <div class="col-sm-3">
        <button class="panel-expert-btn">{{ $t('hostAdvertisementsView.expertPanel') }}</button>
      </div>
    </div>
    <div class="active-ad pt-5">
      <div class="d-flex active cursor-pointer pb-4">
        <img
          src="../assets/img/dot_green_big.png"
          alt="green-dot"
          class="me-2"
        />
        <h4>{{ $t('hostAdvertisementsView.active') }}</h4>
      </div>
      <single-host-ad v-for="(ad, idx) in activeAdvertisements" :key="idx" :advertisement-data="ad" />
      <div class="d-flex justify-content-end align-items-center py-3">
        <img
          src="../assets/img/icon_duplicate.png"
          alt="add advertisement"
          class="me-3"
        />
        <h5>{{ $t('hostAdvertisementsView.addNewAd') }}</h5>
      </div>
    </div>
    <div class="inactive-ad pt-5">
      <div class="d-flex inactive cursor-pointer pb-4">
        <img
          src="../assets/img/dot_red_big.png"
          alt="green-dot"
          class="me-2"
        />
        <h4>{{ $t('hostAdvertisementsView.inactive') }}</h4>
      </div>
      <single-host-ad v-for="(ad, idx) in inactiveAdvertisements" :key="idx" :advertisement-data="ad" />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SingleHostAd from "../features/ad/list/SingleHostAd.vue";

@Options({
  components: { SingleHostAd },
})
export default class HostAdvertisementsView extends Vue {
  isActive = true;
  activeAdvertisements: any[] = [];
  inactiveAdvertisements: any[] = [];

  mounted() {
    // todo: use url param
    this.axios.get(`http://localhost:8080/advertisement/host?hostId=4fd1ab9b-770b-451c-be23-9b4761f9c92f`)
        .then(resp => resp.data)
        .then(advertisements => {
          advertisements.forEach(ad => {
            // todo: field not defined in DTO + improve typing
            if (ad.isActive) {
              this.activeAdvertisements.push(ad);
            } else {
              this.inactiveAdvertisements.push(ad);
            }
          })
        });
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.host-advertisements {
  max-width: 1300px;
  span {
    font-weight: 600;
  }

  .active {
    color: $success-color;
    border-bottom: 1px solid $dark-gray;
  }
  .inactive {
    color: $danger-color-alert;
    border-bottom: 1px solid $dark-gray;
  }
  .panel-expert-btn {
    height: 40px;
    width: 200px;
    border-radius: 5px;
  }
}
</style>
