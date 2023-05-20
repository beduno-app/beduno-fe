<template>
  <div style="max-width: 1000px" class="m-auto py-5 container-fluid">
    <h2 class="pb-3">Pomoc (FAQ)</h2>
    <p>
      Prezentujemy tu listę najczęstszych pytań jakie zadają użytkownicy naszego
      serwisu oraz odpowiedzi, które mają im pomóc rozwiązać dany problem.
      Uprzejmie prosimy o zapoznanie się z nimi zanim zwrócą sie Państwa do nas
      o pomoc. Z doświadczenia wiemy, że ponad 95% problemów, które zgłaszają
      użytkownicy
      <img
        src="../assets/img/logo_top.png"
        height="20"
        alt="logo_bedok"
        class="pb-1"
      />
      jest prosta do samodzielnego rozwiązania właśnie dzięki poniższym
      wyjaśnieniom oraz wskazówkom.
    </p>
    <h3 class="pb-3">Jak to działa</h3>
    <img
      src="../assets/img//howitworks_noframe.png"
      alt="how_it_works"
      width="100%"
      class="py-3"
    />
    <h4 class="pb-3">Pytania i odpowiedzi</h4>
    <ul>
      <li
        v-for="(question, index) in questions"
        :key="index"
        @click="toggleAnswer(index)"
      >
        <p class="question-list">{{ question.text }}</p>
        <p class="px-5" v-show="isAnswerOpen(index)">
          {{ question.answer }}
        </p>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
import Tenant from "../features/ad/details/Tenant.vue";
@Options({
  components: {
    Tenant,
  },
})
export default class OrderSummaryView extends Vue {
  questions = [
    {
      text: "Jak założyć konto w serwisie",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    },
    {
      text: "Jakie dane muszę muszę podać przy rejestracji?",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    },
    {
      text: "Jak dokonywane są płatności na rzecz gospodarza?",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    },
    {
      text: "W jaki sposób dbać o swoje bezpieczeństwo szukając noclegu?",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    },
  ];
  answers = [] as boolean[];
  toggleAnswer = (index: number) => {
    this.answers[index] = !this.answers[index];
  };
  isAnswerOpen = (index: number) => this.answers[index];
}
</script>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";
.text-green {
  color: $success-color;
  font-size: 0.9rem;
  font-weight: 500;
}

ul {
  list-style-type: decimal;
  .question-list {
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
  }
}
</style>
