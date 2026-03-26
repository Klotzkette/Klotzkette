// beA Dark Mode — Popup: An/Aus Toggle

const toggle = document.getElementById('mainToggle');
const status = document.getElementById('status');

function updateStatus(state) {
  if (state === 'active') {
    status.textContent = 'Aktiv';
    status.className = 'status active';
  } else if (state === 'error') {
    status.textContent = 'Fehler';
    status.className = 'status error';
  } else {
    status.textContent = 'Aus';
    status.className = 'status';
  }
}

toggle.addEventListener('change', async () => {
  const isOn = toggle.checked;
  const action = isOn ? 'enable' : 'disable';

  chrome.storage.local.set({ beaDarkActive: isOn });

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('Kein aktiver Tab');
    await chrome.tabs.sendMessage(tab.id, { action });
    updateStatus(isOn ? 'active' : 'off');
  } catch (error) {
    console.error('[beA Dark Mode] Toggle fehlgeschlagen:', error);
    updateStatus('error');
  }
});

// Zustand wiederherstellen beim Öffnen
chrome.storage.local.get(['beaDarkActive'], (data) => {
  if (data.beaDarkActive) {
    toggle.checked = true;
    updateStatus('active');
  }
});

// State synchron halten über mehrere Popups
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.beaDarkActive) {
    const isOn = changes.beaDarkActive.newValue;
    toggle.checked = isOn;
    updateStatus(isOn ? 'active' : 'off');
  }
});
