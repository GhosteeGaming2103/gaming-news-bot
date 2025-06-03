import axios from "axios";
import "dotenv/config";
import FormData from "form-data";

/**
 *
 * @param {string} content
 * @param {File} fileBuffer
 * * @returns {Promise<void>} - Sends a message to a Discord channel using a webhook.
 * This function uses the Discord webhook URL from the environment variables to send a message with the provided content and an audio file.
 */
export async function sendDiscordMessage(content, fileBuffer) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.error(
            "Discord webhook URL is not set in the environment variables."
        );
        return;
    }

    const formData = new FormData();
    formData.append("content", `\n${content}\n`);
    formData.append("file", fileBuffer, {
        filename: `Daily_Gaming_News.mp3`,
        contentType: "audio/mpeg",
    });

    const response = await axios.post(webhookUrl, formData, {
        headers: formData.getHeaders(),
    });

    if (response.status !== 200) {
        console.error(
            `Failed to send message to Discord: ${response.status} ${response.statusText}`
        );
    } else {
        console.log("Message sent successfully to Discord.");
    }
}

// fs.readFile("./audio/output.mp3", (err, data) => {
//     if (err) {
//         console.error("Error reading audio file:", err);
//         return;
//     }
//     sendDiscordMessage("This is a test message", data);
// });
