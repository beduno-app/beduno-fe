<template>
  <div class="rules-section p-3">
    <span class="label pt-2">{{ $t('advertisementView.rulesSection.termsOfStay') }}</span>
    <div class="row">
      <div class="col-lg-3 col-sm-6 col-sx-12">
        <span class="label">{{ $t('advertisementView.rulesSection.animals') }}</span>
        <div class="d-flex align-items-center">
          <div>
            <div class="form-check form-check-radio">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  id="exampleRadios1"
                  v-on:change="setPets(true)"
                  type="radio"
                  value="yes"
                  checked
                />
                <span class="form-check-sign"></span>
                tak
              </label>
            </div>
            <div class="form-check form-check-radio">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  id="exampleRadios1"
                  v-on:change="setPets(false)"
                  type="radio"
                  formControlName="pets"
                  value="no"
                />
                <span class="form-check-sign"></span>
                nie
              </label>
            </div>
          </div>
          <img
            src="../../../assets/img/icon_animals.png"
            class="px-2"
            alt="zwierzeta"
          />
        </div>
      </div>
      <div class="col-lg-3 col-sm-6 col-sx-12">
        <span class="label">{{ $t('advertisementView.rulesSection.curfew') }}</span>
        <div class="d-flex align-items-center">
          <div>
            <div class="form-check form-check-radio">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  type="radio"
                  v-on:change="setCurfew(false)"
                  id="exampleRadios2"
                  value="no"
                  formControlName="curfew"
                />
                <span class="form-check-sign"></span>
                nie
              </label>
            </div>
            <div class="form-check form-check-radio">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  type="radio"
                  id="exampleRadios2"
                  v-on:change="setCurfew(true)"
                  value="yes"
                  checked
                  formControlName="curfew"
                />
                <span class="form-check-sign"></span>
                tak
              </label>
            </div>
          </div>
          <img
            src="../../../assets/img/icon_curfew.png"
            class="px-2"
            alt="night"
          />
        </div>
      </div>
      <div class="col-lg-3 col-sm-6 col-sx-12">
        <span class="label">{{ $t('advertisementView.rulesSection.smoking') }}</span>
        <div class="d-flex align-items-center">
          <div>
            <div class="form-check form-check-radio">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  type="radio"
                  id="exampleRadios3"
                  v-on:change="setSmoking(false)"
                  value="no"
                  formControlName="smoking"
                />
                <span class="form-check-sign"></span>
                nie
              </label>
            </div>
            <div class="form-check form-check-radio">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  type="radio"
                  id="exampleRadios3"
                  v-on:change="setSmoking(true)"
                  value="yes"
                  formControlName="smoking"
                  checked
                />
                <span class="form-check-sign"></span>
                tak
              </label>
            </div>
          </div>
          <img
            src="../../../assets/img/icon_sofa.png"
            class="px-2"
            alt="night"
          />
        </div>
      </div>
      <div class="col-lg-3 col-sm-6 col-sx-12">
        <span class="label">{{ $t('advertisementView.rulesSection.others.label') }}</span>
        <FormKit
          type="text"
          ref="others"
          :placeholder="$t('advertisementView.rulesSection.others.placeholder')"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue } from "vue-class-component";

export default class RulesSection extends Vue {
  pets = true;
  curfew = true;
  smoking = true;

  setPets(value) {
    this.pets = value;
  }

  setCurfew(value) {
    this.curfew = value;
  }

  setSmoking(value) {
    this.smoking = value;
  }

  getData() {
    return {
      pets: this.pets,
      curfew: this.curfew,
      smoking: this.smoking,
      others: (this.$refs.others as any).node.value
    }
  }
}
</script>
<style lang="scss">
@import "@/assets/_variables.scss";
@import "@formkit/themes/genesis";
@import "@/assets/style.scss";
</style>
