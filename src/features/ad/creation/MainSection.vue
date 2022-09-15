<template>
  <div class="main-section p-3">
    <div class="row">
      <span class="label">{{ $t('advertisementView.mainSection.title.label') }}</span><br/>
      <div class="input-characters pb-2">{{ $t('advertisementView.mainSection.title.tip') }}</div>
      <FormKit
          type="textarea"
          :placeholder="$t('advertisementView.mainSection.title.placeholder')"
          validation="required|?length:7,70"
          :validation-messages="{
            length: $t('advertisementView.mainSection.title.validationMessages.length'),
            required: $t('advertisementView.mainSection.title.validationMessages.required')
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
      <span class="label">{{ $t('advertisementView.mainSection.address.label') }}</span>
      <div class="col-sm-6 col-lg-2">
        <FormKit
            type="text"
            :placeholder="$t('advertisementView.mainSection.address.cityPlaceholder')"
            validation="required"
            :validation-messages="{
              required: $t('advertisementView.mainSection.address.validationMessages.required'),
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
            :placeholder="$t('advertisementView.mainSection.address.zipCodePlaceholder')"
            validation="required"
            :validation-messages="{
              required: $t('advertisementView.mainSection.address.validationMessages.required'),
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
            :placeholder="$t('advertisementView.mainSection.address.streetPlaceholder')"
            validation="required"
            :validation-messages="{
              required: $t('advertisementView.mainSection.address.validationMessages.required'),
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
            :placeholder="$t('advertisementView.mainSection.address.streetNumberPlaceholder')"
            validation="required"
            :validation-messages="{
              required: $t('advertisementView.mainSection.address.validationMessages.required'),
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
            :placeholder="$t('advertisementView.mainSection.address.flatNumberPlaceholder')"
            validation="required"
            :validation-messages="{
              required: $t('advertisementView.mainSection.address.validationMessages.required'),
            }"
            :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
    </div>

    <span class="label">{{ $t('advertisementView.mainSection.photos.label') }}</span>
    <div class="input-characters pb-2">{{ $t('advertisementView.mainSection.photos.tip') }}</div>

    <upload-media server="/api/upload"></upload-media>
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
@import "@/assets/style.scss";
.main-section {
  .input-characters {
    color: $dark-gray;
  }
  path {
    fill: $orange-bg;
  }
}
</style>
