<template>
  <BackgroundImage>
    <div class="header">
      <h1>Servus {{ owner }}</h1>
      <p>{{ time }}</p>
    </div>
    <div class="events-meta-wrapper">
      <div v-if="!token">
        <button @click="authenticate">Sign me in</button>
      </div>
      <div v-if="events.length > 0" class="events-list">
        <ul>
          <li v-for="event in sortEvents" :key="event.id">
            <p>{{ eventTime(event.start.dateTime) }}</p>
            <h3>{{ event.summary }}</h3>
            <a
              v-if="event.meeting.type === 'Zoom Meeting'"
              :href="event.meeting.link"
              class="events-location"
            >
              <img src="../../public/zoom-logo.jpg" alt />
            </a>
            <a
              v-else-if="event.meeting.type === 'Hangouts Meet'"
              :href="event.meeting.link"
              class="events-location"
            >
              <img src="../../public/meet-logo.png" alt />
            </a>
            <a v-else href="#" class="events-location">
              <img src="../../public/question-logo.png" alt />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </BackgroundImage>
</template>

<script>
import axios from "axios";
import BackgroundImage from "./BackgroundImage.vue";

export default {
  name: "HelloWorld",
  components: {
    BackgroundImage
  },
  data() {
    return {
      height: null,
      width: null,
      url: null,
      token: null,
      owner: "Guest",
      events: [],
      time: null
    };
  },
  computed: {
    sortEvents() {
      let calEvents = [];
      this.events.map(event => {
        let ev;
        if (event.conferenceData) {
          ev = {
            meeting: {
              type: event.conferenceData.conferenceSolution.name,
              link: event.conferenceData.entryPoints[0].uri
            },
            ...event
          };
        } else if (event.location !== undefined) {
          if (event.location.includes("zoom")) {
            ev = {
              meeting: {
                type: "Zoom Meeting",
                link: event.location
              },
              ...event
            };
          }
        } else {
          ev = {
            meeting: {
              type: undefined,
              link: undefined
            },
            ...event
          };
        }
        calEvents.push(ev);
      });
      console.log(calEvents);
      return calEvents;
    }
  },
  created() {
    this.time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    setInterval(this.tick, 1000);
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
    eventTime(time) {
      return new Date(time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    },
    tick() {
      this.time = new Date().toLocaleTimeString();
    },
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
      axios
        .get(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&timeMax=${end.toISOString()}&timeMin=${start.toISOString()}&orderBy=startTime`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          }
        )
        .then(res => {
          console.log(res.data.items);
          this.owner = res.data.summary.split("@")[0];
          this.events = res.data.items;
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.header {
  position: absolute;
  height: 50px;
  width: 100%;
  color: white;
}
.events-meta-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.events-location img {
  width: 30px;
  border-radius: 50%;
}
ul {
  list-style-type: none;
  padding: 0 2.3em;
  margin: 0;
}
li {
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  overflow: hidden;
  padding: 1em 0;
  &:not(:last-child) {
    border-bottom: 1px solid #00000047;
  }
}
h3 {
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 12em;
}
p {
  margin: 0;
}
.events-list {
  position: absolute;
  background: #eeeeee;
  border-radius: 4px;
  width: 44.1%;
}
button {
  position: relative;
  cursor: pointer;
  font-size: 1.5em;
  padding: 0.5em 1em;
  border-radius: 10px;
}
</style>
