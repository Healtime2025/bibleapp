// /api/fetch-script.js

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const { book, chapter, start = 1, end = 999 } = req.query;

  if (!book || !chapter) {
    return res.status(400).json({ error: "Missing book or chapter." });
  }

  try {
    // Load the HTML file dynamically based on the book requested
    const filePath = path.join(process.cwd(), 'public/bibles', `Akjv01${book}.htm`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Book file not found." });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(fileContent);
    const document = dom.window.document;

    // Extract all verse <li> elements
    const verseElements = document.querySelectorAll('li');
    const verses = {};

    // Filter and store the verses for the requested chapter
    verseElements.forEach((verseElement) => {
      const verseText = verseElement.textContent.trim();
      const verseMatch = verseText.match(/^(\d+):(\d+)\s+(.*)$/);
      
      if (verseMatch) {
        const [_, chapterNum, verseNum, text] = verseMatch;

        if (chapterNum === chapter) {
          if (verseNum >= start && verseNum <= end) {
            verses[verseNum] = text;
          }
        }
      }
    });

    if (Object.keys(verses).length === 0) {
      return res.status(404).json({ error: "No verses found for the specified chapter." });
    }

    // Return the extracted verses in JSON format
    return res.status(200).json({ verses });
  } catch (error) {
    console.error("Error reading Bible file:", error);
    return res.status(500).json({ error: "Error reading Bible file." });
  }
}
