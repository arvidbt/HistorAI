import { Configuration, OpenAIApi } from "openai";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import request from "request";

dotenv.config();

const app = express().use(bodyParser.json());
const port = 1337;

const BASE_URL = "https://api.api-ninjas.com/v1/historicalevents?year=";
const PREF_IMG_SIZE = "1024x1024";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const stylePrompts = [
  " with a realistic style",
  " with a cartoonish style",
  " with a abstract style",
  " with a Baroque style",
  " with a Classicism style",
  " with a Conceptual art style",
];

const getClosestEvent = (parsedResponse) => {
  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() - 100);

  let closestEvent = null;
  let minDiff = Infinity;

  parsedResponse.forEach((event) => {
    const eventDate = new Date(`${event.year}-${event.month}-${event.day}`);
    const diff = Math.abs(
      (eventDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff < minDiff) {
      minDiff = diff;
      closestEvent = event;
    }
  });
  return closestEvent;
};

const getDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 100);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return { day: day, month: month, year: year };
};

const getPrompt = async () => {
  const date = getDate();
  const urlFormatted = `${BASE_URL}${date.year}&month=${date.month}`; // &day=${date.day}
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: urlFormatted,
        headers: {
          "X-Api-Key": process.env.NINJA_API_KEY,
        },
      },
      (error, _response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      }
    );
  });
};

app.post("/image", (req, res) => {
  getPrompt().then(async (data) => {
    const response = data;
    const parsedResponse = JSON.parse(response);
    const closestEvent = getClosestEvent(parsedResponse);
    const imgResponse = await openai.createImage({
      prompt:
        closestEvent.event +
        stylePrompts[Math.floor(Math.random() * stylePrompts.length)],
      n: 1,
      size: PREF_IMG_SIZE,
    });
    res.send(imgResponse.data.data[0].url);
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
