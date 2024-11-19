import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import fs from "fs/promises";

export { extractLinks, extractTextFromPdf };

// Function to read pdflinks.txt
async function extractLinks(file) {
	try {
		const fileContent = await fs.readFile(file, "utf-8");
		const lines = fileContent
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line);
		return lines;
	} catch (error) {
		console.error("Error reading file:", error);
		throw error;
	}
}

// Function to fetch and parse PDF text
async function extractTextFromPdf(url) {
	try {
		// Fetch the PDF as a binary array
		const response = await axios.get(url, { responseType: "arraybuffer" });
		const pdfData = new Uint8Array(response.data);

		// Load the PDF document
		const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

		let extractedText = "";

		// Loop through all pages and extract text
		for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
			const page = await pdfDoc.getPage(pageNumber);
			const textContent = await page.getTextContent();

			// Combine all text items into a single string
			const pageText = textContent.items.map((item) => item.str).join(" ");
			extractedText += pageText;
		}

		return extractedText;
	} catch (error) {
		console.error("Error extracting text from PDF:", error);
		throw error;
	}
}
