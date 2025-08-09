export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Only POST requests allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { prompt } = await request.json();

      if (!prompt || typeof prompt !== "string") {
        return new Response(JSON.stringify({ error: "Prompt must be a non-empty string" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // 🔹 Prompt Layer: Personality & Context
      const messages = [
        {
          role: "system",
          content:
            "You are Better Within AI — a wise, emotionally intelligent mentor who blends modern science with authentic Islamic wisdom, speaks with compassion, and offers practical, uplifting guidance."
        },
        { role: "user", content: prompt }
      ];

      // 🔹 Call Workers AI (use your binding name)
      const aiResponse = await env.proto-ai.run(
        "@cf/meta/llama-3.1-8b-instruct",
        { messages }
      );

      return new Response(JSON.stringify(aiResponse), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
