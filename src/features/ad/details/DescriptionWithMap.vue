<template>
  <div class="row">
    <div class="col-md-9 mb-2">
      <span>{{ $t('advertisementDetailsView.descriptionWithMap.description') }}</span><br />
      <p class="mt-3">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum
      </p>
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
  components: {},
})
export default class DescriptionWithMap extends Vue {}
</script>

<style lang="scss"></style>
