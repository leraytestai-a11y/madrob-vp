import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const N8N_WEBHOOK_URL = "https://n8n.srv833470.hstgr.cloud/webhook/2f9bae56-7a22-4b8d-a63c-a188d64ecd25";

interface MeasurementData {
  field_name: string;
  field_display_name: string;
  field_type: string;
  unit: string | null;
  value: string | null;
  skipped: boolean;
}

interface SummaryPayload {
  ski_record_id: string;
  serial_number: string;
  sku: string | null;
  side: string;
  operation_id: string;
  operation_name: string;
  module_name: string;
  operator_initials: string | null;
  timestamp: string;
  date: string;
  time: string;
  measurements: MeasurementData[];
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: SummaryPayload = await req.json();

    console.log("Received measurement summary:", JSON.stringify(payload, null, 2));

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

    console.log("n8n webhook response:", n8nStatus, JSON.stringify(n8nBody));

    if (!n8nResponse.ok) {
      console.error("n8n webhook returned error:", n8nStatus, n8nBody);
    }

    const response = {
      success: true,
      message: "Summary received and forwarded to n8n",
      ski_record_id: payload.ski_record_id,
      serial_number: payload.serial_number,
      side: payload.side,
      n8n_status: n8nStatus,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error processing summary:", error);

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
