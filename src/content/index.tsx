import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { XAvatarReplacer } from './avatarReplacer';
import { XProfileButtonInjector } from './profileButtonInjector';
import styles from '../styles/main.css?inline';

const HOST_ELEMENT_ID = 'x-profile-picture-preview-root';

function initializeContentScript() {
  if (document.getElementById(HOST_ELEMENT_ID)) {
    return;
  }

  // 1. Create host container
  const host = document.createElement('div');
  host.id = HOST_ELEMENT_ID;
  document.documentElement.appendChild(host);

  // 2. Attach Shadow DOM for style isolation
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // 3. Inject bundled Tailwind / app styles into Shadow Root
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadowRoot.appendChild(styleEl);

  // 4. Mount React app inside Shadow Root
  const appContainer = document.createElement('div');
  appContainer.id = 'xppp-app-container';
  shadowRoot.appendChild(appContainer);

  const root = ReactDOM.createRoot(appContainer);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // 5. Initialize background Avatar Replacer across X
  const avatarReplacer = new XAvatarReplacer();
  (window as any).__xppp_avatar_replacer = avatarReplacer;
  avatarReplacer.start();

  // 6. Initialize Profile Button Injector
  const profileButtonInjector = new XProfileButtonInjector(() => {
    window.dispatchEvent(new CustomEvent('xppp_open_crop_modal'));
  });
  profileButtonInjector.start();

  console.log('[X Profile Picture Preview] Initialized successfully with profile button & site-wide replacer.');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}
