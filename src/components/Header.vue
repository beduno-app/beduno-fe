<template>
  <div class="header">
    <div
      class="container-fluid d-flex align-items-center justify-content-between p-5"
    >
      <div class="d-flex align-items-center">
        <div class="logo-bedOK">
          <img
            class="img-BedOk"
            alt="Bed!Ok logo"
            src="../assets/img/logo_bedOK_01_OK.png"
          />
          <div class="logo-subtitle">{{ $t('header.logoSubtitle') }}</div>
        </div>
        <div class="display-flexalign-items-center btn-text-orange p-2">
          <div class="px-2">{{ $t('header.callToAction') }}</div>
          <img height="20" src="../assets/img/icon_money_bag.png" />
        </div>
      </div>
      <div class="align-items-center justify-content-sm-around desktop-content">
        <div class="download-app mx-4 align-items-center">
          <div class="text-end px-2">
            {{ $t('header.download.firstLine.beforeLogo') }}
            <img width="50" src="../assets/img/logo_bedOK_01_OK.png" />&nbsp;{{ $t('header.download.firstLine.afterLogo') }}
            {{ $t('header.download.secondLine') }}
          </div>
          <img
            class="img-download"
            height="40"
            src="../assets/img/download.png"
          />
        </div>

        <b-dropdown :text="selectedLocale ? selectedLocale.text : 'Polski'" class="mx-4">
          <b-dropdown-item
            :disabled="option.disabled"
            @click="handleLanguageChange(option)"
            v-for="option in languageOptions"
            :key="option.value"
          >
            <div>
              {{ option.text }}
              <img
                width="15"
                :src="require(`../assets/img/${option.src}.png`)"
              />
            </div>
          </b-dropdown-item>
        </b-dropdown>

        <b-dropdown :text="selected ? selected.text : 'PLN'" class="mx-4">
          <b-dropdown-item
            :disabled="option.disabled"
            @click="select(option)"
            v-for="option in currencyOptions"
            :key="option.value"
          >
            <div>
              {{ option.text }}
            </div>
          </b-dropdown-item>
        </b-dropdown>
        <button class="login-person mx-2">
          <font-awesome-icon
            icon="fa-solid fa-bars"
            style="color: black"
            class="mx-2"
          />
          <img class="mx-2" src="../assets/img/icon_login_top_01.png" />
        </button>
      </div>
      <div class="flex-column align-items-center icon-login">
        <img src="../assets/img/icon_login_top_01.png" />
        <span>{{ $t('header.login') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import "vue3-carousel/dist/carousel.css";
import "vue3-carousel/dist/carousel.css";
import RoomCard from "@/features/home/RoomCard.vue";
import RoomCardJoin from "@/features/home/RoomCardJoin.vue";

@Options({
  components: {
    RoomCard,
    RoomCardJoin,
  },
})
export default class Header extends Vue {
  selected = null;
  selectedLocale = null;
  languageOptions = [
    {
      value: "Polski",
      text: "Polski",
      src: "pl",
      languageCode: 'pl'
    },
    {
      value: "English",
      text: "English",
      src: "uk",
      languageCode: 'en'
    },
    {
      value: "Українська",
      text: "Українська",
      src: "ua",
      languageCode: 'uk'
    },
    {
      value: "Русский",
      text: "Русский",
      src: "ru",
      languageCode: 'ru'
    },
    {
      value: "Deutsch",
      text: "Deutsch",
      src: "de",
      languageCode: 'de'
    },
  ];
  currencyOptions = [
    { value: "PLN", text: "PLN" },
    { value: "EUR", text: "EUR" },
    { value: "USD", text: "USD" },
    { value: "UAH", text: "UAH" },
  ];

  handleLanguageChange(selectedLocale) {
    this.$i18n.locale = selectedLocale.languageCode;
    this.selectedLocale = selectedLocale;
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.header {
  .logo-bedOK {
    margin-right: 100px;
    .img-BedOk {
      width: 11rem;
    }
    .logo-subtitle {
      color: $success-color;
    }
  }

  .btn-text-orange {
    display: flex;
    background: $orange-bg;
    color: $white-color;
    border-radius: 10px;
    cursor: pointer;
  }
  .login-person {
    background: $white-color;
    border-radius: 9px;
    border: none;
    padding: 10px;
  }
  .icon-login {
    display: flex;
    img {
      width: 30px;
      height: 30px;
    }
    span {
      font: 0.9em sans-serif;
      font-weight: 600;
    }
  }

  .desktop-content,
  .img-content {
    display: none;
  }
  .btn-secondary {
    background: $white-color !important;
    border: none !important;
    color: $black-color !important;
  }
  .download-app {
    width: 286px;
    display: flex;
    font-size: 0.9rem;
    .img-download {
      cursor: pointer;
    }
  }

  @media (min-width: 767.98px) {
    .logo-subtitle,
    .icon-login {
      display: none;
    }
    .desktop-content {
      display: flex;
    }
    .img-content {
      display: block;
    }
  }

  @media (max-width: 1300px) {
    .download-app,
    .btn-text-orange {
      display: none;
    }
  }
}
</style>
