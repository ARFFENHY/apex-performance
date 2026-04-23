import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const { recipe_name, force = false } = body;
    if (!recipe_name) throw new Error("recipe_name required");

    // Reutilizar si ya existe y no están forzando regenerar
    if (!force) {
      const { data: existing } = await supabaseAdmin
        .from("recipe_images")
        .select("image_url")
        .eq("recipe_name", recipe_name)
        .maybeSingle();

      if (existing?.image_url) {
        return new Response(JSON.stringify({ success: true, image_url: existing.image_url, reused: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    const prompt = `Gourmet food photography of a delicious ${recipe_name}. Professional food styling, 8k resolution, cinematic lighting, highly detailed, photorealistic, luxury restaurant presentation, shot on 50mm macro lens.`;
    
    // Generar con Pollinations.ai (Gratis, sin API Key)
    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 99999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${randomSeed}`;

    const imgRes = await fetch(pollinationsUrl);
    if (!imgRes.ok) throw new Error(`Pollinations API failed: ${imgRes.statusText}`);

    const buffer = await imgRes.arrayBuffer();
    const fileName = `recipes/${recipe_name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.png`;

    await supabaseAdmin.storage.from("photos").upload(fileName, buffer, { contentType: "image/png", upsert: true });
    const { data: urlData } = supabaseAdmin.storage.from("photos").getPublicUrl(fileName);

    await supabaseAdmin.from("recipe_images").upsert({ recipe_name, image_url: urlData.publicUrl });

    return new Response(JSON.stringify({ success: true, image_url: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
