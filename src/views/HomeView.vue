<template>
  <div class="home">
    <search-input />
    <h2 class="mt-3 desktop-content text-center">{{ $t('homeView.title.firstLine') }}</h2>
    <h2 class="desktop-content text-center" style="margin-left: 175px">
      {{  $t('homeView.title.secondLine') }}
    </h2>
    <cards-carousel :advertisements="advertisements" />
    <div class="container-fluid desktop-content">
      <div class="d-flex justify-content-center m-5 buttons">
        <button class="mx-4 btn-looking-for d-flex align-items-center">
          <img src="../assets/img/dot_green_big.png" />
          <span class="mx-4">{{ $t('homeView.looking') }}</span>
        </button>
        <button class="btn-offers d-flex align-items-center">
          <span class="mx-4">{{ $t('homeView.offering') }}</span>
          <img src="../assets/img/dot_orange_big.png" />
        </button>
      </div>
    </div>
    <div class="news p-5 container-fluid">
      <h2 class="join-to-room py-4 text-center">{{ $t('homeView.joinRoom') }}</h2>
      <cards-carousel-join :advertisements="advertisements" />
    </div>

    <div class="container-fluid">
      <div class="d-flex justify-content-center">
        <img
          class="mt-3"
          :width="300"
          src="../assets/img/logo_bedOK_01_OK.png"
        />
      </div>

      <p class="pt-4 text-center">{{ $t('homeView.citiesTitle') }}</p>
      <b-row>
        <b-col
          class="d-flex my-1 justify-content-center col-lg-3 col-md-6 col-sm-12"
        >
          <city-tile
            src="fot_waw_desktop_01"
            :title="'Warszawa'"
            :color="'#e67002'"
        /></b-col>
        <b-col
          class="d-flex my-1 justify-content-center col-lg-3 col-md-6 col-sm-12"
        >
          <city-tile
            src="fot_wro_desktop_01"
            :title="'Wrocław'"
            :color="'#84b02d'"
        /></b-col>
        <b-col
          class="d-flex my-1 justify-content-center col-lg-3 col-md-6 col-sm-12"
        >
          <city-tile
            src="fot_lodz_desktop_01"
            :title="'Łódź'"
            :color="'#00a0da'"
        /></b-col>
        <b-col
          class="d-flex justify-content-center col-lg-3 col-md-6 col-sm-12"
        >
          <city-tile
            src="fot_everywhere_desktop_01"
            :title="'Gdziekolwiek'"
            :color="'#d11279'"
        /></b-col>
      </b-row>

      <p class="pt-4 text-center">{{ $t('homeView.howItWorks') }}</p>
      <div class="desktop-content">
        <img
          class="img-how-it-works"
          src="../assets/img/howitworks_noframe.png"
          alt="how-it-workd-image"
        />
        <p class="py-3 text-center">{{ $t('homeView.subscribe') }}</p>
        <input
          class="d-flex m-auto"
          type="text"
          name="email"
          id="email"
          placeholder="Wpisz adres email"
        />
        <p class="mt-3 text-center link-app">
          {{ $t('homeView.freeAppLink') }}
          <img
            class="mb-1"
            :width="60"
            src="../assets/img/logo_bedOK_01_OK.png"
            alt="app-download"
          />
        </p>
      </div>
    </div>
    <div class="container-fluid">
      <img
        class="img-how-it-works-upright"
        src="../assets/img/howitworks_frame_upright.png"
        alt="image"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import CityTile from "@/features/home/CityTile.vue";
import RoomCard from "@/features/home/RoomCard.vue";
import CardsCarousel from "@/features/home/CardsCarousel.vue";
import CardsCarouselJoin from "@/features/home/CardsCarouselJoin.vue";
import SearchInput from "@/features/home/SearchInput.vue";

@Options({
  components: {
    CityTile,
    RoomCard,
    CardsCarousel,
    CardsCarouselJoin,
    SearchInput,
  },
})
export default class HomeView extends Vue {
  advertisements = [];

  mounted() {
    this.axios.get('http://localhost:8080/advertisement/list')
        .then(resp => resp.data)
        .then(advertisements => {
          this.advertisements = advertisements;
        });
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/_variables.scss";

.home {
  h2,
  span {
    font-weight: 600;
  }
  .img-how-it-works {
    width: 100%;
    border: 1px solid $dark-gray;
    padding: 30px;
    border-radius: 10px;
  }
  .img-how-it-works-upright {
    width: 100%;
    padding: 10px;
  }
  .text-center {
    font-weight: 700;
    font-size: 1.8rem;
  }
  .desktop-content {
    display: none;
  }
  .btn-save {
    font-weight: 600;
  }
  .news {
    background: $light-background;
  }
  .link-app {
    font-size: 0.9rem;
  }
  input {
    background-image: url("../assets/img/icon_save.png");
    box-sizing: border-box;
    width: 321px;
    padding-left: 42px;
    height: 48px;
    border: 1px solid $dark-gray;
    background-size: 32px;
    background-position-x: 279px;
    background-position-y: 50%;
    background-repeat: no-repeat;
    border-radius: 10px;
    cursor: pointer;
  }
  .buttons {
    button {
      border-radius: 10px;
      padding: 10px 20px;
      border: 1px solid $dark-gray;
      background: $white-color;
    }
    .btn-looking-for {
      color: $success-color;
      margin-right: 10px;
    }
    .btn-offers {
      color: $warning-color;
      margin-left: 10px;
    }
  }
  @media (min-width: 767.98px) {
    .desktop-content {
      display: block;
    }
    .img-how-it-works-upright {
      display: none;
    }
  }
}
</style>
