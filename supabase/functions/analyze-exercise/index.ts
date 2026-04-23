import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { exerciseName, description, muscles } = await req.json();

    const systemPrompt = "Eres un entrenador de culturismo y fitness de Élite Mundial. Tu objetivo es explicar la ejecución técnica perfecta de un ejercicio. Divide tu respuesta en: 1) Postura Inicial (SETUP). 2) Fase Excéntrica (Estiramiento). 3) Fase Concéntrica (Contracción). 4) Consejos Pro (Hipertrofia/Seguridad). Usa un lenguaje motivador, profesional y técnico, pero fácil de entender. Usa Markdown para el formato.";
    const userPrompt = `Explica el ejercicio: ${exerciseName}. \nDescripción base: ${description}. \nMúsculos: ${muscles}.`;

    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "openai"
      })
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const analysis = await response.text();

    return new Response(JSON.stringify({ analysis: analysis.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-exercise error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
