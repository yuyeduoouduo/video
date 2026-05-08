function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestPost(context) {
  const apiKey = context.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return json({ error: '服务端未配置 DEEPSEEK_API_KEY' }, 500);
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400);
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (!messages.length) {
    return json({ error: '缺少 messages 参数' }, 400);
  }

  const upstreamResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: 800,
      temperature: 0.7
    })
  });

  const rawText = await upstreamResp.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    return json({ error: '上游服务返回了无法解析的响应' }, 502);
  }

  if (!upstreamResp.ok) {
    return json({ error: data.error?.message || 'DeepSeek 接口调用失败' }, upstreamResp.status);
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return json({ error: 'DeepSeek 返回内容为空' }, 502);
  }

  return json({ reply });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS'
    }
  });
}