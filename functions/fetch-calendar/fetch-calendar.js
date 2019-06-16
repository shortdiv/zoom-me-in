const { google } = require("googleapis");

exports.handler = async event => {
  let params = event.queryStringParameters;
  const code = params.code;

  let oAuth2Client;

  try {
    const events = await getAccessToken(code, listEvents);
    console.log(events);
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({
        error: "I AM AN ERROR MESSAGE"
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

    oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.readonly"]
    });
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);

      callback(oAuth2Client);
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth) {
    const calendar = google.calendar({ version: "v3", auth });
    console.log(calendar);
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
        console.log(events);
        if (events.length) {
          console.log("Upcoming 10 events:");
          events.map(event => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${start} - ${event.summary}`);
          });
        } else {
          console.log("No upcoming events found.");
        }
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
    body: JSON.stringify({ msg: "hello" })
  };
};
