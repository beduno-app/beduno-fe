<template>
  <div class="footer p-4 my-8">
    <div class="container">
      <button class="btn-landlord">
        <span class="mx-4">Zostań wynajmującym bez opłat</span
        ><img width="30" src="../assets/img/kropek_orange_big.png" />
      </button>
      <b-row>
        <b-col class="col-sm-4 col">
          <div class="d-flex">
            <img
              class="dot-big"
              width="20"
              height="20"
              src="../assets/img/kropek_green.png"
              alt="img-square"
            />
            <h5>Informacje</h5>
          </div>
          <ul class="text-start">
            <li>Ceny</li>
            <li>Lista miast</li>
            <li>Program partnerski</li>
            <li>Pytania i odpowiedzi Q&A</li>
            <li>Centrum pomocy</li>
            <li>Kontakt</li>
          </ul>
        </b-col>
        <b-col class="col-sm-4 col">
          <ul class="text-start" style="padding-top: 32px">
            <li>O bed!OK</li>
            <li>Kariera</li>
            <li>Informacje</li>
            <li>Zasady współpracy</li>
            <li>Oświadczenie o ochronie prywatności i plikach cookies</li>
            <li>Zarządzaj ustawieniami dotyczącymi plików cookies</li>
          </ul>
        </b-col>
        <b-col class="col-sm-4 col text-start">
          <div class="d-flex">
            <img
              class="dot-big"
              width="20"
              height="20"
              src="../assets/img/kropek_orange.png"
              alt="img-square"
            />
            <h5>klient</h5>
          </div>
          <ul class="text-start">
            <li>Logowanie</li>
            <li>Rejestracja</li>
            <li>Oferty specjalne</li>
          </ul>
        </b-col>
      </b-row>
    </div>
  </div>
  <p class="p-3 text-center">
    Prawa autorskie <font-awesome-icon icon="fa-solid fa-copyright" /> 2022
    bed!Ok. Wszelkie prawa autorskie zastrzeżone.
  </p>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class Footer extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";

.footer {
  background: $black-bg;
  color: $light-gray;
  li {
    list-style: none;
    color: $medium-gray;
  }
  h5 {
    text-transform: uppercase;
    font-weight: 600;
    text-align: start;
    padding-left: 1rem;
  }
  .dot-big {
    border-radius: 7px;
  }
  span {
    color: $primary-color;
  }
  .btn-landlord {
    display: none;
    margin: auto;
    border-radius: 10px;
    font-size: 1.2rem;
    margin-bottom: 4rem;
    span {
      font-weight: 600;
    }
  }
  @media (min-width: 767.98px) {
    .btn-landlord {
      display: block;
    }
  }
}
</style>
