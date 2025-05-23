import "dotenv/config";
import { scrape } from "./scraper/scrape.js";
import { summarize, scriptSummarize } from "./openai/summarizer.js";
import { generateAudio } from "./elevenlabs/tts.js";
let articleInfo = await scrape();

console.log("ARTICLES INFO: ", articleInfo);

for (let i = 0; i < articleInfo.length; i++) {
    articleInfo[i] = await summarize(articleInfo[i]);
    console.log("ARTICLE INFO: ", articleInfo[i]);
}

let script = await scriptSummarize(articleInfo);
console.log("SCRIPT: ", script);
await generateAudio(script);
