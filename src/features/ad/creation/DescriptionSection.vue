<template>
  <div class="description-section p-3">
    <div class="row">
      <div class="col-sm-12 col-md-12 col-lg-6">
        <span class="label d-block">{{ $t('advertisementView.descriptionSection.description.label') }}</span>
        <div class="input-characters pb-2">{{ $t('advertisementView.descriptionSection.description.tip') }}</div>
        <b-card no-body>
          <b-tabs pills card>
            <b-tab :title="$t('advertisementView.descriptionSection.description.tabs.own')" active>
              <textarea
                name="own-description"
                ref="descriptionOwn"
                id="3"
                cols="30"
                rows="10"
                v-model="ownDescription"
                placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
              ></textarea>
              <span class="description-characters">{{
                  $t('advertisementView.descriptionSection.description.charactersCounter', { count: 5000 - ownDescription.length})
              }}</span>
            </b-tab>
            <b-tab :title="$t('advertisementView.descriptionSection.description.tabs.preset1')">
              <textarea ref="descriptionTemplate1" name="template1" id="2" cols="30" rows="10">
Oferuję komfortowy, nowoczesny oraz niezależny pokój w centrum miasta .
Pokój w pełni umeblowany oraz przestronny.
Łazienka oraz kuchnia ogólnodostępna.
W cenę wliczone wszystkie media.
W pobliżu restauracje, sklepy oraz miejsca usługowe.

Możesz zamieszkać u Nas już dziś.</textarea
              >
            </b-tab>
            <b-tab :title="$t('advertisementView.descriptionSection.description.tabs.preset2')">
              <textarea ref="descriptionTemplate2" name="template2" id="3" cols="30" rows="10">
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
        <span class="label pb-2">{{ $t('advertisementView.descriptionSection.roomSize.label') }}</span>
        <FormKit
          type="text"
          ref="roomSize"
          :placeholder="$t('advertisementView.descriptionSection.roomSize.placeholder')"
          validation="required"
          :validation-messages="{
            required: $t('advertisementView.descriptionSection.roomSize.validationMessages.required'),
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />

        <span class="label">{{ $t('advertisementView.descriptionSection.splitIntoBeds.label') }}</span>
        <b-form-radio
          id="checkbox-1"
          ref="sharedBeds"
          v-model="divide"
          name="checkbox"
          value="accepted"
          unchecked-value="not_accepted"
        >
          {{ $t('advertisementView.descriptionSection.splitIntoBeds.value') }}
        </b-form-radio>
      </div>
      <div class="col-lg-3 col-md-12 py-2">
        <span class="label pb-2">{{ $t('advertisementView.descriptionSection.bedsCount.label') }}</span>
        <FormKit
          type="text"
          ref="bedsCount"
          :placeholder="$t('advertisementView.descriptionSection.bedsCount.placeholder')"
          validation="required"
          :validation-messages="{
            required: $t('advertisementView.descriptionSection.bedsCount.validationMessages.required'),
          }"
          :classes="{
            outer: 'foo-bar',
            inner: {
              $reset: true,
            },
          }"
        />
        <div formGroupName="roomsType">
          <span class="label pb-2">{{ $t('advertisementView.descriptionSection.roomType.label') }}</span>
          <div v-for="room in roomsType" :key="room.key" class="form-check">
            <input
              class="form-check-input"
              type="radio"
              v-model="roomType"
              name="exampleRadios"
              :id="room.id"
              :value="room.value"
            />
            <img
              :src="require(`../../../assets/img/${room.icon}.png`)"
              class="px-1"
              width="30"
              :style="room.key === 'family' ? 'width: 45px' : 'width: 30px'"
            />

            <label class="form-check-label" for="room.for"
              >{{ room.content }}
            </label>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-12 py-2">
        <span class="label pb-2">{{ $t('advertisementView.descriptionSection.freeBedsCount.label') }}</span>
        <FormKit
          type="text"
          ref="freeBeds"
          placeholder="1"
          validation="required"
          :validation-messages="{
            required: $t('advertisementView.descriptionSection.freeBedsCount.validationMessages.required'),
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
import { Vue } from "vue-class-component";

export default class HostSection extends Vue {
  ownDescription = <string>"";
  selectedLanguages = <string[]>[];
  selectedRentalTime = <string[]>[];
  roomsType = [
    {
      content: "Tylko żeński",
      key: "male",
      icon: "icon_man",
      value: "male",
      for: "male",
      id: "checkbox-1",
    },
    {
      content: "Tylko męski",
      key: "female",
      icon: "icon_woman",
      value: "female",
      for: "female",
      id: "checkbox-2",
    },
    {
      content: "Rodzinny",
      key: "family",
      icon: "icon_people",
      value: "family",
      for: "family",
      id: "checkbox-3",
    },
  ];
  roomType
  rentalTime = [
    { key: "days", content: "Krótkoterminowy (dni)" },
    { key: "weeks", content: "Krótkoterminowy (tygodnie)" },
    { key: "months", content: "Długoterminowy (miesiące)" },
  ];

  getData() {
    return {
      descriptionOwn: (this.$refs.descriptionOwn as any).value,
      descriptionTemplate1: (this.$refs.descriptionTemplate1 as any).value,
      descriptionTemplate2: (this.$refs.descriptionTemplate2 as any).value,
      roomSize: (this.$refs.roomSize as any).node.value,
      sharedBeds: (this.$refs.sharedBeds as any).value === 'accepted',
      bedsCount: (this.$refs.bedsCount as any).node.value,
      freeBeds: (this.$refs.freeBeds as any).node.value,
      roomType: this.roomType
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@formkit/themes/genesis";
@import "@/assets/style.scss";
.description-section {
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
}
</style>
