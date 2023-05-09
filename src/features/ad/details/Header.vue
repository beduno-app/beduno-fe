<template>
  <div class="row"><h4>{{ title }}</h4></div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    title: String
  }
})
export default class Header extends Vue {}
</script>

<style lang="scss"></style>
