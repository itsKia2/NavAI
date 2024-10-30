import OpenAI from "openai";

export { runQuery };

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
