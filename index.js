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
let articleInfo = await scrape();
console.log("ARTICLES INFO: ", articleInfo);
let date = new Date();
let day = await insertDay(date.toLocaleDateString());
console.log("DAY ID: ", day);

for (let i = 0; i < articleInfo.length; i++) {
    articleInfo[i] = await summarize(articleInfo[i]);
    let article = await insertArticle(day.id, articleInfo[i]);
    console.log("ARTICLE INFO INSERTED: ", article);
}
let script = await scriptSummarize(articleInfo);

console.log("SCRIPT: ", script);
await generateAudio(script);

let audioUuid = await addAudio();

day = await updateDay(day.id, script, audioUuid);
