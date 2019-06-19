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
        error: "I AM AN ERROR MESSAGE"
      })
    };
  }

  async function getAccessToken(code, callback) {
    const { CLIENT_SECRET, CLIENT_ID, REDIRECT_URIS } = process.env;

    oAuth2Client = new google.auth.OAuth2(
      `${CLIENT_ID}`,
      `${CLIENT_SECRET}`,
      `${REDIRECT_URIS}`
    );

    try {
      let token = await oAuth2Client.getToken(code);
      await oAuth2Client.setCredentials(token.tokens);
      return callback(oAuth2Client);
    } catch (e) {
      return console.error("Error retrieving access token", e);
    }
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async function listEvents(auth) {
    const calendar = google.calendar({ version: "v3", auth });
    try {
      const cal = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime"
      });
      return cal.data.items;
    } catch (e) {
      return console.log("The API returned an error: " + e);
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Cache-Control": "no-cache",
      "Content-Type": "text/html"
    },
    body: JSON.stringify({ event: events, msg: "hello" })
  };
};
