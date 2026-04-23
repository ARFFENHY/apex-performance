import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goals, interests, display_name } = await req.json();

    const goalsText = goals?.length ? `Sus objetivos son: ${goals.join(", ")}.` : "";
    const interestsText = interests?.length ? `Sus intereses son: ${interests.join(", ")}.` : "";

    const systemPrompt = "Eres un coach motivacional de fitness de élite. Genera UN mensaje motivacional corto (máximo 2 frases) en español. Debe ser inspirador, energético y personalizado. Incluye un emoji relevante al final. No uses comillas.";
    const userPrompt = `Genera un mensaje motivacional para el atleta ${display_name || "usuario"}. ${goalsText} ${interestsText}`;

    // Usando Pollinations Text API (gratuita) para eliminar cualquier dependencia o metadata de Lovable
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "openai" // OpenAI / Llama backed model by pollinations
      })
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const message = await response.text();
    const finalMessage = message.trim() || "¡Hoy es tu día para brillar! 💪";

    return new Response(JSON.stringify({ message: finalMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("motivational-message error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
