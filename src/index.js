import { genSaveEmbeds } from "./backend/supa.js";
import { runQuery } from "./backend/langchain.js";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

/* INITIALIZATION */

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

// Used to load Supabase client and OpenAI API
const { supa, openai } = loadingEnv();
let filepath = path.resolve("./assets/op4_rto_final.pdf");
// Name of table in Supabase
const tableName = "pdfEmbedding";

/* EXECUTION */

const query =
	"What is the Supervisor of Short Term Outage Coordination responsible for during Operating Procedure No. 3 - Transmission Outage Scheduling (OP-3) event";

// Create query using existing vectors present in Supabase
runQuery(query, openai, supa);
