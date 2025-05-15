// /api/fetch-script.js

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { book, chapter } = req.query;

  // Validate inputs
  if (!book || !chapter) {
    return res.status(400).json({ error: "Missing book or chapter." });
  }

  try {
    // Path to the Bible text file
    const filePath = path.join(process.cwd(), 'bibles/English/Bible.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Split the text file into lines
    const lines = fileContent.split('\n');
    const bibleData = {};
    
    // Parse the text file line by line
    lines.forEach(line => {
      const match = line.match(/^(\w+)\s(\d+):(\d+)\s+(.+)$/);
      if (match) {
        const [_, bookName, chapterNum, verseNum, verseText] = match;

        // Initialize the book and chapter structure in JSON
        if (!bibleData[bookName]) bibleData[bookName] = {};
        if (!bibleData[bookName][chapterNum]) bibleData[bookName][chapterNum] = {};

        // Store the verse text in JSON
        bibleData[bookName][chapterNum][verseNum] = verseText.trim();
      }
    });

    // Check if the requested book and chapter exist
    const selectedBook = bibleData[book];
    if (!selectedBook) {
      return res.status(404).json({ error: "Book not found." });
    }

    const selectedChapter = selectedBook[chapter];
    if (!selectedChapter) {
      return res.status(404).json({ error: "Chapter not found." });
    }

    // Return the verses of the selected book and chapter
    return res.status(200).json({ verses: selectedChapter });
  } catch (error) {
    console.error("Error loading Bible text:", error);
    return res.status(500).json({ error: "Error loading Bible text." });
  }
}
