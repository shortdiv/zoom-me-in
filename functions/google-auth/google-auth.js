// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { google } = require("googleapis");

exports.handler = async () => {
  const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  let oAuth2Client, redirectURL;

  try {
    redirectURL = await authorize();
  } catch (e) {
    console.log("error", e);
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

  if (!redirectURL) {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({
        message: "Page isn't working!"
      })
    };
  }

  const html = `
  <html lang="en">
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <a href="${redirectURL}">Click this link!</a>
      <p>The OAuth Client is ${oAuth2Client}</p>
    </body>
    <script>
      //Do I need JS?
      const oAuthClient = ${oAuth2Client}
    </script>
  </html>`;

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Cache-Control": "no-cache",
      "Content-Type": "text/html"
    },
    body: html
  };

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize() {
    const { CLIENT_SECRET, CLIENT_ID, REDIRECT_URIS } = process.env;
    oAuth2Client = new google.auth.OAuth2(
      `${CLIENT_ID}`,
      `${CLIENT_SECRET}`,
      `${REDIRECT_URIS}`
    );
    return getAccessToken(oAuth2Client);
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES
    });

    return authUrl;
  }
};
