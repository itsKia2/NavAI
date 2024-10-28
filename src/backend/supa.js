import { PdfReader } from "pdfreader";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import path from "path";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

// EXPORTS
export { loadingEnv, selectData, genSaveEmbeds, runQuery };

// TODO integrate langchain into this instead of what im doing right now
// TODO find out if we need average embedding vector or should we just have a BUNCH of vectors

// This is the size of each chunk
const MAX_TOKENS = 8192;

function loadingEnv() {
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

async function selectData(supabase, table) {
	const { data, error } = await supabase.from(table).select();

	if (error) {
		console.error("Error fetching data:", error);
	} else {
		console.log("Data:", data);
	}
}

async function insertData(supabase, title, content, embedding) {
	const { error } = await supabase
		.from("pdfEmbedding")
		.insert({ title: title, content: content, embedding: embedding });

	if (error) {
		console.error("Error inserting data:", error);
	} else {
		console.log("insertData worked successfully");
	}
}

async function getPdfData(pdfFilePath) {
	return new Promise((resolve, reject) => {
		let textContent = [];
		new PdfReader().parseFileItems(pdfFilePath, (err, item) => {
			if (err) {
				console.error("Error reading PDF:", err);
				reject(err);
			} else if (!item) {
				// End of file reached
				// return textContent.join(" ");
				resolve(textContent.join(" "));
			} else if (item.text) {
				// Accumulate the text content
				textContent.push(item.text);
			}
		});
	});
}

function chunkText(text) {
	const words = text.split(" ");
	const chunks = [];
	let currentChunk = [];

	for (let word of words) {
		currentChunk.push(word);
		// Check token count approximation (1 word ≈ 1 token)
		if (currentChunk.join(" ").length > MAX_TOKENS) {
			chunks.push(currentChunk.join(" "));
			currentChunk = []; // Start a new chunk
		}
	}
	// Push remaining words as the last chunk
	if (currentChunk.length > 0) {
		chunks.push(currentChunk.join(" "));
	}

	console.log("Size of chunks: " + chunks.length);
	return chunks;
}

// Okay this one is kinda confusing but
// This creates AND inserts into the Supabase database
async function genSaveEmbeds(supabase, openai, filepath) {
	// Helper function to store the pdf data in variable doc
	let doc = "";
	let storeDoc = (input) => {
		doc = "";
		doc = input;
	};

	await getPdfData(filepath).then((x) => storeDoc(x));
	const lotsEmbeds = [];
	const lotsText = [];

	// Replace newlines with spaces - OpenAI doc says easier to read
	const myInput = doc.replace(/\n/g, " ");
	// Break the big pdf into chunks that I can pass into OpenAI
	const chunks = chunkText(myInput);

	for (let chunk of chunks) {
		// create embedding FOR EACH CHUNK
		const embeddingResponse = await openai.embeddings.create({
			model: "text-embedding-ada-002",
			input: chunk,
		});
		// pushing EACH chunk into the array which will be put into db LATER
		if (embeddingResponse && embeddingResponse.data) {
			const [{ embedding }] = embeddingResponse.data;
			// replaced insertData with lotsEmbeds.push
			lotsEmbeds.push(embedding);
			lotsText.push(chunk);
		} else {
			throw Error("Something wrong with embedding response");
		}
	}

	// now we insert all these chunks one by one into the db
	for (let i = 0; i < lotsEmbeds.length; i++) {
		insertData(supabase, path.basename(filepath), lotsText[i], lotsEmbeds[i]);
		console.log("Chunk added to DB");
	}
}

async function runQuery(query, openai, supabase) {
	// Create vector embedding for the query
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

		// Now using info from the closest vector, we can pass it into ChatGPT to get response
		let vectorData = data[0].content;
		const prompt = `The prompt is: ${query}. Here is the relevant information, please answer: ${vectorData}`;
		const gptResp = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{ role: "user", content: prompt }, // The user's query or prompt
			],
			max_tokens: 1500,
		});
		const response = gptResp.choices[0].message.content.trim();
		console.log("ChatGPT: " + response);
	}
}
