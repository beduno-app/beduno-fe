<template>
  <search-input />
  <form @submit="register">
    <div class="register container-fluid">
      <h3 class="px-3">{{ $t("auth.register.register") }}</h3>
      <div class="register-tile">
        <div class="row">
          <div class="col-xs-12 col-md-6">
            <div class="d-flex custom-select mb-2 m-4 p-2">
              <FormKit
                ref="name"
                type="text"
                :placeholder="$t('auth.register.name.placeholder')"
                :classes="{
                  inner: {
                    $reset: true,
                  },
                }"
              />
            </div>
            <div class="d-flex m-4">
              <select
                v-model="selectedCountryCode"
                class="custom-select me-2"
                style="max-width: 100px; font-size: 14px"
              >
                <option value="1" :key="1">+48</option>
                <option value="2" :key="2">+420</option>
                <option value="3" :key="3">+380</option>
                <option value="4" :key="4">+49</option>
                <option value="5" :key="5">+7</option>
                <option value="6" :key="6">+44</option>
              </select>
              <div class="d-flex custom-select mb-2 p-2" style="width: 100%">
                <FormKit
                  ref="phoneNumber"
                  type="text"
                  :placeholder="$t('auth.register.phoneNumber.placeholder')"
                  :classes="{
                    inner: {
                      $reset: true,
                    },
                  }"
                />
              </div>
            </div>
            <div class="d-flex custom-select mb-2 m-4 p-2">
              <FormKit
                ref="email"
                type="text"
                :placeholder="$t('auth.register.email.placeholder')"
                :classes="{
                  inner: {
                    $reset: true,
                  },
                }"
              />
            </div>
            <div class="d-flex flex-column m-4">
              <div class="custom-select p-2">
                <div class="input-wrap" style="position: relative">
                  <FormKit
                    ref="password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="$t('auth.register.password.placeholder')"
                    :classes="{
                      inner: {
                        $reset: true,
                      },
                    }"
                  />
                  <div style="position: absolute; right: 8px; top: 8px">
                    <EyeOffIcon
                      @click="showPassword = !showPassword"
                      :class="{ hidden: showPassword }"
                    />
                    <EyeIcon
                      @click="showPassword = !showPassword"
                      :class="{ hidden: !showPassword }"
                    />
                  </div>
                </div>
              </div>
              <div class="pt-1 cursor-pointer">
                {{ $t("auth.register.generatePassword") }}
              </div>
            </div>
            <div class="custom-select m-4 p-2">
              <div class="input-wrap" style="position: relative">
                <FormKit
                  ref="repeatPassword"
                  :type="showRepeatPassword ? 'text' : 'password'"
                  :placeholder="$t('auth.register.repeatPassword.placeholder')"
                  :classes="{
                    inner: {
                      $reset: true,
                    },
                  }"
                />
                <div style="position: absolute; right: 8px; top: 8px">
                  <EyeOffIcon
                    @click="showRepeatPassword = !showRepeatPassword"
                    :class="{ hidden: showRepeatPassword }"
                  />
                  <EyeIcon
                    @click="showRepeatPassword = !showRepeatPassword"
                    :class="{ hidden: !showRepeatPassword }"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="col-xs-12 col-md-6">
            <div class="row">
              <div class="col-sm-3 col-sx-12 m-4">
                <div class="col-xs-12" style="width: 150px">
                  <span>{{ $t("auth.register.birthYear.label") }}</span>
                  <select
                    class="mb-2"
                    style="font-size: 14px"
                    v-on:change="selectedYear = Number($event.target.value)"
                  >
                    <option
                      v-for="(year, idx) in years"
                      :value="year"
                      :key="idx"
                    >
                      {{ year }}
                    </option>
                  </select>
                </div>
                <div class="col-xs-12 pt-2">
                  <span class="small-label">{{
                    $t("auth.register.gender.label")
                  }}</span>
                  <div class="form-check form-check-radio">
                    <label class="form-check-label">
                      <input
                        class="form-check-input"
                        id="genderRadioButtonWoman"
                        type="radio"
                        value="FEMALE"
                        checked
                        name="gender"
                        @change="checkGender('FEMALE')"
                      />
                      <span class="form-check-sign"></span>
                      {{ $t("auth.register.gender.options.woman") }}
                    </label>
                  </div>

                  <div class="form-check form-check-radio">
                    <label class="form-check-label">
                      <input
                        class="form-check-input"
                        id="genderRadioButtonMan"
                        type="radio"
                        value="MALE"
                        name="gender"
                        @change="checkGender('MALE')"
                      />
                      <span class="form-check-sign"></span>
                      {{ $t("auth.register.gender.options.man") }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="col-sm-7 col-xs-12 m-4">
                {{ $t("auth.register.languages.label") }}
                <div
                  class="row"
                  v-for="(line, index) in lines"
                  :key="index"
                  style="align-items: baseline"
                >
                  <div class="col-md-6 col">
                    <div>
                      <select
                        v-on:change="changeValue($event, index)"
                        class="mb-2"
                        style="font-size: 14px; width: 150px"
                      >
                        <option
                          :value="option.value"
                          v-for="(option, idx) in languageOptions"
                          :key="idx"
                        >
                          {{ option.label }}
                        </option>
                      </select>

                      <img
                        src="../assets/img/icon_plus.png"
                        alt="icon_add"
                        v-if="index + 1 === lines.length && lines.length < 5"
                        class="pt-3 cursor-pointer"
                        @click="addLine"
                      />
                    </div>
                  </div>
                  <div class="col-md-5 col">
                    <img
                      src="../assets/img/icon_minus.png"
                      alt="icon_remove"
                      class="cursor-pointer"
                      @click="removeLine(index)"
                      v-if="index > 0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-check form-check-checkbox m-4 pb-4">
          <label class="form-check-label">
            <input
              class="form-check-input"
              id="termsAcceptedCheckbox"
              type="checkbox"
              v-model="termsAccepted"
              @change="resetTermsAcceptedError()"
            />
            <span class="form-check-sign"></span>
            {{ $t("auth.register.acceptRegulation.label") }}

            <a href="https://example.com" class="text-dark">( {{ $t("auth.register.acceptRegulation.link") }})</a>
            <div v-if="showTermsNotAcceptedError" class="text-danger">{{ $t('auth.register.acceptRegulation.error') }}</div>
          </label>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-center align-items-center">
      <button class="register-btn mt-5 p-2" @click.prevent="register()">
        <img src="../assets/img/icon_login_green.png" alt="register-button" />
        <span class="mx-2">{{ $t("auth.login.action.register") }}</span>
      </button>
    </div>
    <p class="text-center mt-3" style="font-size: 1rem; font-weight: 600; margin: auto">
      {{ $t("auth.register.action.hint") }}
    </p>
    <div class="d-flex justify-content-center align-items-center">
      <button class="login-btn mb-5 mt-3 p-2" @click.prevent="navigateToLogin()">
        <img src="../assets/img/icon_login_top_01.png" alt="login-button" />
        <span class="mx-2">{{ $t("auth.login.action.login") }}</span>
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SearchInput from "@/features/home/SearchInput.vue";
import EyeIcon from "vue-material-design-icons/Eye.vue";
import EyeOffIcon from "vue-material-design-icons/EyeOff.vue";
import { computed } from "vue";

@Options({
  components: { SearchInput, EyeIcon, EyeOffIcon },
})
export default class Login extends Vue {
  lines = <any>[]; // todo: improve typing

  languageOptions = [
    {
      value: "Polski",
      label: "Polski",
      src: "pl",
    },
    {
      value: "English",
      label: "English",
      src: "uk",
    },
    {
      value: "Українська",
      label: "Українська",
      src: "ua",
    },
    {
      value: "Русский",
      label: "Русский",
      src: "ru",
    },
    {
      value: "Deutsch",
      label: "Deutsch",
      src: "de",
    },
  ];
  showPassword = false;
  showRepeatPassword = false;
  selectedCountryCode = 1;
  termsAccepted = false;
  showTermsNotAcceptedError = false;
  selectedYear;
  selectedGender: 'FEMALE' | 'MALE' = 'FEMALE'; // todo: extract type
  years = computed(() => {
    const year = new Date().getFullYear() - 18;
    return Array.from({ length: year - 1900 }, (_value, index) => 1901 + index);
  });
  blockRemoval = computed(() => this.lines.length <= 1);

  changeValue(event, index) {
    this.lines[index] = event.target.value;
  }

  addLine = () => {
    this.lines.push("Polski");
  };

  resetTermsAcceptedError() {
    this.showTermsNotAcceptedError = false;
  }

  checkGender(gender: 'FEMALE' | 'MALE') {
    this.selectedGender = gender;
  }

  removeLine(lineId) {
    if (!this.blockRemoval) {
      this.lines.splice(lineId, 1);
    }
  }

  mounted() {
    this.addLine();
  }

  navigateToLogin() {
    this.$router.push({
      name: 'Login'
    });
  }

  register() {
    if (!this.termsAccepted) {
      this.showTermsNotAcceptedError = true;
      return;
    }

    const data = {
      name: (this.$refs.name as any).node.value,
      gender: this.selectedGender,
      email: (this.$refs.email as any).node.value,
      password: (this.$refs.password as any).node.value,
      phone: (this.$refs.phoneNumber as any).node.value,
      dateOfBirth: this.selectedYear,
      language: this.lines.join(', '),
      // todo: do we need fields below? there are not available in the form
      viber: false,
      signal: false,
      whatsapp: false,
      telegram: false
    };
    this.axios('/host/register', { method: 'POST', data });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";

.register {
    max-width: 1300px;

  .register-tile {
    background-color: $light-gray;
    border-radius: 1rem;
  }

  select {
    border-radius: 10px;
    border: 1px solid $dark-gray;
    height: 60px;
    width: 100%;
    font-size: 0.8rem;
  }

  .custom-select {
    background: white;
    max-width: 100%;
    height: 60px;
    border: 1px solid grey;
    border-radius: 0.9rem;
  }

  .hidden {
    display: none;
  }

  .input-wrap {
    display: flex;
    align-items: center;
  }

  .input-wrap i {
    margin-left: 10px;
    cursor: pointer;
  }

  @media (max-width: 700px) {
    .login-inputs,
    .register-inputs {
      flex-direction: column;
      align-items: center;
    }
  }
  @media (min-width: 400px) {
    .login-password {
      width: 260px;
    }
  }
}
.login-btn,
.register-btn {
  background: $primary-color;
  width: 200px;
  margin: auto;
  border-radius: 0.6rem;
  border: none;
  color: $black-color;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}
.login-btn {
  background: $primary-color;
}
.register-btn {
  background: rgb(140, 190, 45);
}
</style>
