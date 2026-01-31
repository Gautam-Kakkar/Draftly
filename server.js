import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Mount the API routes
app.use(apiApp);

// In production, serve the React frontend
if (process.env.NODE_ENV === 'production') {
  // Serve static files from Vite build
  app.use(express.static(path.resolve(__dirname, 'dist')));

  // For all other routes, serve index.html (SPA routing)
  app.get('*', (req, res) => {
    // Don't handle API routes
    if (req.path.startsWith('/generate') || req.path.startsWith('/health')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Draftly server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
