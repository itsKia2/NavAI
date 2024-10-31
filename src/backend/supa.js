import { PdfReader } from "pdfreader";
import path from "path";

// EXPORTS
export { selectData, savePdfEmbed };

// This is the size of each chunk
const MAX_TOKENS = 8192;

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

// TODO replace/delete this later
// to be replaced with langchain semantic chunking
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
async function savePdfEmbed(supabase, chat, embedding, filepath) {
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
		const currEmbed = await embedding.embedDocuments([chunk]);
		// pushing EACH chunk into the array which will be put into db LATER
		// replaced insertData with lotsEmbeds.push
		lotsEmbeds.push(currEmbed[0]);
		lotsText.push(chunk);
	}

	// now we insert all these chunks one by one into the db
	for (let i = 0; i < lotsEmbeds.length; i++) {
		insertData(supabase, path.basename(filepath), lotsText[i], lotsEmbeds[i]);
		console.log("Chunk added to DB");
	}
}
