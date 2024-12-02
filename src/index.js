// Import necessary modules
import express from "express";
import dotenv from "dotenv";
import { loadingEnv, insertAllPdfs } from "./helper.js";
import { runQuery } from "./backend/langchain.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Initialize Supabase client and other services
const { supa, chat, embeddings } = loadingEnv();
console.log("Env variables loaded");

// Function to fetch data from Supabase with limit and range
const getLimitedData = async () => {
	try {
		// Fetch data from your Supabase table (adjust table name as needed)
		const { data, error } = await supa
			.from("your_table")
			.select("*")
			.limit(100) // Limit to 100 rows
			.range(0, 100); // Fetch rows 0 to 100

		if (error) {
			throw error;
		}

		return data;
	} catch (err) {
		console.error("Error fetching data:", err);
		return null;
	}
};

// API route to get data from Supabase
app.get("/api/data", async (req, res) => {
	try {
		const data = await getLimitedData();
		if (data) {
			res.json(data); // Send data as JSON response
		} else {
			res.status(404).json({ message: "No data found" });
		}
	} catch (err) {
		res.status(500).json({ error: "Error fetching data" });
	}
});

// Your existing query and function execution
const query =
	"What is the decision-making process for declaring an M/LCC 2 Abnormal Conditions Alert? Include details about operating reserve requirements, applicable pre-OP-4 actions, transmission voltage or reactive reserve conditions, and other system threats such as cold weather events or reliability standards.";
runQuery(query, chat, embeddings, supa);

// Uncomment if you need to insert PDFs as part of your logic
// insertAllPdfs(supa, embeddings, "./pdflinks.txt");

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
