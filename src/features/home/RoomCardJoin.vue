<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="card-title text-start">{{ city }}</h5>
          <span class="px-1 district">{{ $t("roomCard.district") }}</span>&nbsp;
          <span class="card-text district">{{ district }}</span>
        </div>
        <font-awesome-icon icon="fa-regular fa-heart fa-10x" />
      </div>
      <gallery :main-photo="mainPhoto" />
    </div>
    <div class="card-body">
      <ul>
        <li class="text-start">
          {{ $t("roomCard.bedsInRoom", { count: bedCount }) }}
        </li>
        <li class="text-start">700m - Biedronka</li>
      </ul>
      <div class="d-flex">
        <div v-if="roomGender === 'FEMALE'" class="text-start">{{ $t("roomCard.femaleRoom") }}</div>
        <div v-if="roomGender === 'MALE'" class="text-start">{{ $t("roomCard.maleRoom") }}</div>
        <div v-if="roomGender === 'OTHER'" class="text-start">{{ $t("roomCard.otherGenderRoom") }}</div>
        <div class="d-flex mx-2">
          <img
              v-for="id in [1,2]"
              v-if="roomGender === 'FEMALE'"
              class="img-person"
              src="../../assets/img/icon_woman.png"
              alt="icon"
          />
          <img
              v-for="id in [1,2]"
              v-if="roomGender === 'MALE'"
              class="img-person"
              src="../../assets/img/icon_man.png"
              alt="icon"
          />
          <img
              v-for="id in [1,2]"
              v-if="roomGender === 'OTHER'"
              class="img-person"
              src="../../assets/img/icon_others.png"
              alt="icon"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-4 text-start">{{ $t("roomCard.tenants") }}</div>
        <div class="col-8">
          <tenant />
          <div class="row">
            <span class="col text-start">Julka, lat 34</span>
            <div class="col d-flex align-items-center">
              <img class="img-flag" src="../../assets/img/pl.png" />
              <span class="px-2">Polski</span>
              <img class="img-flag" src="../../assets/img/uk.png" />
              <span class="px-2">Angielski</span>
            </div>
          </div>
          <div class="row">
            <span class="col text-start">Patrycja, lat 34</span>
            <div class="col d-flex align-items-center">
              <img class="img-flag" src="../../assets/img/pl.png" />
              <span class="px-2">Polski</span>
              <img class="img-flag" src="../../assets/img/uk.png" />
              <span class="px-2">Angielski</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex">
      <h5 class="px-2">{{ $t("roomCard.dayPrice", { price: bedDayPrice.toFixed(2) }) }}</h5>
    </div>
    <div class="card-footer">
      <div class="d-flex justify-content-between align-items-center btn-join">
        <span>{{ $t("roomCard.join") }}</span>
        <img class="img-join" src="../../assets/img/join_ppl.png" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Gallery from "../ad/details/Gallery.vue";

@Options({
  components: {
    Gallery,
  },
  props: {
    district: String,
    city: String,
    bedCount: Number,
    bedDayPrice: Number,
    roomGender: String,
    mainPhoto: String
  }
})
export default class RoomCard extends Vue {}
</script>

<style scoped lang="scss">
@import "@/assets/_variables.scss";
.card {
  width: 100%;
  .card-title {
    font-weight: 600;
  }
  img {
    width: 100%;
    height: 100%;
  }
  h5 {
    font-weight: 600;
  }
  .card-footer {
    background: $success-color;
    color: $white-color;
    font-size: 1.6rem;
  }
  .fa-heart {
    cursor: pointer;
  }
  ul {
    padding-left: 0.8rem;
  }
  .district {
    text-decoration: underline;
    font-weight: 600;
  }
  .img-flag {
    width: 19px;
    height: 12px;
  }
  .img-person {
    width: 20px;
    height: 20px;
  }

  .btn-join {
    cursor: pointer;
    .img-join {
      width: 50px;
    }
  }
}
</style>
