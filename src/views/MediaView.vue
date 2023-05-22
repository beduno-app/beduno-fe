<template>
  <div style="max-width: 1000px" class="m-auto py-5 container-fluid">
    <h2 class="pb-3">{{ $t('media.header') }}</h2>
    <p>
      {{ $t('media.firstLine') }}
      <a href="https://example.com" class="text-green">media@bedok.app</a>
    </p>
    <p>{{ $t('media.secondLine') }}</p>
    <p>{{ $t('media.thirdLine') }}</p>
    <ul>
      <li>{{ $t('media.details.title') }}</li>
      <li>{{ $t('media.details.reach') }}</li>
      <li>{{ $t('media.details.contact') }}</li>
      <li>{{ $t('media.details.duration') }}</li>
      <li>{{ $t('media.details.benefit') }}</li>
    </ul>
    <p>
      {{ $t('media.fourthLine.firstPart') }}
      <router-link class="text-dark" to="/blogs">{{ $t('media.fourthLine.secondPart') }}</router-link>
      {{ $t('media.fourthLine.thirdPart') }}
    </p>
  </div>
</template>
<style lang="scss" scoped>
@import "@/assets/_variables.scss";
.text-green {
  color: $success-color;
  font-size: 1rem;
  font-weight: 500;
}
</style>
