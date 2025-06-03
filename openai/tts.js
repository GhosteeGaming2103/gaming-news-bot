import fs from "fs/promises";
import OpenAI from "openai";

const openai = new OpenAI();

/**
 * Generates an audio file from a given script using OpenAI's TTS model.
 * @param {string} script
 * @returns {Promise<void>}
 * @throws {Error} If there is an issue with the OpenAI API or file writing.
 * * This function uses OpenAI's TTS model to convert the provided script into an MP3 audio file.
 */
export async function generateAudio(script) {
    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            response_format: "mp3",
            input: script,
            voice: "onyx",
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.writeFile("./audio/output.mp3", buffer);
    } catch (error) {
        console.error("Error generating audio:", error);
    }
}
