import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss';
import App from './App';

// Check for inactive session on startup
(function checkStartupSession() {
  const lastActive = localStorage.getItem("lastActiveTime");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (isAuthenticated && lastActive) {
    const inactiveDuration = Date.now() - parseInt(lastActive, 10);
    const ONE_HOUR = 3600000; // 1 hour in ms
    if (inactiveDuration > ONE_HOUR) {
      localStorage.clear();
    }
  }
})();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)