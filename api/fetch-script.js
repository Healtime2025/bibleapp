<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>GraceVoice - Bible Reader</title>
  <link rel="manifest" href="manifest.json">
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f4f4f4;
      text-align: center;
      padding: 40px;
      transition: background 0.3s, color 0.3s;
    }
    h1 { font-size: 32px; color: #2c3e50; }
    .scripture-box {
      margin: 30px auto;
      padding: 20px;
      max-width: 800px;
      background: white;
      border-radius: 10px;
      font-size: 24px;
      line-height: 1.6;
      color: #333;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      text-align: left;
      min-height: 150px;
    }
    button {
      padding: 12px 20px;
      font-size: 18px;
      margin: 10px;
      border: none;
      background: #1976d2;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #145a9e; }
    .night-mode { background-color: #1c1c1c; color: #e0e0e0; }
    .night-mode .scripture-box { background-color: #2b2b2b; color: #e0e0e0; }
    .highlight { background-color: yellow; font-weight: bold; }
  </style>
</head>
<body>
  <h1>📖 GraceVoice Bible Reader</h1>

  <div>
    <label><input type="checkbox" id="themeToggle" onchange="toggleTheme()"> Night Mode</label>
  </div>

  <div>
    <label>Book: <input type="text" id="bookInput" value="Genesis"></label>
    <label>Chapter: <input type="number" id="chapterInput" value="1" min="1"></label>
    <label>Start Verse: <input type="number" id="startVerse" value="1" min="1"></label>
    <label>End Verse: <input type="number" id="endVerse" value="5" min="1"></label>
  </div>

  <div>
    <button onclick="loadBible()">📘 Load Bible</button>
    <button onclick="readSelected()">▶️ Read Selection</button>
    <button onclick="stopSpeech()">⏹️ Stop/Pause</button>
  </div>

  <div class="scripture-box" id="verseDisplay">
    📖 Your selected Bible text will appear here.
  </div>

  <script>
    // Night Mode Toggle
    function toggleTheme() {
      document.body.classList.toggle("night-mode");
      localStorage.setItem("graceNightMode", document.body.classList.contains("night-mode"));
    }

    // Load Bible Text Function
    async function loadBible() {
      const book = document.getElementById("bookInput").value;
      const chapter = document.getElementById("chapterInput").value;
      const start = document.getElementById("startVerse").value || 1;
      const end = document.getElementById("endVerse").value || 999;

      if (!book || !chapter) {
        document.getElementById("verseDisplay").innerText = "❌ Please enter a book and chapter.";
        return;
      }

      try {
        const response = await fetch(`/bibles/English/${book}.json`);
        if (!response.ok) throw new Error("Bible text not found.");

        const data = await response.json();
        const verses = data[chapter];
        if (!verses) {
          document.getElementById("verseDisplay").innerText = "❌ Chapter not found.";
          return;
        }

        const displayText = Object.entries(verses)
          .filter(([v]) => v >= start && v <= end)
          .map(([v, text]) => `<p><strong>${v}.</strong> ${text}</p>`)
          .join("");

        document.getElementById("verseDisplay").innerHTML = displayText || "❌ No verses in this range.";
      } catch (error) {
        document.getElementById("verseDisplay").innerText = "❌ Error loading Bible text.";
        console.error("Error loading Bible text:", error);
      }
    }

    // Read Selected Verses
    function readSelected() {
      const verses = document.querySelectorAll(".scripture-box p");
      if (!verses.length) return;

      let currentIndex = 0;
      verses.forEach(v => v.classList.remove("highlight"));

      function readNext() {
        if (currentIndex >= verses.length) return;
        verses.forEach(v => v.classList.remove("highlight"));
        verses[currentIndex].classList.add("highlight");

        const utterance = new SpeechSynthesisUtterance(verses[currentIndex].innerText);
        utterance.onend = () => { currentIndex++; readNext(); };
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      }

      readNext();
    }

    // Stop Reading
    function stopSpeech() {
      speechSynthesis.cancel();
    }

    // Load Night Mode Preference
    window.onload = function() {
      if (localStorage.getItem("graceNightMode") === "true") {
        document.body.classList.add("night-mode");
      }
    };
  </script>
</body>
</html>
