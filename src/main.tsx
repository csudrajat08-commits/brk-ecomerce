import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { catalogStore } from './services/catalogStore';

// Load admin edits (IndexedDB) before first paint so pages never flash base data.
catalogStore.init().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
