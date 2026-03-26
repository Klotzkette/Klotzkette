// beA Dark Mode — Content Script
// Rein grafische Übermalung via CSS, keine DOM-Manipulation

let darkCSSCache = null;

async function loadDarkCSS() {
  if (darkCSSCache) return darkCSSCache;
  try {
    const url = chrome.runtime.getURL('css/bea-dark.css');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CSS load failed: ${response.status}`);
    darkCSSCache = await response.text();
    return darkCSSCache;
  } catch (error) {
    console.error('[beA Dark Mode] CSS konnte nicht geladen werden:', error);
    throw error;
  }
}

async function enableDarkMode() {
  if (document.getElementById('bea-dark-mode')) return;
  try {
    const css = await loadDarkCSS();
    const style = document.createElement('style');
    style.id = 'bea-dark-mode';
    style.textContent = css;
    document.head.appendChild(style);
  } catch (error) {
    console.error('[beA Dark Mode] Aktivierung fehlgeschlagen:', error);
  }
}

function disableDarkMode() {
  const style = document.getElementById('bea-dark-mode');
  if (style) style.remove();
}

// Zustand beim Laden wiederherstellen (async, kein Callback)
(async () => {
  const data = await chrome.storage.local.get(['beaDarkActive']);
  if (data.beaDarkActive) {
    await enableDarkMode();
  }
})();

// Nachrichten vom Popup empfangen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;

  if (message.action === 'enable') {
    enableDarkMode().then(() => sendResponse({ success: true }));
    return true;
  } else if (message.action === 'disable') {
    disableDarkMode();
    sendResponse({ success: true });
  }
});
