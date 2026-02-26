import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const N8N_WEBHOOK_URL = "https://n8n.srv833470.hstgr.cloud/webhook/c14070e7-f0b7-415b-84fa-f74bf4e78ff7";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { serial_number, side } = await req.json();

    if (!serial_number) {
      return new Response(
        JSON.stringify({ success: false, error: "serial_number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let comment = "";

    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial_number, side }),
      });

      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.json();
        const rawData = Array.isArray(n8nData) ? n8nData[0] : n8nData;
        const rawComment = rawData?.comment ?? rawData?.Comment ?? "";
        const fetchedComment = rawComment !== null && rawComment !== undefined ? String(rawComment).trim() : "";

        if (fetchedComment) {
          comment = fetchedComment;

          await supabase
            .from("ski_global_comments")
            .upsert(
              { serial_number, comment, updated_at: new Date().toISOString() },
              { onConflict: "serial_number" }
            );
        }
      }
    } catch (n8nError) {
      console.error("n8n fetch failed, falling back to Supabase:", n8nError);
    }

    if (!comment) {
      const { data } = await supabase
        .from("ski_global_comments")
        .select("comment")
        .eq("serial_number", serial_number)
        .maybeSingle();

      comment = data?.comment ?? "";
    }

    return new Response(
      JSON.stringify({ success: true, serial_number, comment }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-ski-comment:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
