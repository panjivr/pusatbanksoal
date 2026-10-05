import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Keep the editor and unsaved work mounted when a background operation fails.
const renderFatalError = (_error: unknown) => {
  let notice = document.getElementById('bekal-runtime-notice');
  if (notice) return;
  notice = document.createElement('div');
  notice.id = 'bekal-runtime-notice';
  notice.setAttribute('role', 'alert');
  notice.style.cssText = 'position:fixed;bottom:16px;right:16px;max-width:min(440px,calc(100vw - 32px));padding:16px;border:1px solid var(--app-border);border-radius:12px;background:var(--app-panel);color:var(--app-text);z-index:9999;font:13px system-ui;';
  const text = document.createElement('p');
  text.textContent = 'Ada operasi yang belum selesai. Simpan proyek atau unduh cadangan sebelum mencoba lagi.';
  const close = document.createElement('button');
  close.textContent = 'Tutup';
  close.style.cssText = 'margin-top:8px;color:var(--app-accent-strong);';
  close.onclick = () => notice?.remove();
  notice.append(text, close);
  document.body.appendChild(notice);
};

window.addEventListener('error', (event) => {
  renderFatalError(event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  renderFatalError(event.reason);
});

const applyPlatformAttributes = () => {
  const root = document.documentElement;
  const ua = navigator.userAgent.toLowerCase();
  const isElectron = ua.includes(' electron/') || Boolean((window as unknown as { electron?: unknown }).electron);
  const platform = ua.includes('mac') ? 'mac' : ua.includes('win') ? 'windows' : 'linux';
  root.dataset.runtime = isElectron ? 'electron' : 'web';
  root.dataset.platform = platform;
};

applyPlatformAttributes();
document.getElementById('studio-fallback')?.remove();

const rootElement = document.getElementById('root');
if (!rootElement) {
  renderFatalError('Could not find root element to mount to');
} else {
  const root = ReactDOM.createRoot(rootElement);
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    renderFatalError(error);
  }
}
