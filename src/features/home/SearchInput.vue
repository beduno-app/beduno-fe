<template>
  <div class="container-fluid mb-5">
    <div class="d-flex justify-content-center">
      <div class="search-input p-3">
        <b-row>
          <b-col class="col-md-3 col-sm-6 col-12">
            <label-cols class="d-flex p-2">Lokalizacja</label-cols>
            <b-form-input
              id="type-text"
              type="text"
              placeholder="Gdzie szukasz noclegu"
            ></b-form-input>
          </b-col>
          <b-col class="col-md-2 col-sm-6 col-12">
            <label-cols class="d-flex p-2">Od kiedy</label-cols>
            <b-form-input id="type-date-from" type="date"></b-form-input>
          </b-col>
          <b-col class="col-md-2 col-sm-6 col-12">
            <label-cols class="d-flex p-2">Do kiedy</label-cols>
            <b-form-input id="type-date-to" type="date"></b-form-input>
          </b-col>
          <b-col class="col-md-3 col-sm-6 col-12">
            <label-cols class="d-flex p-2">Kto</label-cols>
            <b-form-input
              id="type-number"
              type="number"
              placeholder="Ile osób"
            ></b-form-input>
          </b-col>
          <b-col class="d-flex align-items-center justify-content-end col-md-2 col-sm-12 col-12 search">
            <span class="p-2">Szukaj</span>
            <img src="../../assets/img/search_green.png" />
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({

})
export default class SearchInput extends Vue {}
</script>

<style scoped lang="scss">
.search-input {
  border: 1px solid grey;
  border-radius: 10px;
  input {
    font-size: 0.7rem;
  }
  input::-webkit-input-placeholder {
    font-size: 0.7rem;
  }
  label,
  span {
    font-weight: 600;
    font-size: 0.9rem;
  }
  .search {
    margin-top: 20px;
    cursor: pointer;
  }
}
</style>
