import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const { exerciseName, position = "start", gender = "male", force = false } = body;
    if (!exerciseName) throw new Error("exerciseName required");

    // Reutilizar si ya existe y no están forzando regenerar
    if (!force) {
      const { data: existing } = await supabaseAdmin
        .from("exercise_images")
        .select("image_url, source")
        .eq("exercise_name", exerciseName)
        .eq("position", position)
        .eq("gender", gender)
        .maybeSingle();

      if (existing?.image_url) {
        return new Response(JSON.stringify({ success: true, image_url: existing.image_url, reused: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    const prompt = `Professional photography of ${gender} athlete doing ${exerciseName}, ${position} position in a modern luxury gym. Hyper-realistic, dramatic lighting, 8k resolution, cinematic, action shot`;
    
    // Generar con Pollinations.ai (Gratis, sin API Key)
    // Añadimos un "seed" aleatorio para evitar que el servidor devuelva la misma imagen cacheada
    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 99999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&model=flux&seed=${randomSeed}`;

    const imgRes = await fetch(pollinationsUrl);
    if (!imgRes.ok) throw new Error(`Pollinations API failed: ${imgRes.statusText}`);

    const buffer = await imgRes.arrayBuffer();
    const fileName = `exercises/${exerciseName.toLowerCase().replace(/\s+/g, "_")}_${position}_${gender}_${Date.now()}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("photos")
      .upload(fileName, buffer, { contentType: "image/png", upsert: true });

    if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

    const { data: urlData } = supabaseAdmin.storage.from("photos").getPublicUrl(fileName);

    await supabaseAdmin.from("exercise_images").upsert({
      exercise_name: exerciseName,
      image_url: urlData.publicUrl,
      position,
      gender,
      source: "pollinations_ai_free"
    });

    return new Response(JSON.stringify({ success: true, image_url: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
