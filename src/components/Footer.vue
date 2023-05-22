<template>
  <div>
    <div class="footer p-4 my-8">
      <div class="container">
        <button class="btn-landlord">
          <span class="mx-4">{{ $t('footer.callToAction') }}</span>
          <img :width="30" src="../assets/img/dot_orange_big.png" alt="big orange dot" />
        </button>
        <b-row>
          <b-col class="col-sm-4 col">
            <div class="d-flex">
              <img
                class="dot-big"
                :width="20"
                :height="20"
                src="../assets/img/dot_green.png"
                alt="img-square"
              />
              <h5>{{ $t('footer.informationSection') }}</h5>
            </div>
            <ul class="text-start">
              <li><a href="">{{ $t('footer.prices') }}</a></li>
              <li><a href="">{{ $t('footer.cityList') }}</a></li>
              <li><a href="">{{ $t('footer.partnerProgram') }}</a></li>
              <li><a href="">{{ $t('footer.faq') }}</a></li>
              <li><a href="">{{ $t('footer.help') }}</a></li>
              <li><a href="">{{ $t('footer.contact') }}</a></li>
            </ul>
          </b-col>
          <b-col class="col-sm-4 col">
            <ul class="text-start" style="padding-top: 32px">
              <li><a href="">{{ $t('footer.about') }}</a></li>
              <li><a href="">{{ $t('footer.careers') }}</a></li>
              <li><a href="">{{ $t('footer.information') }}</a></li>
              <li><a href="">{{ $t('footer.termsOfCooperation') }}</a></li>
              <li>
                <a href="">{{ $t('footer.privacyPolicy') }}</a>
              </li>
              <li>
                <a href="">{{ $t('footer.cookies') }}</a>
              </li>
            </ul>
          </b-col>
          <b-col class="col-sm-4 col text-start">
            <div class="d-flex">
              <img
                class="dot-big"
                :width="20"
                :height="20"
                src="../assets/img/dot_orange.png"
                alt="img-square"
              />
              <h5>{{ $t('footer.clientSection') }}</h5>
            </div>
            <ul class="text-start">
              <li><a href="">{{ $t('footer.login') }}</a></li>
              <li><a href="">{{ $t('footer.registration') }}</a></li>
              <li><a href="">{{ $t('footer.specialOffers') }}</a></li>
            </ul>
          </b-col>
        </b-row>
      </div>
    </div>
    <p class="p-3 text-center">
      {{ $t('footer.copyrightsNote.firstPart') }} <font-awesome-icon icon="fa-solid fa-copyright" /> {{ $t('footer.copyrightsNote.year') }}
      {{ $t('footer.copyrightsNote.lastPart') }}
    </p>
  </div>
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
