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

    // 更新 KV：如果已存在，则更新为最新状态；如果不存在，则创建。
    const result = { success, timestamp };
    if (screenshot) result.screenshot = screenshot;
    await env.RESULTS_KV.put(groupId, JSON.stringify(result));

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
