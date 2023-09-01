<template>
  <div class="col-xxl-2 col-sm-6 col-sx-12">
    <div class="guest-section">
      <div class="row">
        <div class="col-md-6 mt-3">
          <FormKit
            type="text"
            ref="name"
            :placeholder="
              $t('advertisementView.currentGuestsSection.name.placeholder')
            "
            :classes="{
              outer: 'foo-bar',
              inner: {
                $reset: true,
              },
            }"
          />
        </div>
        <div class="col-md-6">
          <span class="small-label">{{
            $t("advertisementView.currentGuestsSection.birthYear.label")
          }}</span>
          <select class="mb-2" v-model="selectedYear">
            <option v-for="(year, idx) in years" :value="year" :key="idx">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
      <div class="row" v-for="(line, index) in lines" :key="index">
        <div class="col-md-6">
          <div>
            <select v-on:change="changeValue($event, index)" class="mb-2">
              <option
                :value="option.value"
                v-for="(option, idx) in languageOptions"
                :key="idx"
              >
                {{ option.label }}
              </option>
            </select>

            <img
              src="../../../assets/img/icon_plus.png"
              alt="icon_add"
              v-if="index + 1 === lines.length && lines.length < 5"
              class="pt-3 cursor-pointer"
              @click="addLine"
            />
          </div>
        </div>
        <div class="col-md-5">
          <img
            src="../../../assets/img/icon_minus.png"
            alt="icon_remove"
            class="cursor-pointer"
            @click="removeLine(index)"
            v-if="index > 0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { computed } from "@vue/runtime-core";

@Options({})
export default class GuestSection extends Vue {
  lines = <any>[];

  selectedYear = 1990;
  languageOptions = [
    {
      value: "pl",
      label: "Polski",
      src: "pl",
    },
    {
      value: "uk",
      label: "English",
      src: "uk",
    },
    {
      value: "ua",
      label: "Українська",
      src: "ua",
    },
    {
      value: "ru",
      label: "Русский",
      src: "ru",
    },
    {
      value: "de",
      label: "Deutsch",
      src: "de",
    },
  ];
  years = computed(() => {
    const currentYear = new Date().getFullYear();
    const maxBirthYear = currentYear - 18;
    const minBirthYear = currentYear - 120;
    return Array.from(
      { length: maxBirthYear - minBirthYear + 1 },
      (_value, index) => maxBirthYear - index
    );
  });
  blockRemoval = computed(() => this.lines.length <= 1);

  getData() {
    return {
      name: (this.$refs.name as any).node.value,
      birthYear: this.selectedYear,
      languages: this.lines,
    };
  }

  changeValue(event, index) {
    this.lines[index] = event.target.value;
  }

  addLine = () => {
    this.lines.push("pl");
  };

  removeLine(lineId) {
    if (!this.blockRemoval) {
      this.lines.splice(lineId, 1);
    }
  }

  mounted() {
    this.addLine();
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@formkit/themes/genesis";
@import "@/assets/style.scss";
.guests-section {
  select {
    border-radius: 10px;
    border: 1px solid $dark-gray;
    height: 35px;
    width: 100%;
    font-size: 0.8rem;
  }
  img {
    cursor: pointer;
  }
  .small-label {
    font-size: 0.62rem;
    font-weight: 700;
    display: block;
  }
  .label {
    font-size: 1rem;
    font-weight: 700;
  }
  .formkit-label {
    font-size: 0.6rem;
  }
  .btn-secondary {
    border-radius: 0.8rem;
    background: $white-color;
    color: $black-color;
    width: 130px;
  }
  @media (max-width: 1200px) {
    .guest-section {
      padding-bottom: 10px;
      border-bottom: 1px solid $dark-gray;
    }
    .guests-section select {
      margin-bottom: 10px;
    }
  }
  @media (min-width: 1200px) {
    .guest-section {
      border-right: 1px solid $dark-gray;
      padding: 10px;
    }
  }
}
</style>
