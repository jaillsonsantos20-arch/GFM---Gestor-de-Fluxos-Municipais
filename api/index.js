exports.handler = async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from Vercel! ' + req.method + ' ' + req.url);
};
