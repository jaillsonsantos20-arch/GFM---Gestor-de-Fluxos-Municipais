const express = require('express');
const app = express();
app.use(express.json());
app.get('/', (req, res) => res.json({ ok: true }));
app.post('/auth/login', (req, res) => res.json({ token: 'test-token' }));
exports.handler = require('serverless-http')(app);
