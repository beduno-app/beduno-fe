<template>
  <div>
    <search-input />

    <div class="login container-fluid">
      <h3>{{ $t('auth.login.login') }}</h3>
      <div
        class="login-tile p-3 d-flex align-items-center justify-content-center"
      >
        <div
          class="p-3 login-facebook d-flex align-items-center justify-content-center cursor-pointer"
        >
          <h6 class="mt-2 mx-2">{{ $t('auth.login.facebook') }}</h6>
          <img
            src="../assets/img/icon_fb.png"
            alt="login-by-facebook"
            width="30"
            height="30"
          />
        </div>
      </div>

      <div
        class="login-tile p-3 mt-2 d-flex align-items-center justify-content-center"
      >
        <div
          class="p-3 login-google d-flex align-items-center justify-content-center cursor-pointer"
        >
          <h6 class="mt-2 mx-2">{{ $t('auth.login.google') }}</h6>
          <img
            src="../assets/img/icon_google.png"
            alt="login-by-facebook"
            width="30"
            height="30"
          />
        </div>
      </div>
      <div class="login-tile p-3 mt-2">
        <div class="d-flex justify-content-around login-inputs">
          <div class="d-flex login-email mb-2">
            <FormKit
              ref="email"
              type="text"
              :placeholder="$t('auth.login.email.placeholder')"
              :classes="{
                outer: 'foo-bar',
                inner: {
                  $reset: true,
                },
              }"
              style="width: 260px; height: 100%"
            />
          </div>
          <div class="d-flex flex-column">
            <div class="login-password">
              <form>
                <!-- other form elements -->
                <div class="input-wrap">
                  <FormKit
                    ref="password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="$t('auth.login.password.placeholder')"
                    :classes="{
                      outer: 'foo-bar',
                      inner: {
                        $reset: true,
                      },
                    }"
                  />
                  <EyeOffIcon
                    @click="showPassword = !showPassword"
                    :class="{ hidden: showPassword }"
                  />

                  <EyeIcon
                    @click="showPassword = !showPassword"
                    :class="{ hidden: !showPassword }"
                  />
                </div>
              </form>
            </div>
            <div class="pt-1 cursor-pointer">{{ $t('auth.login.forgotPassword') }}</div>
          </div>
        </div>
      </div>
      <div class="login-tile p-3 mt-2">
        <div class="d-flex justify-content-around register-inputs">
          <div class="d-flex" style="max-width: 260px">
            <select v-model="selectedCountry" class="custom-select me-2">
              <option value="1" :key="1">+48</option>
              <option value="2" :key="2">+420</option>
              <option value="3" :key="3">+380</option>
              <option value="4" :key="4">+49</option>
              <option value="5" :key="5">+7</option>
              <option value="6" :key="6">+44</option>
            </select>
            <div class="d-flex login-email mb-2">
              <FormKit
                ref="phoneNumber"
                type="text"
                :placeholder="$t('auth.login.phoneNumber.placeholder')"
                :classes="{
                  outer: 'foo-bar',
                  inner: {
                    $reset: true,
                  },
                }"
                style="height: 100%"
              />
            </div>
          </div>
          <div class="d-flex flex-column">
            <div class="login-password">
              <div class="input-wrap">
                <FormKit
                  ref="password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('auth.login.password.placeholder')"
                  :classes="{
                    outer: 'foo-bar',
                    inner: {
                      $reset: true,
                    },
                  }"
                />
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
            <div class="pt-1 cursor-pointer">{{ $t('auth.login.forgotPassword') }}</div>
          </div>
        </div>
      </div>
      <div
        class="d-flex justify-content-center align-items-center login-btn mt-5 p-2"
      >
        <img src="../assets/img/icon_login_top_01.png" alt="login-buutton" />
        <span class="mx-2">{{ $t('auth.login.action.login') }}</span>
      </div>
      <p class="text-center mt-3" style="font-size: 1, 3rem; font-weight: 600; margin: auto">
        {{ $t('auth.login.action.hint') }}
      </p>
      <div
        class="d-flex justify-content-center align-items-center register-btn mb-5 mt-3 p-2"
      >
        <img src="../assets/img/icon_login_green.png" alt="login-button" />
        <span class="mx-2">{{ $t('auth.login.action.register') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SearchInput from "@/features/home/SearchInput.vue";
import EyeIcon from "vue-material-design-icons/Eye.vue";
import EyeOffIcon from "vue-material-design-icons/EyeOff.vue";

@Options({
  components: { SearchInput, EyeIcon, EyeOffIcon },
})
export default class Login extends Vue {
  showPassword = false;
  selectedCountry = 1;
}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";
.login {
  max-width: 900px;
  .login-tile {
    background-color: $light-gray;
    border-radius: 1rem;
  }
  .foo-bar {
    width: 100% !important;
  }
  .login-facebook,
  .login-google,
  .login-email,
  .login-password,
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
  .dropdown-menu {
    width: 1rem !important;
  }
  .login-btn,
  .register-btn {
    background: $primary-color;
    width: 200px;
    margin: auto;
    border-radius: 0.6rem;
    color: $black-color;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
  }
  .login-btn {
    background: $primary-color;
  }
  .register-btn {
    background: rgb(140,190,45);
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
</style>
