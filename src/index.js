import path from "path";
import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import { savePdfEmbed } from "./backend/supa.js";
import { runQuery } from "./backend/langchain.js";
import { extractLinks } from "./backend/pdfreader.js";

/* INITIALIZATION */
function loadingEnv() {
	// Load environment variables using dotenv
	const SUPABASE_URL = process.env.SUPABASE_URL;
	const SUPABASE_API_KEY = process.env.SUPABASE_KEY;
	const openaikey = process.env.OPENAI_API_KEY;

	// Chat client
	const openai = new ChatOpenAI({
		apiKey: openaikey,
		model: "gpt-3.5-turbo",
		temperature: 0.3,
	});

	// Embedding client
	const embeddings = new OpenAIEmbeddings({
		apiKey: openaikey,
		model: "text-embedding-ada-002",
	});

	// Supabase client
	const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

	// Create the Supabase client and OpenAI key
	return {
		supa: supabase,
		chat: openai,
		embeddings: embeddings,
	};
}

// Used to load Supabase client and OpenAI API
const { supa, chat, embeddings } = loadingEnv();
console.log("Env variables loaded");
// Name of table in Supabase
const tableName = "pdfEmbedding";

// Used to load every link from .txt into array
const links = path.resolve("./pdflinks.txt");
let linksArr = await extractLinks(links);

/* EXECUTION */
const query =
	"Who issued the document given by docket nos ER23-1003-002? What is the director's name?";

// runQuery(query, chat, embeddings, supa);

// Go through linksArr and add each link to db
let counter = 0;
linksArr.map(async (link) => {
	await savePdfEmbed(supa, embeddings, link);
	counter = counter + 1;
	console.log("Saved link - " + counter);
});
