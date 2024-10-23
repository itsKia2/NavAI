import { PdfReader } from "pdfreader";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import path from "path";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

// Execution
const { supa, openai } = loading();
const tableName = "pdfEmbeddings";
// const filepath = "/home/kia/Uni/NavAI/istwo.pdf";
// await genSaveEmbeds(supa, openai, "/home/kia/Uni/NavAI/op4_rto_final.pdf");
// await genSaveEmbeds(supa, openai, "/home/kia/Uni/NavAI/crop_25011.pdf");
// await genSaveEmbeds(
// 	supa,
// 	openai,
// 	"/home/kia/Uni/NavAI/sop_outsch_0030_0020.pdf",
// );
const query =
	"What are the Public Notifications associated with forecast or actual implementation of OP-4?";
console.log("Query: " + query);
runQuery(query, openai, supa);

function loading() {
	// Load environment variables (if using dotenv)
	const SUPABASE_URL = process.env.SUPABASE_URL;
	const SUPABASE_API_KEY = process.env.SUPABASE_KEY;
	const openaikey = process.env.OPENAI_API_KEY;

	const config = new OpenAI({ apiKey: openaikey });
	const openai = new OpenAI(config);
	const client = createClient(SUPABASE_URL, SUPABASE_API_KEY);

	// Create the Supabase client and OpenAI key
	return {
		supa: client,
		openai: openai,
	};
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
		.from("pdfEmbeddings")
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
async function genSaveEmbeds(supabase, openai, filepath) {
	// const document = await getDocuments();
	const document = await getPdfData(filepath);

	// Assuming each document is a string
	// changed from for loop to just happening once
	// for document in documents {}
	// OpenAI recommends replacing newlines with spaces for best results
	const myInput = document.replace(/\n/g, " ");

	const embeddingResponse = await openai.embeddings.create({
		model: "text-embedding-ada-002",
		input: myInput,
	});

	// console.log("Embedding response:", embeddingResponse);
	if (embeddingResponse && embeddingResponse.data) {
		const [{ embedding }] = embeddingResponse.data;

		insertData(supabase, path.basename(filepath), embedding);
		console.log("Data inserted");
		// return embedding;
	} else {
		throw Error("Something wrong with embedding");
	}
}

async function runQuery(query, openai, supabase) {
	const queryEmbed = await openai.embeddings.create({
		model: "text-embedding-ada-002",
		input: query,
	});

	if (queryEmbed && queryEmbed.data) {
		const currEmbed = queryEmbed.data[0].embedding;
		const { data, error } = await supabase.rpc("find_closest_embedding", {
			query_embedding: currEmbed,
		});

		if (error) {
			console.error("Error fetching closest vector:", error);
			return null;
		}
		console.log("Relevant file: " + data[0].content);
		console.log("Distance between vectors: " + data[0].distance);
	}
}
