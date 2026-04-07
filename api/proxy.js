export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const endpoint = req.query.endpoint;

    if (!endpoint) {
      return res.status(400).json({ error: 'Не передан параметр endpoint' });
    }

    const targetUrl = 'https://api.streamersonglist.com' + endpoint;

    const response = await fetch(targetUrl, { method: 'GET' });
    const text = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');

    return res.send(text);

  } catch (err) {
    return res.status(500).json({ error: 'proxy_error', message: err.message });
  }
}
