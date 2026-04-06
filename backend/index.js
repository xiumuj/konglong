export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --- /api/submit ---
    if (path === '/api/submit' && request.method === 'POST') {
      try {
        const data = await request.json();
        const groupId = String(data.groupId);
        const success = !!data.success;
        const timestamp = data.timestamp || Date.now();

        // 检查 KV 中是否已存在该小组的结果
        const existing = await env.RESULTS_KV.get(groupId);
        if (!existing) {
          const result = { success, timestamp };
          await env.RESULTS_KV.put(groupId, JSON.stringify(result));
          console.log(`[首次提交] 小组 ${groupId} -> ${success ? '正确' : '错误'}`);
        } else {
          console.log(`[重复提交] 小组 ${groupId} 忽略`);
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

    // --- /api/results ---
    if (path === '/api/results' && request.method === 'GET') {
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- /api/clear ---
    if (path === '/api/clear' && request.method === 'POST') {
      try {
        const list = await env.RESULTS_KV.list();
        for (const key of list.keys) {
          await env.RESULTS_KV.delete(key.name);
        }
        console.log('[清空] 所有小组数据已从 KV 中删除');
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
