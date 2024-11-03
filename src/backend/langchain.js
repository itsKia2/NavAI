export { runQuery };

async function runQuery(query, chat, embeddings, supabase) {
	// Create vector embedding for the query
	const queryEmbed = await embeddings.embedQuery(query);

	// Find the closest vector in the Supabase
	const { data, error } = await supabase.rpc("find_closest_embedding", {
		query_embedding: queryEmbed,
	});

	if (error) {
		console.error("Error fetching closest vector:", error);
		return null;
	}

	// Now using info from the closest vector, we can pass it into ChatGPT to get response
	let vectorData = data[0].content;
	const prompt = `The prompt is: ${query}. Here is the relevant information, please answer: ${vectorData}`;
	// Pass prompt to OpenAI and print out
	const gptResp = await chat.invoke(prompt);
	const response = gptResp.content;
	console.log("ChatGPT: " + response);
}
