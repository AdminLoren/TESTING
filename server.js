// server.js
// Optional Node.js/Express backend for the C.O.T.A. Encyclopedia.
// The site is fully static (the frontend fetches JSON directly from
// /public/data/), so this file is just a convenience "npm start" for
// people who'd rather not set up Apache/nginx. It serves the static
// frontend in /public, plus keeps a couple of /api/ routes around for
// anyone who prefers hitting an API instead of the static JSON files.

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Load the JSON "database" from disk once at startup ----
const charactersPath = path.join(__dirname, "public", "data", "characters.json");
const relationshipsPath = path.join(__dirname, "public", "data", "relationships.json");

function loadJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// ---- API routes ----
// GET /api/characters -> full character roster
app.get("/api/characters", (req, res) => {
  try {
    const characters = loadJSON(charactersPath);
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: "Could not load character data." });
  }
});

// GET /api/characters/:id -> a single character by code (e.g. A1, B4)
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

// GET /api/relationships -> all registered relationship pairs
app.get("/api/relationships", (req, res) => {
  try {
    const relationships = loadJSON(relationshipsPath);
    res.json(relationships);
  } catch (err) {
    res.status(500).json({ error: "Could not load relationship data." });
  }
});

// ---- Static frontend ----
app.use(express.static(path.join(__dirname, "public")));

// Any unknown non-API route falls back to the single-page app shell.
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Unknown API route." });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`C.O.T.A. Encyclopedia server running on http://localhost:${PORT}`);
});
