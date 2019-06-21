<template>
  <div class="hello">
    <div v-if="!token">
      <button @click="authenticate">Authenticate</button>
    </div>
    <div v-if="events.length > 0">
      <ul>
        <li v-for="event in events" :key="event.id">
          <h3>
            {{ event.summary }}
          </h3>
          <p>
            {{ event.description }}
          </p>
          <p>
            {{ new Date(event.start.dateTime).toLocaleTimeString("en-US") }}
          </p>
          <a v-if="event.location" :href="event.location">Location </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HelloWorld",
  data() {
    return {
      url: null,
      token: null,
      events: []
    };
  },
  mounted() {
    if (window.location.search.indexOf("token") > -1) {
      this.token = this.geturlparams("token");
      this.getCalendarEvents();
    } else {
      axios.get("/.netlify/functions/google-auth").then(res => {
        this.url = res.data.redirectURL;
      });
    }
  },
  methods: {
    authenticate() {
      window.location.href = this.url;
    },
    geturlparams(name) {
      // courtesy of https://stackoverflow.com/a/5158301/3216524 //
      var match = RegExp("[?&]" + name + "=([^&]*)").exec(
        window.location.search
      );
      return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    },
    getCalendarEvents() {
      //  https://www.googleapis.com/calendar/v3/calendars/primary/events?key={YOUR_API_KEY}
      var start = new Date();
      start.setHours(0, 0, 0, 0);
      var end = new Date();
      end.setHours(23, 59, 59, 999);
      //  singleEvents=true&timeMax=2019-06-21T06%3A59%3A59.999Z&timeMin=2019-06-20T07%3A00%3A00.000Z
      axios
        .get(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&timeMax=${end.toISOString()}&timeMin=${start.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          }
        )
        .then(res => {
          console.log(res.data.items);
          this.events = res.data.items;
          //  res.data.items.map(event => {
          //    this.events.push({ })
          //  })
        });
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
