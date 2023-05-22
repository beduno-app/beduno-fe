<template>
  <div style="max-width: 1000px" class="m-auto py-5 container-fluid">
    <h2 class="pb-3">{{ $t('contact.header') }}</h2>
    <p>{{ $t('contact.firstLine') }}</p>
    <p>
      {{ $t('contact.secondLine') }}
      <a href="https://example.com" class="text-green"> info@bedok.app</a>
    </p>
    <p>
      {{ $t('contact.thirdLine.firstPart') }}
      <a href="https://example.com" class="text-green"> media@bedok.app.</a>
      {{ $t('contact.thirdLine.secondPart') }}
    </p>
    <div class="row">
      <div class="col-md-12 col-lg-4">
        <FormKit
          :label="$t('contact.form.name.label')"
          ref="name"
          type="text"
          :placeholder="$t('contact.form.name.placeholder')"
          validation="required"
          :validation-messages="{
            required: $t('contact.form.name.validationMessages.required')
          }"
          :classes="{
            outer: 'foo-bar',
          }"
        />
      </div>
      <div class="col-md-12 col-lg-4">
        <FormKit
          :label="$t('contact.form.phone.label')"
          ref="phone"
          type="text"
          :placeholder="$t('contact.form.phone.placeholder')"
          validation="required"
          :validation-messages="{
            required: $t('contact.form.phone.validationMessages.required')
          }"
          :classes="{
            outer: 'foo-bar',
          }"
        />
      </div>
      <div class="col-md-12 col-lg-4">
        <FormKit
          :label="$t('contact.form.email.label')"
          ref="email"
          type="text"
          :placeholder="$t('contact.form.email.placeholder', { at: '@' })"
          validation="required|email"
          :validation-messages="{
            required: $t('contact.form.email.validationMessages.required'),
            email: $t('contact.form.email.validationMessages.required')
          }"
          :classes="{
            outer: 'foo-bar',
          }"
        />
      </div>
    </div>
    <div class="row">
      <FormKit
        type="textarea"
        :label="$t('contact.form.message.label')"
        rows="10"
        cols="20"
        class=""
        validation="required"
        :placeholder="$t('contact.form.message.placeholder')"
        :validation-messages="{
          required: $t('contact.form.message.validationMessages.required'),
        }"
      />
    </div>
    <p>{{ $t('contact.form.hint') }}</p>
    <div class="d-flex justify-content-end">
      <button class="cursor-pointer">{{ $t('contact.form.send') }}</button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@/assets/_variables.scss";

.text-green {
  color: $success-color;
  font-size: 1rem;
  font-weight: 500;
}
.send-msg {
  font-weight: 600;
  cursor: pointer;
}
button {
  border-radius: 10px;
  padding: 5px 15px;
  background: $success-color;
  border: 1px solid $success-color;
  color: $white-color;
}
</style>
<script setup lang="ts">
</script>
