import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const votesFile = path.join(dataDir, "votes.json");
const commentsFile = path.join(dataDir, "comments.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(votesFile)) fs.writeFileSync(votesFile, JSON.stringify({ likes: 47, dislikes: 3 }, null, 2));
if (!fs.existsSync(commentsFile)) fs.writeFileSync(commentsFile, JSON.stringify([], null, 2));

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
const anonymousNames = [
  "Usuário Misterioso", "Visitante Anônimo", "Espectador Oculto", "Cliente Secreto",
  "Telespectador", "Assinante Feliz", "Fã de Séries", "Maratonista", "Cinéfilo"
];
const avatars = ["🎬", "📺", "🎥", "🍿", "⭐", "🎭", "📽️", "🌟", "🔥", "💎", "🏆"];
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, runtime: "render-web-service" });
});

app.get("/api/votes", (req, res) => {
  res.json(readJson(votesFile, { likes: 47, dislikes: 3 }));
});

app.post("/api/votes", (req, res) => {
  const { action, visitorId } = req.body || {};
  if (!action || !["like", "dislike", "remove"].includes(action)) {
    return res.status(400).json({ error: "Ação inválida" });
  }
  const votes = readJson(votesFile, { likes: 47, dislikes: 3 });
  const votersFile = path.join(dataDir, "voters.json");
  const voters = readJson(votersFile, {});
  const previousVote = visitorId ? voters[visitorId] : null;
  if (previousVote === "like") votes.likes = Math.max(0, votes.likes - 1);
  if (previousVote === "dislike") votes.dislikes = Math.max(0, votes.dislikes - 1);
  if (action === "like") {
    votes.likes += 1;
    if (visitorId) voters[visitorId] = "like";
  } else if (action === "dislike") {
    votes.dislikes += 1;
    if (visitorId) voters[visitorId] = "dislike";
  } else if (visitorId) {
    delete voters[visitorId];
  }
  writeJson(votesFile, votes);
  writeJson(votersFile, voters);
  res.json({ success: true, votes, userVote: visitorId ? (voters[visitorId] || null) : null });
});

app.get("/api/comments", (req, res) => {
  res.json(readJson(commentsFile, []));
});

app.post("/api/comments", (req, res) => {
  const { action, text, commentId, visitorId } = req.body || {};
  let comments = readJson(commentsFile, []);
  if (action === "add") {
    const clean = String(text || "").trim();
    if (clean.length < 3) return res.status(400).json({ error: "Comentário muito curto" });
    if (clean.length > 500) return res.status(400).json({ error: "Comentário muito longo (máximo 500 caracteres)" });
    const newComment = {
      id: generateId(),
      text: clean,
      name: randomItem(anonymousNames),
      avatar: randomItem(avatars),
      date: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };
    comments.unshift(newComment);
    comments = comments.slice(0, 100);
    writeJson(commentsFile, comments);
    return res.json({ success: true, comment: newComment, comments });
  }
  if (action === "like") {
    if (!commentId || !visitorId) return res.status(400).json({ error: "Dados incompletos" });
    const idx = comments.findIndex((c) => c.id === commentId);
    if (idx === -1) return res.status(404).json({ error: "Comentário não encontrado" });
    const comment = comments[idx];
    comment.likedBy = Array.isArray(comment.likedBy) ? comment.likedBy : [];
    const likeIdx = comment.likedBy.indexOf(visitorId);
    if (likeIdx === -1) {
      comment.likedBy.push(visitorId);
      comment.likes = (comment.likes || 0) + 1;
    } else {
      comment.likedBy.splice(likeIdx, 1);
      comment.likes = Math.max(0, (comment.likes || 0) - 1);
    }
    comments[idx] = comment;
    writeJson(commentsFile, comments);
    return res.json({ success: true, comment, comments });
  }
  return res.status(400).json({ error: "Ação inválida" });
});

app.use(express.static(publicDir, { extensions: ["html"] }));
app.get(/.*/, (req, res) => {
  const requested = req.path === "/" ? "/index.html" : req.path;
  const filePath = path.join(publicDir, requested);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  return res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`NaTV rodando em http://localhost:${PORT}`);
});
