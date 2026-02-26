import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const N8N_WEBHOOK_URL = "https://n8n.srv833470.hstgr.cloud/webhook/f8b5dfd5-b5d5-419b-9782-f4986d3b6bec";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload = await req.json();

    console.log("Received press summary:", JSON.stringify(payload, null, 2));

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const n8nStatus = n8nResponse.status;
    let n8nBody: unknown = null;
    try {
      n8nBody = await n8nResponse.json();
    } catch {
      n8nBody = await n8nResponse.text();
    }

    console.log("n8n press webhook response:", n8nStatus, JSON.stringify(n8nBody));

    if (!n8nResponse.ok) {
      console.error("n8n press webhook returned error:", n8nStatus, n8nBody);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Press summary received and forwarded to n8n",
        ski_record_id: payload.ski_record_id,
        serial_number: payload.serial_number,
        n8n_status: n8nStatus,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error processing press summary:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
