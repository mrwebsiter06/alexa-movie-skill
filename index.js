const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ GET route for browser testing
app.get("/", (req, res) => {
  res.send("Movie Finder API is working");
});

// Google Sheet details
const SHEET_ID = "1vUx09iufg6L5au3YhHG7SNcXtrn29b_Swa9uYMvg7DA";
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// ✅ Alexa POST endpoint
app.post("/", async (req, res) => {

  const movieSlot = req.body?.request?.intent?.slots?.movie?.value;

  if (!movieSlot) {
    return res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Please tell me the movie name."
        },
        shouldEndSession: false
      }
    });
  }

  const movieName = movieSlot.toLowerCase();

  try {
    const response = await axios.get(SHEET_URL);
    const rows = response.data.split("\n");

    let platform = null;

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!cols) continue;

      const movie = cols[0].replace(/"/g, "").toLowerCase();
      if (movie === movieName) {
        platform = cols[1].replace(/"/g, "");
        break;
      }
    }

    const speechText = platform
      ? `${movieName} is available on ${platform}`
      : `Sorry, I do not have streaming information for ${movieName}`;

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
    console.error(error);
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "There was an error reading the movie database."
        },
        shouldEndSession: true
      }
    });
  }
});

// Render port binding
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Movie Finder API running")
);
