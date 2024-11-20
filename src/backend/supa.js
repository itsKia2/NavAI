import { PdfReader } from "pdfreader";
import path from "path";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { extractTextFromPdf } from "./pdfreader.js";

// EXPORTS
export { selectData, insertData, getChunkEmbeds };

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
		separator:
			/(?<=\n\n)|(?<=\.\s)|(?<=:\s)|(?<=\?)|(?<=!)|(?<=\n-\s)|(?<=\n\d+\.\s)|(?<=\n\* )|(?<=\n[a-zA-Z]\)\s)|(?<=\nCHAPTER\s)|(?<=\nSECTION\s)|(?<=\n[A-Z ]+:)/,
		chunkSize: 1000, // Max size per chunk in tokens
		chunkOverlap: 100, // Overlap to provide context between chunks
	});
	const retVal = await splitter.splitText(text); // Await here to handle asynchronous behavior
	// console.log(retVal);
	return retVal;
}

async function getChunkEmbeds(embedding, link) {
	// await getPdfData(filepath).then((x) => storeDoc(x));
	const rawText = await extractTextFromPdf(link).catch((error) =>
		console.error("Error:", error),
	);

	const lotsEmbeds = [];
	const lotsText = [];
	const lotsLinks = [];

	// const myInput = doc.replace(/\n/g, " ");
	const chunks = await semanticChunkText(rawText); // Await here as well

	for (let chunk of chunks) {
		const currEmbed = await embedding.embedDocuments([chunk]);
		lotsEmbeds.push(currEmbed[0]);
		lotsText.push(chunk);
		lotsLinks.push(link);
	}
	return { lotsText, lotsEmbeds, lotsLinks };
}
