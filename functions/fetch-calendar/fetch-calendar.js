const { google } = require("googleapis");

exports.handler = async event => {
  let params = event.queryStringParameters;
  const code = params.code;

  let oAuth2Client, events;

  try {
    events = await getAccessToken(code, listEvents);
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({
        error: e.message
      })
    };
  }

  function getAccessToken(code, callback) {
    const { CLIENT_SECRET, CLIENT_ID, REDIRECT_URIS } = process.env;

    oAuth2Client = new google.auth.OAuth2(
      `${CLIENT_ID}`,
      `${CLIENT_SECRET}`,
      `${REDIRECT_URIS}`
    );
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);

      return callback(oAuth2Client);
    });
  }

  function listEvents(auth) {
    const calendar = google.calendar({ version: "v3", auth });
    // const calEvents = [];
    calendar.events.list(
      {
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime"
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const events = res.data.items;
        // if (events.length) {
        //   console.log("Upcoming 10 events:");
        //   events.map(event => {
        //     const start = event.start.dateTime || event.start.date;
        //     calEvents.push(event);
        //     console.log(`${start} - ${event.summary}`);
        //   });
        // } else {
        //   console.log("No upcoming events found.");
        // }
        return events;
      }
    );
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Cache-Control": "no-cache",
      "Content-Type": "text/html"
    },
    body: JSON.stringify({ events, msg: "hello" })
  };
};
