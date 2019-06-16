const { google } = require("googleapis");

exports.handler = async event => {
  let params = event.queryStringParameters;
  const code = params.code;

  let oAuth2Client, events;

  try {
    events = await getAccessToken(code);
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

  function getAccessToken(code) {
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
      // oAuth2Client.setCredentials(token);

      return token;
    });
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
