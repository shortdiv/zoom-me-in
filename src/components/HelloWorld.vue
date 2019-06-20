<template>
  <div class="hello">
    <button @click="authenticate">Authenticate</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data() {
    return {
      url: null
    };
  },
  mounted() {
    // if not token //
    axios.get("/.netlify/functions/google-auth").then(res => {
      console.log(res);
      this.url = res.data.redirectURL;
    });
  },
  methods: {
    authenticate() {
      window.location.href = this.url;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
