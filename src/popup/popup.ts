import { getStorageData, updateSettings } from '../common/storage';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load current settings
  const data = await getStorageData();
  
  // Set toggle states
  const redirectToggle = document.getElementById('redirect-toggle') as HTMLInputElement;
  const facebookToggle = document.getElementById('facebook-toggle') as HTMLInputElement;
  
  redirectToggle.checked = data.settings.isRedirectEnabled;
  facebookToggle.checked = data.settings.isFacebookCleaningEnabled;
  
  // Load stats
  updateStats();
  
  // Add event listeners
  redirectToggle.addEventListener('change', async (e) => {
    await updateSettings({ isRedirectEnabled: (e.target as HTMLInputElement).checked });
  });
  
  facebookToggle.addEventListener('change', async (e) => {
    await updateSettings({ isFacebookCleaningEnabled: (e.target as HTMLInputElement).checked });
  });
  
  document.getElementById('settings-btn')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('how-it-works')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
  });
});

// Update statistics
async function updateStats() {
  // Get stats from background script
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
    if (response) {
      document.getElementById('redirect-count')!.textContent = response.redirectCount.toString();
      
      // Show last redirect if available
      if (response.lastRedirect) {
        const lastActionEl = document.getElementById('last-action');
        const lastActionText = document.getElementById('last-action-text');
        
        if (lastActionEl && lastActionText) {
          lastActionEl.style.display = 'block';
          lastActionText.textContent = `${response.lastRedirect.from} → ${response.lastRedirect.to}`;
        }
      }
    }
  });
  
  // Facebook count would be updated from content script
  // For now, showing placeholder
  const data = await getStorageData();
  const facebookCount = data.userFacebookBlacklist.length; // Placeholder
  document.getElementById('facebook-count')!.textContent = '0';
}