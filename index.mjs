import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import request from "request";

dotenv.config();

const BASE_URL = "https://api.api-ninjas.com/v1/historicalevents?year=";
const PREF_IMG_SIZE = "1024x1024";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const imageInfo = {
  base64: "",
  event: "",
};

const stylePrompts = [
  " with a Realism art style",
  " with a Cartoon art style",
  " with a Abstract art style",
  " with a Baroque art style",
  " with a Classicism art style",
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
  const urlFormatted = `${BASE_URL}${date.year}&month=${date.month}`;
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

export const generateImage = () => {
  getPrompt().then(async (data) => {
    const response = data;
    const parsedResponse = JSON.parse(response);
    const closestEvent = getClosestEvent(parsedResponse);
    const style = stylePrompts[Math.floor(Math.random() * stylePrompts.length)];
    const imgResponse = await openai.createImage({
      prompt: closestEvent.event + style,
      n: 1,
      size: PREF_IMG_SIZE,
      response_format: "b64_json",
    });

    console.log("Hej!");

    imageInfo.event = closestEvent.event;
    imageInfo.base64 = imgResponse.data.data[0].b64_json;
    const imgElement = document.getElementById("image");
    imgElement.src = "data:image/png;base64," + imageInfo.base64;
    const pElement = document.getElementById("image-caption");
    pElement.textContent = imageInfo.event;
  });
};

document.querySelector("#generate-img-btn");

myButton.addEventListener("click", () => {
  console.log("click");
  generateImage();
});
