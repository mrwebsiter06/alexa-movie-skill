const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// REPLACE with your Google Sheet ID
const SHEET_ID = "1vUx09iufg6L5au3YhHG7SNcXtrn29b_Swa9uYMvg7DA";

// Google Sheets public CSV URL
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

app.post("/", async (req, res) => {
  const movieName =
    req.body.request.intent.slots.movie.value.toLowerCase();

  try {
    const response = await axios.get(SHEET_URL);
    const rows = response.data.split("\n");

    let found = false;
    let platform = "";

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(",");
      const movie = cols[0]?.replace(/"/g, "").toLowerCase();

      if (movie === movieName) {
        platform = cols[1].replace(/"/g, "");
        found = true;
        break;
      }
    }

    const speechText = found
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

const PORT = process.env.PORT || 3000;
app.listen(PORT);
