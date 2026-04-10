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

    const result = { success, timestamp };
    if (screenshot) result.screenshot = screenshot;
    await env.RESULTS_KV.put(groupId, JSON.stringify(result));

    const keysListStr = await env.RESULTS_KV.get('keys_list');
    let keysList = [];
    if (keysListStr) {
      try {
        keysList = JSON.parse(keysListStr);
      } catch (e) {
        keysList = [];
      }
    }
    if (!keysList.includes(groupId)) {
      keysList.push(groupId);
      await env.RESULTS_KV.put('keys_list', JSON.stringify(keysList));
    }

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

// 允许跨域
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
