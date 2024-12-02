const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const router = express.Router();

// Initialize Supabase client
const supabaseUrl = "https://bfbfuhypbbknbetwsbcw.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmYmZ1aHlwYmJrbmJldHdzYmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0OTE3NDEsImV4cCI6MjA0NTA2Nzc0MX0.rzkpASygqPlfKRzopo1ZQ5BMsLQxVgPeMr6xgASxtLE"; // or service key if needed
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint to fetch limited data
router.get("/data", async (req, res) => {
	try {
		// Fetch data with limit and range
		const { data, error } = await supabase
			.from("your_table")
			.select("*")
			.limit(100) // Limit to 100 rows
			.range(0, 100); // Fetch rows from 0 to 100

		if (error) {
			throw error;
		}

		// Return the fetched data
		res.json(data);
	} catch (err) {
		console.error("Error fetching data:", err);
		res.status(500).json({ error: "Error fetching data" });
	}
});

module.exports = router;
