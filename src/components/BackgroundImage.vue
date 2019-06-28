<template>
  <div class="bg-img" :style="{ 'background-image': imgURL }">
    <slot></slot>
    <div v-if="attribution" class="attribution">
      <a class="attribution-link" :href="attribution.links.html">
        <img
          class="attribution-img"
          :src="attribution.profile_image.small"
          alt
        />
        <span>{{ attribution.name }}</span>
      </a>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "BackgroundImage",
  data() {
    return {
      unloaded: true,
      img: null,
      attribution: null,
      height: null,
      width: null
    };
  },
  computed: {
    imgURL() {
      return `url(${this.img})`;
    }
  },
  created() {
    console.log(process.env);
    axios
      .get(
        "https://api.unsplash.com/search/photos?page=1&query=city,morning&per_page=5",
        {
          headers: {
            Authorization: `Client-ID f6a90fd0ed36c8d580634d740e96197a52456bb862fdfe59622a7cba6e9aaf4c`
          }
        }
      )
      .then(res => {
        let num = Math.floor(Math.random() * 5);
        while (res.data.results[num].sponsored) {
          num = Math.floor(Math.random() * 5);
        }
        this.unloaded = false;
        this.img = res.data.results[num].urls.full;
        this.attribution = res.data.results[num].user;
      });
  },
  mounted() {
    this.img = this.placeholderSrc();
  },
  methods: {
    placeholderSrc() {
      return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}"%3E%3C/svg%3E`;
    }
  }
};
</script>

<style lang="scss" scoped>
.bg-img {
  height: 100%;
  background-size: cover;
  &:before {
    content: "";
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: black;
    filter: opacity(0.75);
    -webkit-filter: opacity(0.75);
  }
}
.attribution {
  position: absolute;
  bottom: 0;
  margin: 1em;
  &-img {
    border-radius: 50%;
    vertical-align: middle;
    margin-right: 10px;
  }
  &-link {
    text-decoration: none;
    color: grey;
  }
}
</style>
