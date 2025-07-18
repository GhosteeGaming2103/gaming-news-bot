import "dotenv/config";

import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();

await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
);

let tempDate = new Date();
tempDate = tempDate.setDate(tempDate.getDate() - 1);
const previousDay = new Date(tempDate);
console.log("Previous day: ", previousDay.toLocaleDateString());
let currentDay = true;
let articlesInfoArr = [];

/**
 * Class representing an article.
 * @class
 * @param {string} title - The title of the article.
 * @param {string} textContent - The text content of the article.
 */
class Article {
    constructor(title, textContent) {
        this.title = title;
        this.textContent = textContent;
    }
}

/**
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of articles.
 * This function scrapes the website for articles, checks their dates, and retrieves their data.
 */
export async function scrape() {
    await page.goto(`${process.env.WEBSITE_URL}`);

    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    });
    const loadMoreButton = await page.$("#load-more");
    let articles = [];
    while (currentDay) {
        let lastIndex = 0;
        articles = await page.$$("#post-container .post-item");
        console.log(articles.length);
        lastIndex = await getOldestDate(articles);
        console.log("LAST INDEX: ", lastIndex);
        loadMoreButton.click();
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2000);
            });
        });
        articles = articles.slice(0, lastIndex); //set to lastIndex when not testing
    }

    console.log("No more articles from today found.");
    console.log("NUMBER OF ARTICLES: ", articles.length);

    for (const article of articles) {
        await getArticleData(article);
    }
    await browser.close();
    return articlesInfoArr;
}

/**
 *
 * @param {Array<Article>} articles
 * @returns {number} - The index of the oldest article that is not from the current day.
 * This function checks the date of each article and returns the index of the first article
 * that is not from the current day. If all articles are from the current day, it returns -1.
 */
async function getOldestDate(articles) {
    if (articles.length > 0) {
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const timeElement = await article.$("time");
            if (timeElement) {
                const timeValue = await page.evaluate(
                    (el) => el.getAttribute("datetime"),
                    timeElement
                );
                let articlesDate = new Date(timeValue);
                if (
                    articlesDate > previousDay ||
                    articlesDate.toLocaleDateString() ===
                        previousDay.toLocaleDateString()
                ) {
                    console.log("Current day articles found.");
                    currentDay = true;
                } else {
                    console.log("No current day articles found.");
                    currentDay = false;
                    console.log(
                        "Oldest article date: ",
                        articlesDate.toLocaleDateString()
                    );
                    return i;
                }
            } else {
                console.log("No <time> element found on the last article.");
                currentDay = false;
            }
        }
    } else {
        console.log("No articles found.");
        currentDay = false;
    }
}

/**
 *
 * @param {Array<Article>} article
 * @returns {Promise<void>} - A promise that resolves when the article data is retrieved.
 * This function retrieves the title and content of an article,
 * creates an Article object, and adds it to the articlesInfoArr array.
 */
async function getArticleData(article) {
    try {
        let newPage = await browser.newPage();
        await newPage.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        );
        const anchorElement = await article.$("a");
        const articleUrl = await page.evaluate(
            (el) => el.getAttribute("href"),
            anchorElement
        );
        console.log("Article URL: ", articleUrl);
        await newPage.goto(articleUrl);

        let title = await newPage.$eval("header", (header) =>
            header.querySelector("h1").textContent.trim()
        );
        let newsArticles = await newPage.$("article");
        let paragraphs = await newsArticles.$$("p");
        let paragraphsText = await Promise.all(
            paragraphs.map(async (paragraph) => {
                return await newPage.evaluate(
                    (el) => el.textContent.trim(),
                    paragraph
                );
            })
        );
        let newsArticle = new Article(title, paragraphsText.join(" "));
        articlesInfoArr.push(newsArticle);
        await newPage.close();
    } catch (e) {
        console.log("Error getting anchor element: ", e);
    }
}
