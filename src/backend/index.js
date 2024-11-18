import path from "path";
import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import { savePdfEmbed } from "./backend/supa.js";
import { runQuery } from "./backend/langchain.js";

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
let filepath = path.resolve("./assets/op4_rto_final.pdf");
// Name of table in Supabase
const tableName = "pdfEmbedding";

/* EXECUTION */
const query =
	"What is the decision making process to declare an M/LCC 2 Abnormal Conditions Alert?";

// Create query using existing vectors present in Supabase
runQuery(query, chat, embeddings, supa);
savePdfEmbed(supa, chat, embeddings, filepath);
