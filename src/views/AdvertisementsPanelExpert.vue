<template>
  <div>
    <search-input />
    <div class="scroll">
      <table class="table table-responsive">
        <div class="panel-expert-section container-fluid">
          <div class="d-flex align-items-center">
            <h4 class="pe-5">{{ $t('expertPanelView.expertPanel') }}</h4>
            <b-form-checkbox switch size="lg"></b-form-checkbox>
          </div>
          <h3 class="pb-5">{{ $t('expertPanelView.myAdvertisements') }}</h3>
          <div class="row">
            <div class="col-2"><span class="px-2 header">{{ $t('expertPanelView.address') }}</span></div>
            <div class="col-1">
              <span class="header">{{ $t('expertPanelView.room') }}</span>
            </div>
            <div class="col-1">
              <span class="header">{{ $t('expertPanelView.occupiedBeds') }}</span>
            </div>
            <div class="col-1"><span class="header">{{ $t('expertPanelView.freeBeds') }}</span></div>

            <div class="col-7">
              <span class="header">{{ $t('expertPanelView.currentTenants') }}</span>
            </div>
          </div>
          <single-ad-expert
            v-for="(advertisement, idx) in advertisements"
            :key="idx"
            :advertisement="advertisement"
          />
          <div class="d-flex justify-content-end align-items-center py-4">
            <img
              src="../assets/img/icon_add_big_expert.png"
              class="cursor-pointer"
            />
            <h5 class="cursor-pointer">{{ $t('expertPanelView.createAd') }}</h5>
          </div>
        </div>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import SingleAdExpert from "@/features/ad/list/SingleAdExpert.vue";
import { Options, Vue } from "vue-class-component";
import SearchInput from "@/features/home/SearchInput.vue";

@Options({
  components: { SingleAdExpert, SearchInput },
})
export default class AdvertisementsPanelExpert extends Vue {
  advertisements = [
    {
      street: "ul. Kokosowa",
      city: "Warszawa",
      usedBeds: "2",
      numBeds: "2",
      guests: [
        { content: "polski", key: "polish", text: "Grzegorz", icon: "pl" },
        { content: "angielski", key: "englsh", text: "Jennifer", icon: "uk" },
      ],
    },
    {
      street: "ul. Kokosowa",
      city: "Warszawa",
      usedBeds: "2",
      numBeds: "2",
      guests: [
        { content: "polski", key: "polish", text: "Grzegorz", icon: "pl" },
        { content: "angielski", key: "englsh", text: "Jennifer", icon: "uk" },
      ],
    },
  ];

  mounted() {
    // todo: use url param
    this.axios.get(`/advertisement/host?hostId=4fd1ab9b-770b-451c-be23-9b4761f9c92f`)
        .then(resp => resp.data)
        .then(advertisements => {
          this.advertisements = advertisements;
        });
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";

.panel-expert-section {
  font-size: 0.9rem;
  width: 1400px;
  font-weight: 500;
  margin: auto;
}
.scroll {
  overflow-x: scroll;
}
.form-check-input:checked {
  background-color: $success-color !important;
  border-color: $success-color !important;
}
</style>
