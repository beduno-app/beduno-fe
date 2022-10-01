<template>
  <div class="row justify-content-center advertisement-section py-5">
    <div class="single-section pb-4">
      <div class="row"><h4>Łóżko w spokojnej okolicy w Warszawie</h4></div>
      <div class="row">
        <div class="col-lg-7 col-md-12 mb-3 align-items-center">
          <font-awesome-icon
            icon="fa-solid fa-location-dot"
            class="location-icon mx-2"
          />
          <u>Mazowieckie </u>,<u> Warszawa </u>,<u>Bemowo</u>
        </div>
        <div class="col-lg-3 col-md-6">
          <font-awesome-icon
            icon="fa-regular fa-heart"
            class="mx-2 heart-icon"
          />Dodaj do ulubionych
        </div>
        <div class="col-lg-2 col-md-6">
          <font-awesome-icon
            icon="fa-regular fa-heart"
            class="mx-2 heart-icon"
          />Udostepnij
        </div>
      </div>
      <div class="row row-images py-4">
        <div class="col">
          <img
            class="img-card-big p-0 room-img"
            src="../../../assets/img/placeholder.png"
          />
        </div>
        <div class="col">
          <div class="row row-images">
            <div class="col">
              <img class="room-img" src="../../../assets/img/placeholder.png" />
            </div>
            <div class="col">
              <img class="room-img" src="../../../assets/img/placeholder.png" />
            </div>
          </div>
          <div class="row row-images">
            <div class="col">
              <img class="room-img" src="../../../assets/img/placeholder.png" />
            </div>
            <div class="col">
              <img class="room-img" src="../../../assets/img/placeholder.png" />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-8 mb-3">
          <div class="row">
            <div class="col-lg-3 col-md-6 col-sm-6 col-xs-3">
              <ul>
                <li>2 łóżka</li>
                <li>1 pokój</li>
              </ul>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-9 mb-2">
              <span class="me-1">Pokój męski</span>
              <img src="../../../assets/img/icon_man.png" alt="icon-man" />
            </div>
            <div class="col-lg-5">
              <div class="col-md-9 mb-2">
                Powierzchnia pokoju: 24m<sup>2</sup>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              Część wspólna: lobby , kuchnia , łazienka
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-lg-5 col-md-12 col shared-room">
              Pokój dzielony na łóżka
            </div>
            <br />
            <p class="room-desc">Współdzielony z innymi mieszkańcami</p>
            <div class="col-lg-7 col-md-12 col">
              Ilość osób aktualnie zamieszkująych pokój: 2
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-sm-12 col-md-4">Aktualnie mieszka u nas:</div>
            <div class="col-sm-12 col-md-8">
              <div class="row">
                <div class="col-md-5 col">Ania, lat 34</div>
                <div class="col-md-7 col d-flex align-items-center">
                  <img class="img-flag" src="../../../assets/img/pl.png" />
                  <span class="px-2">Polski</span>
                  <img class="img-flag" src="../../../assets/img/uk.png" />
                  <span class="px-2">Angielski</span>
                </div>
              </div>
              <div class="row">
                <span class="col-md-5 col">Julka, lat 34</span>
                <div class="col-md-7 col d-flex align-items-center">
                  <img class="img-flag" src="../../../assets/img/pl.png" />
                  <span class="px-2">Polski</span>
                  <img class="img-flag" src="../../../assets/img/uk.png" />
                  <span class="px-2">Angielski</span>
                </div>
              </div>
              <div class="row">
                <span class="col-md-5 col">Patrycja, lat 34</span>
                <div class="col-md-7 col d-flex align-items-center">
                  <img class="img-flag" src="../../../assets/img/pl.png" />
                  <span class="px-2">Polski</span>
                  <img class="img-flag" src="../../../assets/img/uk.png" />
                  <span class="px-2">Angielski</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="row">
            <div class="col-xxl-5 col-xl-12 col-lg-12 mb-3 meet-host">
              POZNAJ GOSPODARZA
            </div>
            <div class="col-xxl-7 col-xl-12 col-lg-12">
              <div class="row mb-2">
                <div class="col-md-6 col">
                  <h3>Sara</h3>
                  <div
                    v-for="(lang, idx) in languages"
                    :key="idx"
                    class="d-flex align-items-center"
                  >
                    <img
                      :src="require(`../../../assets/img/${lang.icon}.png`)"
                      :alt="lang.icon"
                      class="mx-1"
                    />
                    <span>{{ lang.text }}</span>
                  </div>
                </div>
                <div class="col-md-6 col">
                  <img
                    src="../../../assets/img/fot_lodz_desktop_01.jpg"
                    alt=""
                    width="80"
                    height="80"
                    style="border-radius: 100%"
                  />
                </div>
              </div>
              <div class="row">
                <span class="my-3">Używam:</span>
                <div class="d-flex">
                  <div v-for="(communicator, idx) in communicators" :key="idx">
                    <img
                      :src="
                        require(`../../../assets/img/${communicator.icon}.png`)
                      "
                      :alt="communicator.icon"
                      class="mx-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 mb-2">Wyposażenie pokoju:</div>
        <div
          v-for="(equipment, idx) in equipments"
          :key="idx"
          class="col-xl-2 col-lg-3 col-md-6 col-sm-6 col-xs-12 me-2 my-2 d-flex align-items-center"
        >
          <img
            :src="require(`../../../assets/img/${equipment.icon}.png`)"
            :alt="equipment.icon"
            class="mx-1"
          />
          <span>{{ equipment.content }}</span>
        </div>
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">Wyposażenie częsci wspólnej:</div>
        <div
          v-for="(equipment, idx) in sharedEquipments"
          :key="idx"
          class="col-xl-2 col-lg-3 col-md-6 col-sm-6 col-xs-12 d-flex align-items-center"
        >
          <img
            :src="require(`../../../assets/img/${equipment.icon}.png`)"
            :alt="equipment.icon"
            class="mx-1"
          />
          <span>{{ equipment.content }}</span>
        </div>
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-9 mb-2">
          <span>Opis:</span><br />
          <p class="mt-3">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum
          </p>
        </div>
        <div class="col-md-3">
          <span>Lokalizacja:</span><br />
          <div id="map" class="mt-3">tutaj bedzie mapa google</div>
        </div>
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">Formy platności:</div>
        <div v-for="(form, idx) in paymentForms" :key="idx" class="col-xl-2 col-lg-3 col-md-6 col-sm-6 col-xs-12">
          <div class="form-check">
            <label :for="form.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${form.icon}.png`)"
                class="px-1"
              />
              {{ form.content }}
              <input type="checkbox" :id="form.key" class="form-check-input" />
              <span class="form-check-sign"></span>
              {{ form.label }}
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="single-section py-3">
      <div class="row">
        <div class="col-md-12 mb-2">Zasady pobytu:</div>
        <div
          v-for="(rule, idx) in rules"
          :key="idx"
          class="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-xs-12"
        >
          <div class="form-check">
            <label :for="rule.key" class="form-check-label">
              <img
                :src="require(`../../../assets/img/${rule.icon}.png`)"
                class="px-1"
              />
              {{ rule.content }}
              <input type="checkbox" :id="rule.key" class="form-check-input" />
              <span class="form-check-sign"></span>
              {{ rule.label }}: {{ rule.checked }}
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="py-3">
      <div class="row">
        <div class="col-md-5 mb-3">Cena za łóżko 88zł (4 noce)</div>
        <div class="col md-7" style="cursor: pointer">
          <img
            src="../../../assets/img/dot_green_big.png"
            alt="green-dot"
            class="me-2"
          /><span>Zarezerwuj łóżko</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  components: {},
})
export default class SingleAd extends Vue {
  equipments = [
    { content: "TV", key: "tv", icon: "tv" },
    { content: "Pralka", key: "washer", icon: "washing_machine" },
    { content: "Radio", key: "radio", icon: "icon_radio" },
    { content: "WiFi", key: "wifi", icon: "icon_wifi" },
  ];
  sharedEquipments = [
    { content: "Toaleta", key: "toilet", icon: "icon_toilet" },
    {
      content: "Ekspres do kawy",
      key: "coffee_machine",
      icon: "icon_coffee_machine",
    },
    { content: "Czujnik elektryczny", key: "sensor", icon: "icon_sensor" },
    {
      content: "Odkurzacz",
      key: "icon_vacuum_cleaner",
      icon: "icon_vacuum_clenaer",
    },
  ];
  languages = [
    {
      value: "Polski",
      text: "Polski",
      icon: "pl",
    },
    {
      value: "English",
      text: "Angielski",
      icon: "uk",
    },
  ];
  communicators = [
    { key: "viber", icon: "icon_viber" },
    { key: "whats-app", icon: "icon_whats_app" },
    { key: "signal", icon: "icon_signal" },
    { key: "telegram", icon: "icon_telegram" },
  ];
  paymentForms = [
    { label: "gotówka", key: "cash", icon: "icon_cash" },
    {
      label: "karta płatnicza/kredytowa",
      key: "credit_card",
      icon: "icon_credit_card",
    },
    {
      label: "szybki przelew",
      key: "fast_transfer",
      icon: "icon_fast_transfer",
    },
    { label: "BLIK", key: "blik", icon: "icon_BLIK" },
  ];
  rules = [
    {
      label: "Akceptujemy zwierzęta",
      key: "animals",
      icon: "icon_animals",
      checked: "NIE",
    },
    {
      label: "Cisza nocna (22:00-6:00)",
      key: "curfew",
      icon: "icon_curfew",
      checked: "TAK",
    },
    {
      label: "Palenie w budynku",
      key: "smoking",
      icon: "icon_smoking",
      checked: "TAK",
    },
  ];
}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";
.advertisement-section {
  max-width: 1400px;
  font-weight: 500;
  margin: auto;
  .single-section {
    border-bottom: 1px solid $dark-gray;
  }
  .meet-host {
    font-weight: 500;
    border-right: 1px solid $dark-gray;
    color: $dark-gray;
    text-align: end;
  }
  .host-image {
    border-radius: 15px;
    height: 190px;
    width: 180px;
  }
  .room-img {
    width: 100%;
    height: 100%;
  }
  .heart-icon {
    color: $success-color;
  }
  .shared-room {
    color: $primary-color;
  }
  .location-icon {
    color: $primary-color;
  }
  .room-desc {
    font-size: 0.8rem;
    color: $dark-gray;
  }
  #map {
    width: 200px;
    height: 200px;
    border-radius: 100%;
  }
  @media (max-width: 1400px) {
    .meet-host {
      text-align: left;
      border-right: none;
    }
  }
}
</style>
