<template>
  <div class="row justify-content-center advertisement-section py-5">
    <div class="single-section pb-4">
      <Header :title="advertisementData.title" />
      <subheader
        :city="advertisementData.city"
        :district="advertisementData.district"
        :voivodenship="advertisementData.voivodenship"
      />
      <gallery :main-photo="mainPhoto" :other-photos="otherPhotos" />
      <div class="row">
        <div class="col-md-8 mb-3">
          <div class="row">
            <div class="col-lg-3 col-md-6 col-sm-6 col-xs-3">
              <ul>
                <li>
                  {{
                    $t("advertisementDetailsView.beds", {
                      count: advertisementData.numBeds,
                    })
                  }}
                </li>
                <!-- todo: change to data from BE -->
                <li>
                  {{ $t("advertisementDetailsView.rooms", { count: 1 }) }}
                </li>
              </ul>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-9 mb-2">
              <span class="me-1">{{ $t(roomGenderText) }}</span>
              <img :src="roomGenderIcon.src" :alt="roomGenderIcon.alt" />
            </div>
            <div class="col-lg-5">
              <div class="col-md-9 mb-2">
                {{
                  $t("advertisementDetailsView.roomArea", {
                    area: advertisementData?.roomArea,
                  })
                }}
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              {{ $t("advertisementDetailsView.sharedArea") }}
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <img
                  src="../../../assets/img/icon_exclamation_orange.png"
                  alt="icon-exclamation-orange"
                  class="pe-2"
                />

                <div class="col-lg-5 col-md-12 col shared-room">
                  {{ $t("advertisementDetailsView.roomSplitToBeds") }}
                </div>
              </div>

              <p class="room-desc">
                {{ $t("advertisementDetailsView.sharedRoom") }}
              </p>
            </div>
            <div class="col-md-6">
              <div class="d-flex">
                <img
                  src="../../../assets/img/icon_exclamation_grey.png"
                  alt="icon-exclamation-grey"
                  class="pe-2"
                  width="34"
                  height="27"
                />

                <div class="col-lg-7 col-md-12 col">
                  {{ $t("advertisementDetailsView.currentTenantsCount") }} 2
                </div>
              </div>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-sm-12 col-md-4">
              {{ $t("advertisementDetailsView.currentTenants") }}
            </div>
            <div class="col-sm-12 col-md-8">
              <tenant
                v-for="(guest, idx) in advertisementData.guests"
                :key="idx"
                :name="guest.name"
                :guests="advertisementData.guests"
                :age="new Date().getFullYear() - guest.birthYear"
                :languages="guest.languages"
              />
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <!-- skad mam wziac hosta? zakomentowalam, bo mi wywalilo apke -->
          <!-- <host :host="advertisementData?.host" /> -->
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-md-12 mb-2">
          {{ $t("advertisementDetailsView.roomEquipment") }}
        </div>
        <equipments :roomEquipments="advertisementData?.roomEquipment" />
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">
          {{ $t("advertisementDetailsView.sharedEquipment") }}
        </div>
        <shared-equipments
          :sharedEquipments="advertisementData.sharedEquipment"
        />
      </div>
    </div>
    <div class="single-section py-3">
      <description-with-map :description="advertisementData.roomDescription" />
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">
          {{ $t("advertisementDetailsView.paymentMethods") }}
        </div>
        <payments :paymentType="advertisementData.paymentType" />
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">
          {{ $t("advertisementDetailsView.rulesOfStay") }}
        </div>
        <rules :rentalRules="advertisementData.rentalRules" />
      </div>
    </div>
    <div class="py-3">
      <div class="row">
        <div class="col-md-5 mb-3">
          <div>
            {{
              $t("advertisementDetailsView.pricePerBed", {
                price: advertisementData.price,
                currency: "zł",
                duration: "1 noc",
              })
            }}
          </div>
          <div v-if="!noOrderParams">
            {{
              $t("advertisementDetailsView.totalPrice", {
                totalPrice,
                currency: "zł",
                guestsCount,
                from,
                to,
              })
            }}
          </div>
          <b-row v-if="noOrderParams">
            <b-col class="col-md-4 col-sm-12 col-12">
              <label-cols class="d-flex p-2">{{
                $t("searchInput.since")
              }}</label-cols>
              <b-form-input
                id="date-from"
                type="date"
                @blur="onFromChange($event)"
              ></b-form-input>
            </b-col>
            <b-col class="col-md-4 col-sm-12 col-12">
              <label-cols class="d-flex p-2">{{
                $t("searchInput.to")
              }}</label-cols>
              <b-form-input
                id="date-to"
                type="date"
                @blur="onToChange($event)"
              ></b-form-input>
            </b-col>
            <b-col class="col-md-4 col-sm-12 col-12">
              <label-cols class="d-flex p-2">{{
                $t("searchInput.who.label")
              }}</label-cols>
              <b-form-input
                id="guestsCount"
                type="number"
                @blur="onGuestsCountChange($event)"
                :placeholder="$t('searchInput.who.placeholder')"
              ></b-form-input>
            </b-col>
          </b-row>
        </div>
        <div class="col md-7">
          <button
            class="book-action cursor-pointer"
            :disabled="noQueryParams"
            @click="goToOrderSummary()"
          >
            <img
              src="../../../assets/img/dot_green_big.png"
              alt="green-dot"
              class="me-2"
            /><span>{{ $t("advertisementDetailsView.book") }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
import Header from "../details/Header.vue";
import Subheader from "../details/Subheader.vue";
import Gallery from "../details/Gallery.vue";
import Host from "../details/Host.vue";
import Equipments from "../details/Equipments.vue";
import SharedEquipments from "../details/SharedEquipments.vue";
import Rules from "../details/Rules.vue";
import Payments from "../details/Payments.vue";
import DescriptionWithMap from "../details/DescriptionWithMap.vue";
import Tenant from "../details/Tenant.vue";

// todo: fix scenario with no query params and let user choose dates and number of guests in the form next to book button

@Options({
  components: {
    Header,
    Subheader,
    Gallery,
    Host,
    Equipments,
    SharedEquipments,
    Rules,
    Payments,
    DescriptionWithMap,
    Tenant,
  },
  props: {
    advertisementData: Object,
    guestsCountQuery: Number,
    fromQuery: String,
    toQuery: String,
  },
  computed: {
    mainPhoto() {
      return this.advertisementData.roomPhotos
        ? this.advertisementData.roomPhotos[0]?.data
        : "";
    },
    otherPhotos() {
      return this.advertisementData.roomPhotos
        ? this.advertisementData.roomPhotos.slice(1, 5).map((img) => img.data)
        : [];
    },
    roomGenderText() {
      return this.advertisementData.roomGender === "female"
        ? "roomCard.femaleRoom"
        : this.advertisementData.roomGender === "male"
        ? "roomCard.maleRoom"
        : "roomCard.otherGenderRoom";
    },
    roomGenderIcon() {
      const icon =
        this.advertisementData.roomGender === "female"
          ? "icon_woman"
          : this.advertisementData.roomGender === "male"
          ? "icon_man"
          : "icon_people";

      return {
        alt: icon,
        src: require(`../../../assets/img/${icon}.png`),
      };
    },
    from() {
      return this.fromQuery ?? this.fromForm;
    },
    to() {
      return this.toQuery ?? this.toFrom;
    },
    guestsCount() {
      return this.guestsCountQuery ?? this.guestsCountForm;
    },
    noQueryParams() {
      return !(this.guestsCount && this.from && this.to);
    },
    totalPrice() {
      if (this.noOrderParams) {
        return 0;
      }

      const to = new Date(this.to);
      const from = new Date(this.from);
      const duration = (to.getTime() - from.getTime()) / 1000 / 60 / 60 / 24;

      return duration * this.guestsCount * this.advertisementData.price;
    },
  },
  methods: {
    onFromChange(e) {
      this.fromForm = e.target.value;
      this.noFormParams = !(this.toForm && this.guestsCountForm);
    },
    onToChange(e) {
      this.toForm = e.target.value;
      this.noFormParams = !(this.fromForm && this.guestsCountForm);
    },
    onGuestsCountChange(e) {
      this.guestsCountForm = e.target.value;
      this.noFormParams = !(this.fromForm && this.toForm);
    },
    goToOrderSummary() {
      this.$router.push({
        name: "OrderSummaryView",
        query: {
          id: this.$route.params.id,
          from: this.fromQuery,
          to: this.toQuery,
          guestsCount: this.guestsCountQuery,
        },
      });
    },
  },
})
export default class SingleAd extends Vue {
  fromForm;
  toForm;
  guestsCountForm;
  noFormParams = true;
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";

.advertisement-section {
  font-size: 0.9rem;
  max-width: 1400px;
  font-weight: 500;
  margin: auto;

  .single-section {
    border-bottom: 1px solid $dark-gray;
  }

  .heart-icon {
    color: $success-color;
  }

  .shared-room {
    color: $primary-color;
  }

  .room-desc {
    font-size: 0.8rem;
    color: $dark-gray;
  }

  .book-action {
    background-color: initial;
    border: none;
    width: 300px;
  }
}
</style>
