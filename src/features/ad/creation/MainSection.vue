<template>
  <div class="main-section p-3">
    <div class="row">
      <span class="label">Tytuł ogłoszenia*</span><br />
      <div class="input-characters pb-2">od 7 do 70 znaków</div>
      <FormKit
        type="textarea"
        placeholder="Np. Pokój dwuosobowy w cichej okolicy"
        validation="required|?length:7,70"
        :validation-messages="{
          length: 'Tytuł musi mieć min. 7 znaków, max. 70 znaków.',
          required: 'To pole jest wymagane.',
        }"
        :classes="{
          outer: 'foo-bar',
          inner: {
            $reset: true,
          },
        }"
      />
    </div>
    <div class="row">
      <span class="label">Adres*</span>
      <div class="col-sm-6 col-lg-2">
        <FormKit
          type="text"
          placeholder="Miasto"
          validation="required"
          :validation-messages="{
            required: 'To pole jest wymagane.',
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
      <div class="col-sm-6 col-lg-2">
        <FormKit
          type="text"
          placeholder="Kod pocztowy"
          validation="required"
          :validation-messages="{
            required: 'To pole jest wymagane.',
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
      <div class="col-sm-6 col-lg-2">
        <FormKit
          type="text"
          placeholder="Ulica"
          validation="required"
          :validation-messages="{
            required: 'To pole jest wymagane.',
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
      <div class="col-sm-3 col-lg-2">
        <FormKit
          type="text"
          placeholder="Nr domu"
          validation="required"
          :validation-messages="{
            required: 'To pole jest wymagane.',
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
      <div class="col-sm-3 col-lg-2">
        <FormKit
          type="text"
          placeholder="Nr lokalu"
          validation="required"
          :validation-messages="{ required: 'To pole jest wymagane.' }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
    </div>

    <span class="label">Zdjęcia*</span>
    <div class="input-characters pb-2">min. 1 szt. , max 8 szt.</div>

    <upload-media server="/api/upload"> </upload-media>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { UploadMedia, UpdateMedia } from "vue-media-upload";

@Options({
  components: { UploadMedia, UpdateMedia },
})
export default class MainSection extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@formkit/themes/genesis";

.main-section {
  .label {
    font-size: 1rem;
    font-weight: 700;
  }
  .input-characters {
    color: $dark-gray;
  }
  path {
    fill: $orange-bg;
  }
  .formkit-input {
    background: white !important;
    border: 1px solid $dark-gray;
    &:focus {
      border: 2px solid $dark-gray !important;
    }
    &::-webkit-input-placeholder {
      font-size: 0.7rem;
    }
  }
}
</style>