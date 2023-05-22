<template>
  <div style="max-width: 1000px" class="m-auto py-5 container-fluid">
    <h2 class="pb-3">{{ $t('help.header') }}</h2>
    <p>
      {{ $t('help.firstLine.firstPart') }}
      <img
        src="../assets/img/logo_top.png"
        :height="20"
        alt="logo_bedok"
        class="pb-1"
      />
      {{ $t('help.firstLine.secondPart') }}
    </p>
    <h3 class="pb-3">{{ $t('help.howTo') }}</h3>
    <img
      src="../assets/img//howitworks_noframe.png"
      alt="how_it_works"
      width="100%"
      class="py-3"
    />
    <h4 class="pb-3">{{ $t('help.qna') }}</h4>
    <ul>
      <li
        v-for="(question, index) in questions"
        :key="index"
        @click="toggleAnswer(index)"
      >
        <p class="question-list">{{ $t(question.text) }}</p>
        <p class="px-5" v-show="isAnswerOpen(index)">
          {{ $t(question.answer) }}
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
      text: 'help.questions.howToGetAccount.q',
      answer: 'help.questions.howToGetAccount.a'
    },
    {
      text: 'help.questions.dataNeededToRegister.q',
      answer: 'help.questions.dataNeededToRegister.a'
    },
    {
      text: 'help.questions.howDoPaymentsWork.q',
      answer: 'help.questions.howDoPaymentsWork.a'
    },
    {
      text: 'help.questions.howToBeSafe.q',
      answer: 'help.questions.howToBeSafe.a'
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
