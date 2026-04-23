import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    const raw = await req.text();
    const { image_base64, mime_type = "image/jpeg" } = JSON.parse(raw);
    if (!image_base64) throw new Error("No image base64");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Analiza esta imagen de comida y devuelve JSON: description, calories, protein, carbs, fat, suggestion.`;

    const gRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }, { inlineData: { mimeType: mime_type, data: image_base64.replace(/^data:image\/\w+;base64,/, "") } }]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const gText = await gRes.text();
    if (!gRes.ok) throw new Error(`Google API: ${gText.substring(0, 150)}`);

    const gData = JSON.parse(gText);
    const resultText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("No analysis result");

    return new Response(resultText, {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`[COMPAT_SCAN_ERR]`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
