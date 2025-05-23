import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import fs from "fs/promises";

const elevenlabs = new ElevenLabsClient();

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
