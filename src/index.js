import { loadingEnv, runQuery } from "./backend/supa.js";

/* INITIALIZATION */

// Used to load Supabase client and OpenAI API
const { supa, openai } = loadingEnv();
let filepath = path.resolve("../assets/crop_25011.pdf");
// Name of table in Supabase
const tableName = "pdfEmbedding";

/* EXECUTION */

// Create query using existing vectors present in Supabase
runQuery(
	"What are the Public Notifications associated with forecast or actual implementation of OP-4?",
	openai,
	supa,
);
