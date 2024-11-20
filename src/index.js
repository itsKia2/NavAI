import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import { loadingEnv, insertAllPdfs } from "./helper.js";

/* INITIALIZATION */
// Used to load Supabase client and OpenAI API
const { supa, chat, embeddings } = loadingEnv();
console.log("Env variables loaded");
const query =
	"Who issued the document given by docket nos ER23-1003-002? What is the director's name?";

/* EXECUTION */
// runQuery(query, chat, embeddings, supa);
insertAllPdfs(supa, embeddings, "./tester.txt");
