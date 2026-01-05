import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Suppress Vite HMR logs
const originalLog = console.log;
const originalDebug = console.debug;

console.log = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
  originalLog(...args);
};

console.debug = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
  originalDebug(...args);
};

import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)