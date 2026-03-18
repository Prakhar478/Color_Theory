import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './ui-enhancements.css'

// Premium UI: Cursor Glow & Tracking
if (typeof window !== 'undefined' && !document.getElementById('cursor-glow-root')) {
  const glow = document.createElement('div');
  glow.id = 'cursor-glow-root';
  glow.className = 'cursor-glow-provider';
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', x + '%');
    document.documentElement.style.setProperty('--mouse-y', y + '%');
  }, { passive: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
