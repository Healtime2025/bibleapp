// /api/fetch-script.js

export default async function handler(req, res) {
  const { book, chapter } = req.query;

  // Validate inputs
  if (!book || !chapter) {
    return res.status(400).json({ error: "Missing book or chapter." });
  }

  try {
    // Load the Bible JSON from your storage (adjust this path)
    const response = await fetch(`https://your-json-storage-url/bibles/English/${encodeURIComponent(book)}.json`);
    const data = await response.json();

    // Check if the chapter exists
    const verses = data[chapter] || null;
    if (!verses) {
      return res.status(404).json({ error: "Chapter not found." });
    }

    // Return the verses
    return res.status(200).json({ verses });
  } catch (error) {
    console.error("Error loading Bible text:", error);
    return res.status(500).json({ error: "Error loading Bible text." });
  }
}
