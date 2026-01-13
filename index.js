const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {

  const movieName =
    req.body.request.intent.slots.movie.value;

  try {
    const response = await axios.get(
      "https://streaming-availability.p.rapidapi.com/search/title",
      {
        params: {
          title: movieName,
          country: "IN",
          show_type: "movie"
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host":
            "streaming-availability.p.rapidapi.com"
        }
      }
    );

    const platforms =
      response.data.result[0]?.streamingInfo?.in || {};

    const platformNames = Object.keys(platforms);

    const speechText =
      platformNames.length > 0
        ? `${movieName} is available on ${platformNames.join(", ")}`
        : `I could not find ${movieName} online`;

    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: speechText
        },
        shouldEndSession: true
      }
    });

  } catch (error) {
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Sorry, something went wrong."
        },
        shouldEndSession: true
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
