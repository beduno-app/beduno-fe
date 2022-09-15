<template>
  <div>
    <div class="guests-section p-3">
      <div class="row">
        <span class="label pb-3">{{ $t('advertisementView.currentGuestsSection.title') }}</span>
        <guest-section />
        <guest-section />
        <guest-section />
        <guest-section />
        <guest-section />
        <guest-section />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import GuestSection from "./GuestSection.vue";

@Options({
  components: { GuestSection },
})
export default class CurrentGuestsSection extends Vue {}
</script>

<style lang="scss"></style>
