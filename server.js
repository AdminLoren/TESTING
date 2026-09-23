const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const charactersPath = path.join(__dirname, "public", "data", "characters.json");
const relationshipsPath = path.join(__dirname, "public", "data", "relationships.json");

function loadJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

app.get("/api/characters", (req, res) => {
  try {
    const characters = loadJSON(charactersPath);
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: "Could not load character data." });
  }
});

app.get("/api/characters/:id", (req, res) => {
  try {
    const characters = loadJSON(charactersPath);
    const found = characters.find(
      (c) => c.id.toLowerCase() === req.params.id.toLowerCase()
    );
    if (!found) return res.status(404).json({ error: "Character not found." });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Could not load character data." });
  }
});

app.get("/api/relationships", (req, res) => {
  try {
    const relationships = loadJSON(relationshipsPath);
    res.json(relationships);
  } catch (err) {
    res.status(500).json({ error: "Could not load relationship data." });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Unknown API route." });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`C.O.T.A. Encyclopedia server running on http://localhost:${PORT}`);
});
