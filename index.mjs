import { Configuration, OpenAIApi } from "openai";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import request from "request";

dotenv.config();

const app = express();
const port = 1337;

const eventApiRoute = "https://api.api-ninjas.com/v1/historicalevents?text=";

app.use(bodyParser.json());

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

app.post("/image", async (req, res) => {
  const { prompt } = req.body;
  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });

  res.send(response.data.data[0].url);
});

app.get("/prompt", async (req, res) => {
  const query = req.body.prompt;
  request.get(
    {
      url: eventApiRoute + query,
      headers: {
        "X-Api-Key": process.env.NINJA_API_KEY,
      },
    },
    (_error, _response, body) => {
      res.json(body);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
