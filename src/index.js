import { genSaveEmbeds, loadingEnv, runQuery } from "./backend/supa.js";
import path from "path";

/* INITIALIZATION */

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
