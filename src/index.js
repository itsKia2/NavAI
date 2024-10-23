import { loadingEnv, runQuery } from "./backend/supa.js";

function main() {
	const { supa, openai } = loadingEnv();
	runQuery(
		"What are the Public Notifications associated with forecast or actual implementation of OP-4?",
		openai,
		supa,
	);
}

main();
