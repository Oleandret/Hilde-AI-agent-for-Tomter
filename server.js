const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Settings are stored in /data/settings.json.
// On Railway, mount a volume at /data for persistence across deploys.
// Without a volume the file lives in the container and resets on redeploy —
// which is fine for a first-run experience (defaults kick in on the client).
const DATA_DIR     = process.env.DATA_DIR || path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json({ limit: '4mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── GET /api/settings ──────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      res.json(JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')));
    } else {
      res.json({});
    }
  } catch {
    res.json({});
  }
});

// ── POST /api/settings ─────────────────────────────────────────────
app.post('/api/settings', (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Health check ───────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── Catch-all → index.html (SPA fallback) ─────────────────────────
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hilde AI running on port ${PORT}`);
});
