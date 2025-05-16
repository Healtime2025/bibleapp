// /api/fetch-script.js

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const { book, chapter, start, end } = req.query;

  if (!book || !chapter) {
    return res.status(400).json({ error: "Missing book or chapter." });
  }

  try {
    // Load the HTML file from the Bible directory
    const filePath = path.join(process.cwd(), 'public/bibles', `Akjv01${book}.htm`);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse HTML file using JSDOM
    const dom = new JSDOM(fileContent);
    const document = dom.window.document;

    // Extract verses (li elements)
    const verseElements = document.querySelectorAll('li');

    const verses = {};

    verseElements.forEach((verseElement) => {
      const verseText = verseElement.textContent.trim();
      const [verseNumber, text] = verseText.split(/\s(.+)/);
      if (verseNumber.startsWith(`${chapter}:`)) {
        const verse = verseNumber.split(':')[1];
        if (verse >= start && verse <= end) {
          verses[verse] = text;
        }
      }
    });

    // Return verses in JSON
    return res.status(200).json({ verses });
  } catch (error) {
    console.error("Error reading Bible file:", error);
    return res.status(500).json({ error: "Error reading Bible file." });
  }
}
