<template>
  <div style="max-width: 1000px" class="m-auto py-5 container-fluid">
    <h2 class="pb-3">{{ $t('career.header') }}</h2>
    <p>
      {{ $t('career.firstLine.firstPart') }}
      <img
        src="../assets/img/logo_top.png"
        :height="20"
        alt="logo_bedok"
        class="pb-1"
      />
      {{ $t('career.firstLine.secondPart') }}
    </p>
    <p>
      {{ $t('career.secondLine.firstPart') }}
      <img
        src="../assets/img/logo_top.png"
        :height="20"
        alt="logo_bedok"
        class="pb-1"
      />
      {{ $t('career.secondLine.secondPart') }}
    </p>
    <p>
      {{ $t('career.thirdLine.firstPart') }}
      <img
        src="../assets/img/logo_top.png"
        :height="20"
        alt="logo_bedok"
        class="pb-1"
      />. {{ $t('career.thirdLine.secondPart') }}
    </p>
    <ul>
      <li>{{ $t('career.roles.juniorDev') }}</li>
      <li>{{ $t('career.roles.keyAccountManager') }}</li>
      <li>{{ $t('career.roles.photo') }}</li>
    </ul>
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
