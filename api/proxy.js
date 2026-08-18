const API_BASE = 'https://api.streamersonglist.com';

const ALLOWED_ENDPOINTS = [
  '/streamers/',
  '/play_history/export'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'method_not_allowed'
    });
  }

  const API_TOKEN = process.env.USER_TOKEN;

  if (!API_TOKEN) {
    console.error('[TCLab] API_TOKEN is not configured');

    return res.status(500).json({
      error: 'proxy_not_configured'
    });
  }

  try {
    const endpoint = req.query.endpoint;

    if (!endpoint || typeof endpoint !== 'string') {
      return res.status(400).json({
        error: 'missing_endpoint'
      });
    }

    if (!endpoint.startsWith('/') || endpoint.startsWith('//')) {
      return res.status(400).json({
        error: 'invalid_endpoint'
      });
    }

    const isAllowed = ALLOWED_ENDPOINTS.some(prefix =>
      endpoint === prefix || endpoint.startsWith(prefix)
    );

    if (!isAllowed) {
      console.warn(`[TCLab] Blocked proxy endpoint: ${endpoint}`);

      return res.status(403).json({
        error: 'endpoint_not_allowed'
      });
    }

    const targetUrl = API_BASE + endpoint;

    console.log(`[TCLab] Proxy request: ${endpoint}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `User ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    const contentType =
      response.headers.get('content-type') || 'application/json';

    const text = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', contentType);

    return res.send(text);

  } catch (err) {
    console.error('[TCLab] Proxy error:', err);

    return res.status(502).json({
      error: 'proxy_error',
      message: 'Не удалось связаться с API'
    });
  }
}