<template>
  <div class="footer p-4 my-8">
    <div class="container">
      <button class="btn-landlord">
        <span class="mx-4">Zostań wynajmującym bez opłat</span
        ><img width="30" src="../assets/img/dot_orange_big.png" />
      </button>
      <b-row>
        <b-col class="col-sm-4 col">
          <div class="d-flex">
            <img
              class="dot-big"
              width="20"
              height="20"
              src="../assets/img/dot_green.png"
              alt="img-square"
            />
            <h5>Informacje</h5>
          </div>
          <ul class="text-start">
            <li><a href="">Ceny</a></li>
            <li><a href="">Lista miast</a></li>
            <li><a href="">Program partnerski</a></li>
            <li><a href="">Pytania i odpowiedzi Q&amp;A</a></li>
            <li><a href="">Centrum pomocy</a></li>
            <li><a href="">Kontakt</a></li>
          </ul>
        </b-col>
        <b-col class="col-sm-4 col">
          <ul class="text-start" style="padding-top: 32px">
            <li><a href="">O bed!OK</a></li>
            <li><a href="">Kariera</a></li>
            <li><a href="">Informacje</a></li>
            <li><a href="">Zasady współpracy</a></li>
            <li>
              <a href=""
                >Oświadczenie o ochronie prywatności i plikach cookies</a
              >
            </li>
            <li>
              <a href="">Zarządzaj ustawieniami dotyczącymi plików cookies</a>
            </li>
          </ul>
        </b-col>
        <b-col class="col-sm-4 col text-start">
          <div class="d-flex">
            <img
              class="dot-big"
              width="20"
              height="20"
              src="../assets/img/dot_orange.png"
              alt="img-square"
            />
            <h5>klient</h5>
          </div>
          <ul class="text-start">
            <li><a href="">Logowanie</a></li>
            <li><a href="">Rejestracja</a></li>
            <li><a href="">Oferty specjalne</a></li>
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
  }
  a {
    color: $medium-gray;
    text-decoration: none;
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
      display: flex;
      padding: 5px;
    }
  }
}
</style>
