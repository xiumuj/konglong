export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const data = await request.json();
    const groupId = String(data.groupId);
    const success = !!data.success;
    const timestamp = data.timestamp || Date.now();
    const screenshot = data.screenshot || null;

    const raw = await env.RESULTS_KV.get('all_results');
    const results = raw ? JSON.parse(raw) : {};

    const result = { success, timestamp };
    if (screenshot) result.screenshot = screenshot;
    results[groupId] = result;

    await env.RESULTS_KV.put('all_results', JSON.stringify(results));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
