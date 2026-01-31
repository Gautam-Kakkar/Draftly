import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In production, serve the React frontend
if (process.env.NODE_ENV === 'production') {
  // Serve static files from Vite build FIRST
  app.use(express.static(path.resolve(__dirname, 'dist')));
}

// Mount the API routes (will handle /generate, /health)
app.use(apiApp);

// For all other routes, serve index.html (SPA routing)
// This only runs in production and doesn't interfere with API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Draftly server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
