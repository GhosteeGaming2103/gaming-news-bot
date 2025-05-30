import "dotenv/config";
import { scrape } from "./scraper/scrape.js";
import { summarize, scriptSummarize } from "./openai/summarizer.js";
import { generateAudio } from "./elevenlabs/tts.js";
import {
    insertArticle,
    insertDay,
    updateDay,
    addAudio,
} from "./supabase/client.js";
import fs from "fs/promises";
import { sendDiscordMessage } from "./discord/webhook.js";

let articleInfo = await scrape();
let day = await insertDay();

for (let i = 0; i < articleInfo.length; i++) {
    articleInfo[i] = await summarize(articleInfo[i]);
    await insertArticle(day.id, articleInfo[i]);
}

let script = await scriptSummarize(articleInfo);
await generateAudio(script);

let audioUuid = await addAudio();

day = await updateDay(day.id, script, audioUuid);

sendDiscordMessage(
    `New daily news summary for ${new Date().toLocaleDateString()}`,
    await fs.readFile("./audio/output.mp3")
);
