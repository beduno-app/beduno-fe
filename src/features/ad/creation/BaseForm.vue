<template>
  <div class="section-form mt-2">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  components: {},
})
export default class BseForm extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
.section-form {
  background-color: $light-gray;
  border-radius: 1rem;
}
</style>
