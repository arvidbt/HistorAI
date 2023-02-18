import { Configuration, OpenAIApi } from "openai";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import request from "request";

dotenv.config();

const app = express().use(bodyParser.json());
const port = 1337;

const PROMPT_EVENT_URL = "https://api.api-ninjas.com/v1/historicalevents?text=";
const PREF_IMG_SIZE = "1024x1024";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const getPrompt = async () => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: PROMPT_EVENT_URL + "roman empire",
        headers: {
          "X-Api-Key": process.env.NINJA_API_KEY,
        },
      },
      (error, response, body) => {
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
    const imgResponse = await openai.createImage({
      prompt: parsedResponse[0].event,
      n: 1,
      size: PREF_IMG_SIZE,
    });
    res.send(imgResponse.data.data[0].url);
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
