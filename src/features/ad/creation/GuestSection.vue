<template>
  <div class="col-xxl-2 col-sm-6 col-sx-12">
    <div class="guest-section">
      <div class="row">
        <div class="col-md-6 mt-3">
          <FormKit
            type="text"
            placeholder="Imię"
            :classes="{
              outer: 'foo-bar',
              inner: {
                $reset: true,
              },
            }"
          />
        </div>
        <div class="col-md-6">
          <span class="small-label">Rok urodzenia*</span>
          <select class="mb-2">
            <option v-for="(year, idx) in years" :value="year" :key="idx">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
      <div class="row" v-for="(line, index) in lines" :key="index">
        <div class="col-md-6">
          <div>
            <select v-model="line.language" class="mb-2">
              <option
                :value="languageOptions.option"
                v-for="(option, idx) in languageOptions"
                :key="idx"
              >
                {{ option.label }}
              </option>
            </select>

            <img
              src="../../../assets/img/icon_plus.png"
              alt="icon_add"
              v-if="index + 1 === lines.length"
              class="pt-3"
              @click="addLine"
            />
          </div>
        </div>
        <div class="col-md-5">
          <img
            src="../../../assets/img/icon_minus.png"
            alt="icon_remove"
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

  selectedYear = 1997;
  languages = ["polski"];
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
  years = computed(() => {
    const year = new Date().getFullYear() -18;
    return Array.from({ length: year - 1900 }, (_value, index) => 1901 + index);
  });
  blockRemoval = computed(() => this.lines.length <= 1);

  addLine = () => {
    if (this.lines.some((line) => line.language === "")) {
      return;
    }

    this.lines.push({
      language: "",
    });
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
    width: 80px;
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
