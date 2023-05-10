<template>
  <div class="row">
    <div class="col-md-9 mb-2">
      <span>{{ $t('advertisementDetailsView.descriptionWithMap.description') }}</span><br />
      <p class="mt-3">{{ description }}</p>
    </div>
    <div class="col-md-3">
      <span>{{ $t('advertisementDetailsView.descriptionWithMap.location') }}</span><br />
      <div id="map" class="mt-3">tutaj bedzie mapa google</div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    description: String
  }
})
export default class DescriptionWithMap extends Vue {}
</script>

<style lang="scss"></style>
