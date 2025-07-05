// SISTEMA COMPLETO DE INTERCEPTACIÓN DE ERRORES - DEBE SER LO PRIMERO
import './lib/errorInterceptionSystem';
import './lib/reactErrorPatch';

import './styles/tailwind.css';
import './styles/design-tokens.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
)
