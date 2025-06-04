/**
 * @file index.js
 * @description Main entry point for the news summarization application.
 * Scrapes articles, summarizes them, creates a script, generates an audio file,
 * sends a discord message containing the audio, and inserts the data into Supabase.
 *
 */

import "dotenv/config";
import { scrape } from "./scraper/scrape.js";
import { summarizeArticles, scriptSummarize } from "./openai/summarizer.js";
import { generateAudio } from "./elevenlabs/tts.js";
// import { generateAudio } from "./openai/tts.js";
import { insertDayAndArticles } from "./supabase/client.js";
import fs from "fs/promises";
import { sendDiscordMessage } from "./discord/webhook.js";

try {
    let articles = await scrape();

    articles = await summarizeArticles(articles);

    let script = await scriptSummarize(articles);

    console.log("Script response: ", script);
    await generateAudio(script);

    sendDiscordMessage(
        `New daily news summary for ${new Date().toLocaleDateString()}`,
        await fs.readFile("./audio/output.mp3")
    );

    await insertDayAndArticles(script, articles);
} catch (error) {
    console.error("Error in main execution: ", error);
}
