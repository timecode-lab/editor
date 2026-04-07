export default async function handler(req, res) {
  // CORS (важно для браузера)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // обработка preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // путь после /api/proxy
    const path = req.url.replace(/^\/api\/proxy/, '');

    const targetUrl = 'https://api.streamersonglist.com' + path;

    const response = await fetch(targetUrl, {
      method: 'GET'
    });

    const text = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');

    return res.send(text);

  } catch (err) {
    return res.status(500).json({
      error: 'proxy_error',
      message: err.message
    });
  }
}
