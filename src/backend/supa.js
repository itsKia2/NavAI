import { PdfReader } from "pdfreader";
import path from "path";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// EXPORTS
export { selectData, savePdfEmbed };

// Set maximum chunk size in tokens (characters for LangChain)
const MAX_TOKENS = 1024;

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
				resolve(textContent.join(" "));
			} else if (item.text) {
				textContent.push(item.text);
			}
		});
	});
}

// Semantic chunking with LangChain's RecursiveCharacterTextSplitter
async function semanticChunkText(text) {
	const splitter = new RecursiveCharacterTextSplitter({
		separator: ".",         // Use paragraph breaks as natural boundaries
		chunkSize: 512,      // Max size per chunk in tokens
		chunkOverlap: 32,          // Overlap to provide context between chunks
	});
	return await splitter.splitText(text); // Await here to handle asynchronous behavior
}
async function savePdfEmbed(supabase, chat, embedding, filepath) {
	let doc = "";
	const storeDoc = (input) => {
		doc = input;
	};

	await getPdfData(filepath).then((x) => storeDoc(x));
	const lotsEmbeds = [];
	const lotsText = [];

	const myInput = doc.replace(/\n/g, " ");
	const chunks = await semanticChunkText(myInput); // Await here as well

	for (let chunk of chunks) {
		const currEmbed = await embedding.embedDocuments([chunk]);
		lotsEmbeds.push(currEmbed[0]);
		lotsText.push(chunk);
	}

	for (let i = 0; i < lotsEmbeds.length; i++) {
		await insertData(supabase, path.basename(filepath), lotsText[i], lotsEmbeds[i]);
		console.log("Chunk added to DB");
	}
}
