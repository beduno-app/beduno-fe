<template>
  <div class="host-section p-3">
    <div class="row">
      <div class="col-lg-3 col-md-6 col-sx-12 pb-3">
        <FormKit
          :label="$t('advertisementView.hostSection.hostName.label')"
          type="text"
          :placeholder="$t('advertisementView.hostSection.hostName.placeholder')"
          validation="required"
          :validation-messages="{
            required: $t('advertisementView.hostSection.hostName.validationMessages.required'),
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
        <FormKit
          :label="$t('advertisementView.hostSection.phoneNumber.label')"
          type="text"
          :placeholder="$t('advertisementView.hostSection.phoneNumber.placeholder')"
          validation="required"
          :validation-messages="{
            required: $t('advertisementView.hostSection.phoneNumber.validationMessages.required'),
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
        <FormKit
          :label="$t('advertisementView.hostSection.email.label')"
          type="text"
          :placeholder="$t('advertisementView.hostSection.email.placeholder')"
          validation="required|email"
          :validation-messages="{
            required: $t('advertisementView.hostSection.email.validationMessages.required'),
            email: $t('advertisementView.hostSection.email.validationMessages.email'),
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
      <div class="col-lg-2 col-md-6 col-sx-12 pb-2">
        <div class="image-upload">
          <span class="label d-block pb-3">{{ $t('advertisementView.hostSection.photo.label') }}</span>
          <div class="image-upload">
            <label for="file-input">
              <img :src="image" />
            </label>

            <input
              id="file-input"
              type="file"
              @change="previewImage"
              accept="image/*"
            />
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-sx-12 pb-2">
        <div formGroupName="languages">
          <span class="label">{{ $t('advertisementView.hostSection.languages.label') }}</span>
          <div
            v-for="language in languages"
            :key="language.key"
            class="form-check"
          >
            <label class="form-check-label">
              <img
                :src="require(`../../../assets/img/${language.icon}.png`)"
                class="px-1"
              />{{ language.content }}
              <input
                type="checkbox"
                class="form-check-input"
                v-model="selectedLanguages"
                :value="language.content"
              />
            </label>
          </div>
          <div class="error" v-if="!selectedLanguages.length">
            {{ $t('advertisementView.hostSection.languages.validationMessages.required') }}
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 col-sx-12">
        <div formGroupName="communicators">
          <span class="label">{{ $t('advertisementView.hostSection.communicators.label') }}</span>
          <p>{{ $t('advertisementView.hostSection.communicators.tip') }}</p>
          <div
            v-for="communicator in communicators"
            :key="communicator.key"
            class="form-check"
          >
            <label class="form-check-label">
              <img
                :src="require(`../../../assets/img//${communicator.icon}.png`)"
                class="px-1"
                width="30"
              />{{ communicator.content }}
              <input type="checkbox" class="form-check-input" />
              <span class="form-check-sign"></span>
            </label>
          </div>
          <div class="error" v-if="!selectedCommunicators.length">
            {{ $t('advertisementView.hostSection.communicators.validationMessages.required') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "@vue/runtime-core";
import { Options, Vue } from "vue-class-component";
import { UploadMedia, UpdateMedia } from "vue-media-upload";

@Options({ components: { UploadMedia, UpdateMedia } })
export default class HostSection extends Vue {
  imageData = <string | ArrayBuffer | null | undefined>null;
  selectedLanguages = <string[]>[];
  selectedCommunicators = <string[]>[];
  languages = [
    { content: "polski", key: "polish", icon: "pl" },
    { content: "ukraiński", key: "ukrainian", icon: "ua" },
    { content: "rosyjski", key: "russian", icon: "ru" },
    { content: "angielski", key: "englsh", icon: "uk" },
    { content: "niemiecki", key: "german", icon: "de" },
    { content: "czeski", key: "czech", icon: "cz" },
    { content: "słowacki", key: "slovak", icon: "sk" },
  ];
  communicators = [
    { key: "viber", icon: "icon_viber" },
    { key: "whats-app", icon: "icon_whats_app" },
    { key: "signal", icon: "icon_signal" },
    { key: "telegram", icon: "icon_telegram" },
  ];
  image = computed(() => {
    return this.imageData
      ? this.imageData
      : require(`../../../assets/img/add_pic.png`);
  });
  previewImage(event) {
    var input = event.target;
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = (e) => {
        this.imageData = e.target?.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@formkit/themes/genesis";
@import "@/assets/style.scss";
.file-upload-form,
.image-preview {
  padding: 20px;
}
img.preview {
  width: 200px;
  background-color: white;
  border: 1px solid #ddd;
  padding: 5px;
}

.host-section {
  p {
    color: $dark-gray;
    font-size: 0.9rem;
  }
  .error {
    color: var(--fk-color-error);
    font-size: 0.8rem;
  }
  .gallery {
    width: 57% !important;
  }
  .image-upload {
    > input {
      display: none;
    }
    img {
      width: 150px;
    }
  }
}
</style>
