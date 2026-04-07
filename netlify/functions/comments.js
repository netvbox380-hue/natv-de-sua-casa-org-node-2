// Netlify Function para gerenciar comentários anônimos
// Usa Netlify Blobs para persistência de dados

import { getStore } from "@netlify/blobs";

// Nomes anônimos aleatórios
const anonymousNames = [
  "Usuário Misterioso", "Visitante Anônimo", "Espectador Oculto",
  "Cliente Secreto", "Telespectador", "Assinante Feliz",
  "Fã de Séries", "Maratonista", "Cinéfilo", "TV Lover",
  "Streamer Anônimo", "Observador", "Crítico Misterioso"
];

// Avatares emoji
const avatars = ["🎬", "📺", "🎥", "🍿", "⭐", "🎭", "📽️", "🎪", "🌟", "💫", "🎯", "🔥", "💎", "🏆"];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export default async (request, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const store = getStore("natv-comments");
    const COMMENTS_KEY = "all-comments";

    if (request.method === "GET") {
      const comments = await store.get(COMMENTS_KEY, { type: "json" }) || [];
      return new Response(JSON.stringify(comments), { headers });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const { action, text, commentId, visitorId } = body;

      let comments = await store.get(COMMENTS_KEY, { type: "json" }) || [];

      if (action === "add") {
        // Validar texto
        if (!text || text.trim().length === 0) {
          return new Response(
            JSON.stringify({ error: "Comentário não pode estar vazio" }),
            { status: 400, headers }
          );
        }

        if (text.length > 500) {
          return new Response(
            JSON.stringify({ error: "Comentário muito longo (máximo 500 caracteres)" }),
            { status: 400, headers }
          );
        }

        // Criar novo comentário
        const newComment = {
          id: generateId(),
          text: text.trim(),
          name: getRandomItem(anonymousNames),
          avatar: getRandomItem(avatars),
          date: new Date().toISOString(),
          likes: 0,
          likedBy: []
        };

        comments.unshift(newComment); // Adicionar no início
        
        // Limitar a 100 comentários mais recentes
        if (comments.length > 100) {
          comments = comments.slice(0, 100);
        }

        await store.setJSON(COMMENTS_KEY, comments);

        return new Response(
          JSON.stringify({ success: true, comment: newComment, comments }),
          { headers }
        );
      }

      if (action === "like") {
        if (!commentId || !visitorId) {
          return new Response(
            JSON.stringify({ error: "Dados incompletos" }),
            { status: 400, headers }
          );
        }

        const commentIndex = comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) {
          return new Response(
            JSON.stringify({ error: "Comentário não encontrado" }),
            { status: 404, headers }
          );
        }

        const comment = comments[commentIndex];
        
        // Inicializar likedBy se não existir
        if (!comment.likedBy) {
          comment.likedBy = [];
        }

        // Toggle like
        const likeIndex = comment.likedBy.indexOf(visitorId);
        if (likeIndex === -1) {
          comment.likedBy.push(visitorId);
          comment.likes += 1;
        } else {
          comment.likedBy.splice(likeIndex, 1);
          comment.likes = Math.max(0, comment.likes - 1);
        }

        comments[commentIndex] = comment;
        await store.setJSON(COMMENTS_KEY, comments);

        return new Response(
          JSON.stringify({ success: true, comment, comments }),
          { headers }
        );
      }

      return new Response(
        JSON.stringify({ error: "Ação inválida" }),
        { status: 400, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers }
    );

  } catch (error) {
    console.error("Erro na função comments:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/comments"
};
