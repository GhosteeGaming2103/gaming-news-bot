import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import fs from "fs/promises";

const elevenlabs = new ElevenLabsClient();

/**
 *
 * @param {string} script
 * @returns {Promise<void>} - Generates an audio file from the provided script using ElevenLabs TTS.
 * * This function uses ElevenLabs' text-to-speech service to convert the provided script into an MP3 audio file.
 */
export async function generateAudio(script) {
    const audio = await elevenlabs.textToSpeech.convert(
        "JBFqnCBsd6RMkjVDRZzb",
        {
            text: script,
            voiceId: "JBFqnCBsd6RMkjVDRZzb",
            modelId: "eleven_flash_v2_5",
            outputFormat: "mp3_44100_128",
        }
    );

    await fs.writeFile("./audio/output.mp3", audio);
}
