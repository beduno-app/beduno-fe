<template>
  <div class="description-section p-3">
    <div class="row">
      <div class="col-sm-6 col-sm-12 col-md-6">
        <span class="label d-block">Opis*</span>
        <div class="input-characters pb-2">maksimum 5000 znaków</div>
        <b-card no-body>
          <b-tabs pills card>
            <b-tab title="Własny" active>
              <textarea
                name="own-description"
                id="3"
                cols="30"
                rows="10"
                v-model="ownDescription"
                placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
              ></textarea>
              <span class="description-characters"
                >Pozostało {{ 5000 - ownDescription.length }} znaki</span
              >
            </b-tab>
            <b-tab title="Szablon 1">
              <textarea name="template1" id="2" cols="30" rows="10">
Oferuję komfortowy, nowoczesny oraz niezależny pokój w centrum miasta .
Pokój w pełni umeblowany oraz przestronny.
Łazienka oraz kuchnia ogólnodostępna.
W cenę wliczone wszystkie media.
W pobliżu restauracje, sklepy oraz miejsca usługowe.

Możesz zamieszkać u Nas już dziś.</textarea
              >
            </b-tab>
            <b-tab title="Szablon 2">
              <textarea name="template2" id="3" cols="30" rows="10">
Jeżeli szukasz wygodnego i przytulnego pokoju to ta oferta będzie idealna dla Ciebie. Pokój jest jasny i dobrze doświetlony oraz w pełni wyposażony. Znajduje się w cichej i spokojnej okolicy. Łazienka i kuchnia ogólnodostępna w pełni wyposażona.
Każdy gość jest mile widziany, zapraszmy.</textarea
              >
            </b-tab>
          </b-tabs>
        </b-card>
      </div>
    </div>
    <div class="row pt-3">
      <div class="col-lg-3 col-md-12 py-2">
        <span class="label pb-2">Powierzchnia pokoju (m2)*</span>
        <FormKit
          type="text"
          placeholder="np. 4.86"
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

        <span class="label">Pokój dzielony na łóżka</span>
        <b-form-checkbox
          id="checkbox-1"
          v-model="divide"
          name="checkbox-1"
          value="accepted"
          unchecked-value="not_accepted"
        >
          Podziel
        </b-form-checkbox>
      </div>
      <div class="col-lg-3 col-md-12 py-2">
        <span class="label pb-2">Liczba łóżek w pokoju*</span>
        <FormKit
          type="text"
          placeholder="np. 6"
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
        <div formGroupName="roomsType">
          <span class="label pb-2">Typ pokoju</span>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="exampleRadios"
              id="exampleRadiosq1"
              value="option1"
            />
            <img
              src="../../../assets/img/icon_woman.png"
              class="px-1"
              width="30"
            />
            <label class="form-check-label" for="exampleRadios2">
              Tylko żeński
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="exampleRadios"
              id="exampleRadios2"
              value="option2"
            />
            <img
              src="../../../assets/img/icon_man.png"
              class="px-1"
              width="30"
            />
            <label class="form-check-label" for="exampleRadios2">
              Tylko męski
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="exampleRadios"
              id="exampleRadios3"
              value="option2"
            />
            <img
              src="../../../assets/img/icon_people.png"
              class="px-1"
              width="50"
            />
            <label class="form-check-label" for="exampleRadios2">
              Rodzinny
            </label>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-12 py-2">
        <span class="label pb-2">Liczba wolnych łóżek w pokoj*</span>
        <FormKit
          type="text"
          placeholder="1"
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
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "@vue/runtime-core";
import { Vue } from "vue-class-component";

export default class HostSection extends Vue {
  ownDescription = <string>"";
  selectedLanguages = <string[]>[];
  selectedRentalTime = <string[]>[];

  rentalTime = [
    { key: "days", content: "Krótkoterminowy (dni)" },
    { key: "weeks", content: "Krótkoterminowy (tygodnie)" },
    { key: "months", content: "Długoterminowy (miesiące)" },
  ];
  description = computed(() => {});
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@formkit/themes/genesis";
.description-section {
  .label {
    font-size: 1rem;
    font-weight: 700;
  }
  .input-characters,
  .description-characters {
    color: $dark-gray;
  }
  textarea {
    width: 100%;
    border: none;
    outline: none;
  }
  .card-header-tabs .nav-link {
    color: $black-color !important;
  }
  .card-header-tabs .nav-link.active {
    background: $warning-color;
  }
  .error {
    color: var(--fk-color-error);
    font-size: 0.8rem;
  }
  .formkit-input {
    background: $white-color !important;
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
