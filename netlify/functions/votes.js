// Netlify Function para gerenciar votos (likes/dislikes)
// Usa Netlify Blobs para persistência de dados

import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  // Configurar CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const store = getStore("natv-votes");
    const VOTES_KEY = "site-votes";

    if (request.method === "GET") {
      // Buscar votos atuais
      const votes = await store.get(VOTES_KEY, { type: "json" });
      
      if (!votes) {
        // Inicializar com valores padrão
        const defaultVotes = { likes: 47, dislikes: 3 };
        await store.setJSON(VOTES_KEY, defaultVotes);
        return new Response(JSON.stringify(defaultVotes), { headers });
      }
      
      return new Response(JSON.stringify(votes), { headers });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const { action, visitorId } = body;

      if (!action || !["like", "dislike", "remove"].includes(action)) {
        return new Response(
          JSON.stringify({ error: "Ação inválida" }),
          { status: 400, headers }
        );
      }

      // Buscar votos atuais
      let votes = await store.get(VOTES_KEY, { type: "json" });
      if (!votes) {
        votes = { likes: 47, dislikes: 3 };
      }

      // Buscar registro de votos por visitante
      const votersKey = "voters-record";
      let voters = await store.get(votersKey, { type: "json" }) || {};

      const previousVote = voters[visitorId];

      // Remover voto anterior se existir
      if (previousVote === "like") {
        votes.likes = Math.max(0, votes.likes - 1);
      } else if (previousVote === "dislike") {
        votes.dislikes = Math.max(0, votes.dislikes - 1);
      }

      // Aplicar novo voto
      if (action === "like") {
        votes.likes += 1;
        voters[visitorId] = "like";
      } else if (action === "dislike") {
        votes.dislikes += 1;
        voters[visitorId] = "dislike";
      } else if (action === "remove") {
        delete voters[visitorId];
      }

      // Salvar dados
      await store.setJSON(VOTES_KEY, votes);
      await store.setJSON(votersKey, voters);

      return new Response(
        JSON.stringify({ 
          success: true, 
          votes,
          userVote: voters[visitorId] || null
        }),
        { headers }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers }
    );

  } catch (error) {
    console.error("Erro na função votes:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/votes"
};
