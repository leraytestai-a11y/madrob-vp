import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { job_id, sku } = await req.json();

    if (!job_id || !sku) {
      return new Response(
        JSON.stringify({ error: "Missing job_id or sku" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL_PRINT_LABEL") ||
      "https://n8n.srv833470.hstgr.cloud/webhook/1ee6a6be-6323-41c6-96d9-8dd6ec3e4297";

    if (!n8nUrl) {
      await supabase
        .from("print_label_jobs")
        .update({ status: "error", error_message: "N8N_WEBHOOK_URL_PRINT_LABEL not configured", updated_at: new Date().toISOString() })
        .eq("id", job_id);

      return new Response(
        JSON.stringify({ error: "N8N_WEBHOOK_URL_PRINT_LABEL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("print_label_jobs")
      .update({ status: "printing", updated_at: new Date().toISOString() })
      .eq("id", job_id);

    const n8nRes = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id, sku }),
    });

    if (!n8nRes.ok) {
      const errText = await n8nRes.text();
      await supabase
        .from("print_label_jobs")
        .update({ status: "error", error_message: errText, updated_at: new Date().toISOString() })
        .eq("id", job_id);

      return new Response(
        JSON.stringify({ error: `n8n responded with status ${n8nRes.status}: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await n8nRes.json();
    const serialNumber = result?.serial_number || null;

    await supabase
      .from("print_label_jobs")
      .update({
        status: "done",
        serial_number: serialNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job_id);

    return new Response(
      JSON.stringify({ success: true, serial_number: serialNumber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
