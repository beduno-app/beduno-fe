<template>
  <Header/>
  <Content/>
  <Footer/>
</template>

<script>
import { Vue, Options } from 'vue-class-component';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Content from '@/components/Content';

@Options({
  components: { Footer, Header, Content }
})
export default class App extends Vue {}
</script>

<style lang="scss">
</style>
