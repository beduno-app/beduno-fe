<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="card-title text-start">{{ city }}</h5>
          <span class="px-1 district">Dzielnica: </span
          ><span class="card-text district">{{ district }}</span>
        </div>
        <font-awesome-icon icon="fa-regular fa-heart fa-10x" />
      </div>
      <div class="row row-images pt-4">
        <div class="col">
          <img
            class="img-card-big"
            src="../../assets/img/placeholder.png"
            alt="room-image"
          />
        </div>
        <div class="col">
          <div class="row row-images">
            <div class="col">
              <img src="../../assets/img/placeholder.png" alt="room-image" />
            </div>
            <div class="col">
              <img src="../../assets/img/placeholder.png" alt="room-image" />
            </div>
          </div>
          <div class="row row-images">
            <div class="col">
              <img src="../../assets/img/placeholder.png" alt="room-image" />
            </div>
            <div class="col">
              <img src="../../assets/img/placeholder.png" alt="room-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-body">
      <ul>
        <li class="text-start">3 łóżka w pokoju</li>
        <li class="text-start">700m - Biedronka</li>
      </ul>
      <div class="d-flex">
        <div class="text-start">Pokój żenski</div>
        <div class="d-flex mx-2">
          <img
            class="img-person"
            src="../../assets/img/icon_woman.png"
            alt="icon"
          />
          <img
            class="img-person"
            src="../../assets/img/icon_woman.png"
            alt="icon"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-4 text-start">Lokatorzy:</div>
        <div class="col-8">
          <div class="row">
            <span class="col text-start">Ania, lat 34</span>
            <div class="col d-flex">
              <img class="img-flag" src="../../assets/img/pl.png" /><span
                class="px-2"
                >Polski</span
              >
              <img class="img-flag" src="../../assets/img/uk.png" /><span
                class="px-2"
                >Angielski</span
              >
            </div>
          </div>
          <div class="row">
            <span class="col text-start">Julka, lat 34</span>
            <div class="col d-flex">
              <img class="img-flag" src="../../assets/img/pl.png" /><span
                class="px-2"
                >Polski</span
              >
              <img class="img-flag" src="../../assets/img/uk.png" /><span
                class="px-2"
                >Angielski</span
              >
            </div>
          </div>
          <div class="row">
            <span class="col text-start">Patrycja, lat 34</span>
            <div class="col d-flex">
              <img class="img-flag" src="../../assets/img/pl.png" /><span
                class="px-2"
                >Polski</span
              >
              <img class="img-flag" src="../../assets/img/uk.png" /><span
                class="px-2"
                >Angielski</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex">
      <h5 class="px-2">15 zł / dzień / łóżko</h5>
    </div>
    <div class="card-footer">
      <div class="d-flex justify-content-between align-items-center btn-join">
        <span> Dołącz do pokoju</span>
        <img class="img-join" src="../../assets/img/join_ppl.png" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    district: String,
    city: String,
  },
})
export default class RoomCard extends Vue {
  msg!: string;
}
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

  .row-images {
    --bs-gutter-x: 0.01rem;
    .img-card-big {
      padding-right: 1px;
    }
  }
}
</style>
