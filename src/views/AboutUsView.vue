<template>
  <div style="max-width: 1000px" class="m-auto py-5 container-fluid">
    <h2 class="pb-3">{{ $t('about.header') }}</h2>
    <p>
      <img src="../assets/img/logo_top.png" :height="20" alt="logo_bedok" class="pb-1" /> {{ $t('about.firstLine') }}
    </p>
    <p class="text-green">
      {{ $t('about.secondLine.firstPart') }}
      <img src="../assets/img/logo_top.png" :height="24"  alt="logo_bedok" class="px-2 pb-1"/>
      {{ $t('about.secondLine.secondPart') }}
    </p>
    <p class="text-green">
      {{ $t('about.thirdLine') }}
    </p>
    <p>
      {{ $t('about.fourthLine') }}
    </p>
  </div>
</template>
<style lang="scss" scoped>
@import "@/assets/_variables.scss";
.text-green {
  color: $success-color;
  font-size: 1.3rem;
  font-weight: 500;
}
</style>
