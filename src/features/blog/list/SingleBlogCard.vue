<template>
  <h5>{{ blog.title }}</h5>
  <p class="text-grey">Opublikowano: {{ blog.date }}</p>
  <div>
    <img
      class="blog-img"
      :src="require(`../../../assets/img/${blog.img}`)"
      :alt="blog.img"
      :style="showFullDescription ? 'width: 200px' : 'width: 100%'"
    />
    <div>
      <p class="text-grey">
        {{ truncatedDescription }}
      </p>
      <span
        class="d-flex justify-content-end cursor-pointer"
        style="font-weight: 600; cursor: pointer"
        @click="openBlog"
      >
        {{ showFullDescription ? "" : "...czytaj dalej" }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showFullDescription: false,
    };
  },
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  computed: {
    truncatedDescription() {
      const maxLength = 200;
      return this.showFullDescription
        ? this.blog.description
        : this.blog.description.slice(0, maxLength) +
            (this.blog.description.length > maxLength ? "..." : "");
    },
  },
  methods: {
    openBlog() {
      this.showFullDescription = !this.showFullDescription;
      this.$emit("blog-clicked", this.blog);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/_variables.scss";
.blog-container {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.blog-img {
  width: 100%;
  height: auto;
  float: left;
  margin: 1rem 1rem 0 0;
}

.blog-content {
  flex-grow: 1;
}

.text-grey {
  color: $dark-gray;
}
</style>
