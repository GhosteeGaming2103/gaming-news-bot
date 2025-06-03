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

/**
 *
 * @param {number} day_id
 * @param {Article} article
 * * @returns {Promise<number>} - Inserts an article into the database and returns its ID.
 * This function inserts an article into the "articles" table in the Supabase database.
 * It takes the day ID and an article object containing the title, text content, and summary.
 */
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

/**
 *
 * @returns {Promise<Object>} - Inserts a new day into the database and returns the inserted day object.
 * This function inserts a new day into the "days" table in the Supabase database.
 * It uses the current date as the date for the new day.
 */
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

/**
 *
 * @param {number} id
 * @param {string} script
 * @param {string} audioUuid
 * * @returns {Promise<void>} - Updates the day with the given ID in the database with the provided script and audio UUID.
 * This function updates the "days" table in the Supabase database.
 * It updates the script and audio file UUID for a specific day identified by its ID.
 * It logs the success or error message to the console.
 */
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

/**
 *
 * @returns {Promise<string>} - Uploads an audio file to Supabase storage and returns the UUID of the uploaded file.
 * This function reads an audio file from the local filesystem,
 * uploads it to the Supabase storage bucket specified in the environment variables,
 * and returns the UUID of the uploaded file.
 * It logs the success or error message to the console.
 *
 */
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

/**
 *
 * @param {string} uuid
 * * @returns {Promise<void>} - Downloads an audio file from Supabase storage using the provided UUID and saves it to the local filesystem.
 * This function downloads an audio file from the Supabase storage bucket specified in the environment variables.
 * It uses the provided UUID to locate the file in the "audio" directory,
 * saves it to the local filesystem at "./download/audio.mp3",
 * and logs the success or error message to the console.
 */
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
