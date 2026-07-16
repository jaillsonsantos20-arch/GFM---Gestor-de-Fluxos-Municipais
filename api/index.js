exports.handler = async (req, res) => {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'test handler',
    method: req.method,
    url: req.url,
    env: process.env.DATABASE_URL ? 'DB set' : 'DB not set',
  }));
};
