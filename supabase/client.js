import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

// Create a single supabase client for interacting with your database
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// console.log("Supabase client created");

// const { data, error } = await supabase
//     .from("test")
//     .insert({
//         title: "test1",
//         text: "test2",
//         summary: "test3",
//     })
//     .select();

// if (error) {
//     console.error("Error inserting data:", error);
// } else {
//     console.log("Data inserted successfully:", data);
// }

export async function insertArticle(day_id, article) {
    const { data, error } = await supabase
        .from("articles")
        .insert({
            day_id: day_id,
            title: article.title,
            text: article.textContent,
            summary: article.summary,
        })
        .select();

    if (error) {
        console.error("Error inserting data:", error);
    } else {
        console.log("Data inserted successfully:", data);
        return data[0].id;
    }
}

export async function insertDay() {
    const date = new Date().toLocaleDateString();
    const { data, error } = await supabase
        .from("days")
        .insert({
            date: date,
        })
        .select();

    if (error) {
        console.error("Error inserting data:", error);
    } else {
        console.log("Data inserted successfully:", data);
        return data[0];
    }
}

export async function updateDay(id, script, audioUuid) {
    const { data, error } = await supabase
        .from("days")
        .update({
            script: script,
            audio_file: audioUuid,
        })
        .eq("id", id)
        .select();

    if (error) {
        console.error("Error updating data:", error);
    } else {
        console.log("Data updated successfully:", data);
    }
}

export async function addAudio() {
    const audioFile = await fs.readFile("./audio/output.mp3");
    const uuid = randomUUID() + ".mp3";
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(`audio/${uuid}`, audioFile, {
            cacheControl: "3600",
            upsert: false,
        });
    if (error) {
        console.error("Error uploading audio:", error);
    } else {
        console.log("Audio uploaded successfully:", data);
        return uuid;
    }
}

export async function dowloadAudio(uuid) {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .download(`audio/${uuid}.mp3`);
    if (error) {
        console.error("Error downloading audio:", error);
    } else {
        await fs.writeFile(
            "./download/audio.mp3",
            Buffer.from(await data.arrayBuffer())
        );
        console.log("Audio saved to ./download/audio.mp3");
    }
}
