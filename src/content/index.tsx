import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import styles from '../styles/main.css?inline';

const HOST_ELEMENT_ID = 'x-profile-picture-preview-root';

function initializeContentScript() {
  if (document.getElementById(HOST_ELEMENT_ID)) {
    return;
  }

  // Create host container
  const host = document.createElement('div');
  host.id = HOST_ELEMENT_ID;
  document.documentElement.appendChild(host);

  // Attach Shadow DOM for style isolation
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Inject bundled styles into Shadow Root
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadowRoot.appendChild(styleEl);

  // Mount React app inside Shadow Root
  const appContainer = document.createElement('div');
  appContainer.id = 'xppp-app-container';
  shadowRoot.appendChild(appContainer);

  const root = ReactDOM.createRoot(appContainer);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('[X Profile Picture Preview] Content script initialized successfully.');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}
