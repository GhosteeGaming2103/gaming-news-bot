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
    gamer who wants the latest updates quickly but with some personality. Limit length of the script to 5000 characters.`;

/**
 *
 * @param {string} article
 * @returns {Promise<Object>} - Returns the article object with a summary property added.
 * This function uses OpenAI's chat completion model to generate a summary of the provided article.
 */
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
        ]        
    });
    let result = await response.choices[0].message.content;
    return result;
}

export async function summarizeArticles(articles) {
    await Promise.all(
        articles.map(async (article) => {
            article.summary = await summarize(article);
        })
    );
    return await articles;
}

/**
 *
 * @param {Array<Article>} articles
 * @returns {Promise<string>} - Returns a script summarizing the provided articles.
 * This function uses OpenAI's chat completion model to generate a script from the summaries of the articles.
 */
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
        max_completion_tokens: 1250,
    });
    return response.choices[0].message.content;
}
