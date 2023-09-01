<template>
  <div class="main-section p-3">
    <div class="row">
      <span class="label">{{
        $t("advertisementView.mainSection.title.label")
      }}</span
      ><br />
      <div class="input-characters pb-2">
        {{ $t("advertisementView.mainSection.title.tip") }}
      </div>
      <FormKit
        type="textarea"
        ref="title"
        :placeholder="$t('advertisementView.mainSection.title.placeholder')"
        validation="required|?length:7,70"
        :validation-messages="{
          length: $t(
            'advertisementView.mainSection.title.validationMessages.length'
          ),
          required: $t(
            'advertisementView.mainSection.title.validationMessages.required'
          ),
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
      <span class="label">{{
        $t("advertisementView.mainSection.address.label")
      }}</span>
      <div class="col-sm-6 col-lg-2">
        <FormKit
          type="text"
          ref="city"
          :placeholder="
            $t('advertisementView.mainSection.address.cityPlaceholder')
          "
          validation="required"
          :validation-messages="{
            required: $t(
              'advertisementView.mainSection.address.validationMessages.required'
            ),
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
          ref="zipCode"
          :placeholder="
            $t('advertisementView.mainSection.address.zipCodePlaceholder')
          "
          validation="required"
          :validation-messages="{
            required: $t(
              'advertisementView.mainSection.address.validationMessages.required'
            ),
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
          ref="street"
          :placeholder="
            $t('advertisementView.mainSection.address.streetPlaceholder')
          "
          validation="required"
          :validation-messages="{
            required: $t(
              'advertisementView.mainSection.address.validationMessages.required'
            ),
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
          ref="streetNumber"
          :placeholder="
            $t('advertisementView.mainSection.address.streetNumberPlaceholder')
          "
          validation="required"
          :validation-messages="{
            required: $t(
              'advertisementView.mainSection.address.validationMessages.required'
            ),
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
          ref="flatNumber"
          :placeholder="
            $t('advertisementView.mainSection.address.flatNumberPlaceholder')
          "
          validation="required"
          :validation-messages="{
            required: $t(
              'advertisementView.mainSection.address.validationMessages.required'
            ),
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

    <span class="label">{{
      $t("advertisementView.mainSection.photos.label")
    }}</span>
    <div class="input-characters pb-2">
      {{ $t("advertisementView.mainSection.photos.tip") }}
    </div>

    <div class="d-flex flex-wrap">
      <div v-for="(image, index) in images" :key="index">
        <div class="image-placeholder">
          <img v-if="image" :src="image" alt="Selected" />
          <img
            v-else
            src="../../../assets/img/placeholder.png"
            @click="handleImageClick(index)"
            class="placeholder"
            alt="Add Photo"
          />
        </div>
      </div>
    </div>
    <input
      ref="imageInput"
      type="file"
      multiple
      @change="handleImageUpload"
      style="display: none"
    />
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class MainSection extends Vue {
  images = new Array(8).fill(null);
  imageIndex = 0;
  getData() {
    return {
      title: (this.$refs.title as any).node.value,
      city: (this.$refs.city as any).node.value,
      zipCode: (this.$refs.zipCode as any).node.value,
      street: (this.$refs.street as any).node.value,
      streetNumber: (this.$refs.streetNumber as any).node.value,
      flatNumber: (this.$refs.flatNumber as any).node.value,
      images: Array.from((this.$refs.imageInput as any).files),
    };
  }
  handleImageClick(index) {
    this.imageIndex = index;
    if (this.$refs.imageInput instanceof HTMLInputElement) {
      this.$refs.imageInput.click();
    }
  }
  handleImageUpload(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.images[this.imageIndex] = e.target?.result;
      };

      reader.readAsDataURL(file);
    }
  }
}
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
  .image-placeholder {
    position: relative;
    width: 150px;
    height: 150px;
    border: 1px dashed #ccc;
    margin: 10px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
