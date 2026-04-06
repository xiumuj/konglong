export async function onRequestGet(context) {
  const { env } = context;
  try {
    const list = await env.RESULTS_KV.list();
    const results = {};
    for (const key of list.keys) {
      const val = await env.RESULTS_KV.get(key.name);
      if (val) {
        results[key.name] = JSON.parse(val);
      }
    }
    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 允许跨域
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
