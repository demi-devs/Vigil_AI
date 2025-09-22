// Popup script for the extension interface
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadCurrentTabInfo();
  await loadStats();
  
  // Event listeners
  document.getElementById('sensitivity').addEventListener('change', saveSettings);
  document.getElementById('toggleProtection').addEventListener('click', toggleProtection);
  document.getElementById('viewWhitelist').addEventListener('click', viewWhitelist);
  document.getElementById('viewStats').addEventListener('click', viewStats);
  document.getElementById('whitelistCurrent').addEventListener('click', whitelistCurrent);
  document.getElementById('blacklistCurrent').addEventListener('click', blacklistCurrent);
});

async function loadSettings() {
  const settings = await chrome.storage.local.get(['enabled', 'sensitivity']);
  
  // Update sensitivity dropdown
  document.getElementById('sensitivity').value = settings.sensitivity || 'medium';
  
  // Update protection status
  updateProtectionStatus(settings.enabled !== false);
}

async function loadCurrentTabInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.url) {
    const url = new URL(tab.url);
    document.getElementById('currentPageInfo').textContent = url.hostname;
  }
}

async function loadStats() {
  const { stats } = await chrome.storage.local.get(['stats']);
  
  if (stats) {
    document.getElementById('checkedCount').textContent = stats.checked || 0;
    document.getElementById('blockedCount').textContent = stats.blocked || 0;
    document.getElementById('warnedCount').textContent = stats.warned || 0;
  }
}

async function saveSettings() {
  const sensitivity = document.getElementById('sensitivity').value;
  await chrome.storage.local.set({ sensitivity });
}

async function toggleProtection() {
  const { enabled } = await chrome.storage.local.get(['enabled']);
  const newEnabled = !(enabled !== false); // Default to true if not set
  
  await chrome.storage.local.set({ enabled: newEnabled });
  updateProtectionStatus(newEnabled);
}

function updateProtectionStatus(enabled) {
  const statusElement = document.getElementById('status');
  const toggleButton = document.getElementById('toggleProtection');
  
  if (enabled) {
    statusElement.textContent = 'Protection Enabled';
    statusElement.className = 'status enabled';
    toggleButton.textContent = 'Disable Protection';
    toggleButton.className = 'btn btn-secondary';
  } else {
    statusElement.textContent = 'Protection Disabled';
    statusElement.className = 'status disabled';
    toggleButton.textContent = 'Enable Protection';
    toggleButton.className = 'btn btn-primary';
  }
}

function viewWhitelist() {
  // In a full implementation, this would open a management page
  chrome.tabs.create({ url: chrome.runtime.getURL('whitelist.html') });
}

function viewStats() {
  // In a full implementation, this would open a detailed stats page
  alert('Detailed statistics would be shown here in the full version.');
}

async function whitelistCurrent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    const { whitelist } = await chrome.storage.local.get(['whitelist']);
    const newWhitelist = [...new Set([...(whitelist || []), domain])];
    
    await chrome.storage.local.set({ whitelist: newWhitelist });
    alert(`Added ${domain} to whitelist`);
  }
}

async function blacklistCurrent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    const { blacklist } = await chrome.storage.local.get(['blacklist']);
    const newBlacklist = [...new Set([...(blacklist || []), domain])];
    
    await chrome.storage.local.set({ blacklist: newBlacklist });
    alert(`Added ${domain} to blacklist`);
  }
}