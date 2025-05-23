import { OpenAI } from "openai";
import "dotenv/config";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const summarizerPrompt = `You will receive the title and content of a gaming news article. 
    Your task is to summarize the article concisely in plain text to not add markup for list or anything of the sort. 
    Do not include any headings, labels, or formatting—just a clear and natural summary. 
    Focus on the key points, including what happened, who is involved, and why it matters to gamers.`;

const scriptPrompt = `You will receive a list of short summaries about recent gaming news. 
    Your task is to turn them into a single, cohesive podcast or YouTube news script written in a casual and energetic tone—like a 
    gaming news YouTuber would use. The script should sound natural when read aloud by an AI voice, 
    so keep sentences smooth, conversational, and engaging. Add light transitions between topics,
    but do not include any headings, labels, or formatting—just plain text. Assume the listener is a 
    gamer who wants the latest updates quickly but with some personality.`;

export async function summarize(article) {
    const response = await client.chat.completions.create({
        model: "o4-mini-2025-04-16",
        messages: [
            {
                role: "system",
                content: summarizerPrompt,
            },
            {
                role: "user",
                content: `Title: ${article.title}\n\nContent: ${article.textContent}`,
            },
        ],
    });
    article.summary = response.choices[0].message.content;

    return article;
}

export async function scriptSummarize(articles) {
    let scriptList = "";
    for (let i = 0; i < articles.length; i++) {
        scriptList += `\n\n${i + 1}. ${articles[i].summary}`;
    }

    const response = await client.chat.completions.create({
        model: "o4-mini-2025-04-16",
        messages: [
            {
                role: "system",
                content: scriptPrompt,
            },
            {
                role: "user",
                content: scriptList,
            },
        ],
    });
    return response.choices[0].message.content;
}
