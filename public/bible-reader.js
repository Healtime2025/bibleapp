// Bible Reader Logic - bible-reader.js

// Toggle Night Mode
export function toggleNightMode() {
  document.body.classList.toggle('night-mode');
}

// Load Bible Verses
export async function loadBible() {
  try {
    const book = document.getElementById('bookSelect').value;
    const chapter = document.getElementById('chapterInput').value;
    const start = document.getElementById('start-verse').value || 1;
    const end = document.getElementById('end-verse').value || 'full';

    const url = `https://raw.githubusercontent.com/Healtime2025/GraceVoice-online/main/bibles/English/KJV/${book}.json`;
    console.log("Loading URL:", url);

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load Bible file.");

    const data = await response.json();
    console.log("Loaded Data:", data);

    let chapterData = data[book];

    // Auto-detect and fix any nested empty string keys
    if (chapterData && chapterData[""]) {
      chapterData = chapterData[""];
      console.log("Detected and accessed nested chapter data.");
    }

    if (!chapterData) {
      document.getElementById('verseDisplay').innerText = "❌ No verses found for your selection.";
      return;
    }

    let text = "";

    for (const key in chapterData) {
      const [keyChapter, keyVerse] = key.split(':');
      console.log("Checking Key:", key, "Chapter:", keyChapter, "Verse:", keyVerse);

      // Check if the key chapter matches the selected chapter
      if (keyChapter === chapter || keyChapter.replace(/^0+/, '') === chapter) {
        if (end === 'full' || (keyVerse >= start && keyVerse <= end)) {
          text += `<div class='verse-line' id='verse-${key}'>${keyVerse}: ${chapterData[key]}</div>\n`;
        }
      }
    }

    if (text.trim() === "") text = "❌ No verses available for your selection.";

    document.getElementById('verseDisplay').innerHTML = text.trim();

  } catch (error) {
    console.error("Error loading Bible: ", error);
    document.getElementById('verseDisplay').innerText = "❌ Error loading Bible text. Check console for details.";
  }
}

// Start Reading with Resume
let currentIndex = 0;
export function startReading() {
  const verses = document.querySelectorAll('.verse-line');

  function readAndProgress() {
    if (currentIndex >= verses.length) return;

    const speech = new SpeechSynthesisUtterance(verses[currentIndex].innerText.replace(/^[0-9]+:\s*/, ''));
    speech.onend = () => {
      currentIndex++;
      readAndProgress();
    };

    speechSynthesis.speak(speech);
  }

  speechSynthesis.cancel();
  readAndProgress();
}

// Stop Reading
export function stopReading() {
  speechSynthesis.cancel();
  document.querySelectorAll('.verse-line').forEach(v => v.style.backgroundColor = 'transparent');
}
