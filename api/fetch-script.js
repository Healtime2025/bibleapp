// /api/fetch-script.js
import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  const { book, chapter } = req.query;

  // Validate inputs
  if (!book || !chapter) {
    return res.status(400).json({ error: "Missing book or chapter." });
  }

  try {
    // Load the text file dynamically
    const filePath = path.join(process.cwd(), "assets", "Bible.txt");
    const fileContents = await fs.readFile(filePath, "utf8");

    // Split text by lines
    const lines = fileContents.split("\n");

    // Initialize JSON structure
    const bibleJSON = {};
    let currentBook = "";
    let currentChapter = "";
    let currentVerse = "";

    // Parse the text line by line
    lines.forEach(line => {
      const match = line.match(/^(\w+)\s(\d+):(\d+)\s+(.*)$/);
      if (match) {
        const [_, bookName, chapterNum, verseNum, verseText] = match;

        if (!bibleJSON[bookName]) bibleJSON[bookName] = {};
        if (!bibleJSON[bookName][chapterNum]) bibleJSON[bookName][chapterNum] = {};

        bibleJSON[bookName][chapterNum][verseNum] = verseText.trim();
      }
    });

    // Verify if the book and chapter exist
    if (!bibleJSON[book] || !bibleJSON[book][chapter]) {
      return res.status(404).json({ error: "Chapter not found." });
    }

    // Return the JSON object
    return res.status(200).json({ verses: bibleJSON[book][chapter] });
  } catch (error) {
    console.error("Error loading Bible text:", error);
    return res.status(500).json({ error: "Error loading Bible text." });
  }
}
