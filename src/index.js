// Import the Supabase client
import { createClient } from "@supabase/supabase-js";
import { PdfReader } from "pdfreader";
import OpenAI from "openai";
import path from "path";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

function loading() {
	// Load environment variables (if using dotenv)
	const SUPABASE_URL = process.env.SUPABASE_URL;
	const SUPABASE_API_KEY = process.env.SUPABASE_KEY;

	// Create the Supabase client
	return createClient(SUPABASE_URL, SUPABASE_API_KEY);
}

// Function to perform SELECT query
async function selectData(supabase, table) {
	const { data, error } = await supabase.from(table).select();

	if (error) {
		console.error("Error fetching data:", error);
	} else {
		console.log("Data:", data);
	}
}

async function insertData(supabase, content, embedding) {
	const { error } = await supabase
		.from("embedTest")
		.insert({ content: content, embedding: embedding });

	if (error) {
		console.error("Error inserting data:", error);
	} else {
		console.log("Data inserted successfully");
	}
}

async function getPdfData(pdfFilePath) {
	const textContent = [];

	new PdfReader().parseFileItems(pdfFilePath, (err, item) => {
		if (err) {
			console.error("Error reading PDF:", err);
		} else if (!item) {
			// End of file reached
			// console.log(textContent.join(" "));
		} else if (item.text) {
			// Accumulate the text content
			textContent.push(item.text);
		}
	});
	// console.log("Result: \n" + textContent);
	return textContent.join(" ");
}

// Okay this one is kinda confusing but
// This creates AND inserts into the Supabase database
async function genSaveEmbeds(supabase, filepath) {
	const key = process.env.OPENAI_API_KEY;
	const configuration = new OpenAI({
		apiKey: key,
	});
	const open = new OpenAI(configuration);

	// const document = await getDocuments();
	const document = await getPdfData(filepath);

	// Assuming each document is a string
	// changed from for loop to just happening once
	// for document in documents {}
	// OpenAI recommends replacing newlines with spaces for best results
	const input = document.replace(/\n/g, " ");

	const embeddingResponse = await open.embeddings.create({
		model: "text-embedding-ada-002",
		input,
	});

	// console.log("Embedding response:", embeddingResponse);
	if (embeddingResponse && embeddingResponse.data) {
		const [{ embedding }] = embeddingResponse.data;

		insertData(supabase, path.basename(filepath), embedding);
		console.log("Data inserted ?? ");
		// return embedding;
	} else {
		throw Error("Something wrong with embedding");
	}
}

// Execution
const supa = loading();
const tableName = "embedTest";
const filepath = "/home/kia/Uni/NavAI/istwo.pdf";
// getPdfData("/home/kia/Uni/CS320/isone.pdf");
await genSaveEmbeds(supa, filepath);
selectData(supa, tableName);
