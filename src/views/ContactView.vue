<template>
  <div style="max-width: 1000px" class="m-auto py-5 container-fluid">
    <h2 class="pb-3">Kontakt</h2>
    <p>
      Zachęcamy do kontaktu z nami. Na większość zapytań odpowiadamy na bieżąco.
      Bardziej złożone kwestie obsługujemy w ciągu maksymalnie 2 dni roboczych.
    </p>
    <p>
      Najszybszym sposobem dotarcia do naszego Biura Obsługi jest skorzystanie z
      poniższego formularza. W sprawie współpracy, propozycji biznesowych i
      zapytań, które bezpośrednio nie dotyczą funkcjonowaniu serwisu, uprzejmie
      prosimy o przesłanie wiadomości na adres:
      <a href="https://example.com" class="text-green"> info@bedok.app</a>
    </p>
    <p>
      Dziennikarzy i przedstawicieli mediów zapraszamy do kontaktu z naszym
      biurem prasowym: współpracy, propozycji biznesowych i zapytań, które
      bezpośrednio nie dotyczą funkcjonowaniu serwisu, uprzejmie prosimy o
      przesłanie wiadomości na adres:
      <a href="https://example.com" class="text-green"> media@bedok.app.</a> Po
      wiecej informacji zapraszamy do sekcji Media.
    </p>
    <div class="row">
      <div class="col-md-12 col-lg-4">
        <FormKit
          label="Wpisz swoje imię:*"
          ref="name"
          type="text"
          placeholder="Imię"
          validation="required"
          :validation-messages="{
            required: 'To pole jet wymagane.',
          }"
          :classes="{
            outer: 'foo-bar',
          }"
        />
      </div>
      <div class="col-md-12 col-lg-4">
        <FormKit
          label="Nr telefonu:*"
          ref="phone"
          type="text"
          placeholder="np.: +48 000 000 000"
          validation="required"
          :validation-messages="{
            required: 'To pole jet wymagane.',
          }"
          :classes="{
            outer: 'foo-bar',
          }"
        />
      </div>
      <div class="col-md-12 col-lg-4">
        <FormKit
          label="Email:*"
          ref="email"
          type="text"
          placeholder="np. jan@kowalski.com"
          validation="required|email"
          :validation-messages="{
            required: 'To pole jet wymagane.',
            email: 'Nieprawidłowy email.',
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
        label="Napisz do nas wiadomość:*"
        rows="10"
        cols="20"
        class=""
        validation="required"
        placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        :validation-messages="{
          required: 'To pole jet wymagane.',
        }"
      />
    </div>
    <p>Wpisanie tych informacji jest obowiązkowe*</p>
    <div class="d-flex justify-content-end">
      <button class="cursor-pointer">Wyślij wiadomość</button>
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
