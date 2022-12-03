<template>
  <div>
    <div class="guests-section p-3">
      <div class="row">
        <span class="label pb-3">{{ $t('advertisementView.currentGuestsSection.title') }}</span>
        <guest-section ref="guests" v-for="(item, index) in [0, 1, 2, 3, 4, 5]" :key="index" />
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
export default class CurrentGuestsSection extends Vue {
  getData() {
    return {
      guests: (this.$refs.guests as any).map(guest => guest.getData())
    }
  }
}
</script>

<style lang="scss"></style>
