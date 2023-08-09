import { Request, Response } from "express";
import { redis } from "./redis.js";
import axios from "axios";

export default async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const phoneNumber = data.phoneNumber;
    const stateCache = await redis.get(phoneNumber);
    const state = stateCache ? JSON.parse(stateCache) : {};
    let response = "";
    const questions = [
      `Karibu kwenye Patashamba! Hii ni jukwaa ambalo linakusudia kuunganisha wapangaji na watu wanaokodisha ardhi

      Ingiza jina lako`,
      "Ingiza ukubwa wa ardhi(hectares)",
      "Ingiza maelezo ya ardhi",
      `Je, ardhi imezungushiwa uzio(fence)?
      (1) Ndiyo
      (2) Hapana`,
      `Je, ardhi ina hati(tittle)?
      (1) Ndiyo
      (2) Hapana`,
      "Malipo ya kila mwezi yapi?(KSH)",
      "Ardhi inapatikana katika kaunti gani?",
      "Ardhi inapatikana katika kata gani?(ward)",
    ];
    const currentStep = Object.keys(state).length;
    if (currentStep < questions.length) {
      response = `CON ${questions[currentStep]}`;
      state[questions[currentStep]] = true;
      await redis.set(phoneNumber, JSON.stringify(state));
    } else {
      const externalApiUrl =
        "https://patashamba-api-production.up.railway.app/api/v1/ussd";
      const text_data = data.text.split("*");
      console.log(text_data);
      const landData = {
        phoneNumber: phoneNumber,
        ownerName: text_data[0],
        size: text_data[1],
        description: text_data[2],
        fenced: text_data[3],
        tittled: text_data[4],
        charges: text_data[5],
        rate: "Monthly",
        county: text_data[6],
        ward: text_data[7],
      };
      await axios.post(externalApiUrl, landData);
      response = `END Asante kwa kukodisha na PataShamba.`;
      await redis.del(phoneNumber);
    }
    res.set("Content-Type: text/plain");
    res.send(response);
  } catch (err) {
    const error = err as Error;
    console.log(err);
    return res.status(500).json({ success: false, message: error.message });
  }
};
