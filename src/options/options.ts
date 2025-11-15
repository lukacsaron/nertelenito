import { getStorageData, updateSettings } from '../common/storage';
import { propagandaSites, independentSites, facebookBlacklist } from '../common/defaultLists';

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Load and display current settings
async function loadSettings() {
  const data = await getStorageData();
  
  // Set checkbox states
  (document.getElementById('redirect-enabled') as HTMLInputElement).checked = data.settings.isRedirectEnabled;
  (document.getElementById('facebook-enabled') as HTMLInputElement).checked = data.settings.isFacebookCleaningEnabled;
  
  // Set radio button for Facebook action
  const radioButtons = document.querySelectorAll('input[name="facebook-action"]');
  radioButtons.forEach((radio) => {
    const radioInput = radio as HTMLInputElement;
    radioInput.checked = radioInput.value === data.settings.facebookAction;
  });
  
  // Display lists
  displayPropagandaSites(data.userPropagandaSites);
  displayIndependentSites(data.userIndependentSites);
  displayFacebookBlacklist(data.userFacebookBlacklist);
  displayWhitelistedSites(data.redirectWhitelistedSites);
}

// Display propaganda sites
function displayPropagandaSites(userSites: any[]) {
  const container = document.getElementById('propaganda-sites-list')!;
  container.innerHTML = '';
  
  // Show default sites
  propagandaSites.forEach(site => {
    const item = createSiteItem(site.name, site.hostname, 'alapértelmezett', false);
    container.appendChild(item);
  });
  
  // Show user-added sites
  userSites.forEach((site, index) => {
    const item = createSiteItem(site.name, site.hostname, 'hozzáadott', true, () => removePropagandaSite(index));
    container.appendChild(item);
  });
  
  if (container.children.length === 0) {
    container.innerHTML = '<div class="empty-list">Nincs hozzáadott oldal</div>';
  }
}

// Display independent sites
function displayIndependentSites(userSites: any[]) {
  const container = document.getElementById('independent-sites-list')!;
  container.innerHTML = '';
  
  // Show default sites
  independentSites.forEach(site => {
    const item = createSiteItem(site.name, site.url, 'alapértelmezett', false);
    container.appendChild(item);
  });
  
  // Show user-added sites
  userSites.forEach((site, index) => {
    const item = createSiteItem(site.name, site.url, 'hozzáadott', true, () => removeIndependentSite(index));
    container.appendChild(item);
  });
  
  if (container.children.length === 0) {
    container.innerHTML = '<div class="empty-list">Nincs hozzáadott oldal</div>';
  }
}

// Display Facebook blacklist
function displayFacebookBlacklist(userSources: any[]) {
  const container = document.getElementById('facebook-blacklist')!;
  container.innerHTML = '';
  
  // Show default sources
  facebookBlacklist.forEach(source => {
    const item = createSiteItem(source.name, source.reason, 'alapértelmezett', false);
    container.appendChild(item);
  });
  
  // Show user-added sources
  userSources.forEach((source, index) => {
    const item = createSiteItem(source.name, source.reason, 'hozzáadott', true, () => removeFacebookSource(index));
    container.appendChild(item);
  });
  
  if (container.children.length === 0) {
    container.innerHTML = '<div class="empty-list">Nincs hozzáadott forrás</div>';
  }
}

// Display whitelisted sites
function displayWhitelistedSites(sites: string[]) {
  const container = document.getElementById('whitelisted-sites')!;
  container.innerHTML = '';
  
  sites.forEach((site, index) => {
    const item = createSiteItem(site, '', '', true, () => removeWhitelistedSite(index));
    container.appendChild(item);
  });
  
  if (sites.length === 0) {
    container.innerHTML = '<div class="empty-list">Nincs fehérlistázott oldal</div>';
  }
}

// Create a site item element
function createSiteItem(name: string, detail: string, type: string, removable: boolean, onRemove?: () => void): HTMLElement {
  const item = document.createElement('div');
  item.className = 'site-item';
  
  const info = document.createElement('div');
  info.innerHTML = `
    <span class="site-name">${name}</span>
    ${detail ? `<span class="site-detail">${detail}</span>` : ''}
    ${type ? `<span class="site-type">(${type})</span>` : ''}
  `;
  
  item.appendChild(info);
  
  if (removable && onRemove) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Eltávolítás';
    removeBtn.addEventListener('click', onRemove);
    item.appendChild(removeBtn);
  }
  
  return item;
}

// Setup event listeners
function setupEventListeners() {
  // Settings checkboxes
  document.getElementById('redirect-enabled')?.addEventListener('change', async (e) => {
    await updateSettings({ isRedirectEnabled: (e.target as HTMLInputElement).checked });
  });
  
  document.getElementById('facebook-enabled')?.addEventListener('change', async (e) => {
    await updateSettings({ isFacebookCleaningEnabled: (e.target as HTMLInputElement).checked });
  });
  
  // Facebook action radio buttons
  document.querySelectorAll('input[name="facebook-action"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      await updateSettings({ facebookAction: (e.target as HTMLInputElement).value as any });
    });
  });
  
  // Add buttons
  document.getElementById('add-propaganda-btn')?.addEventListener('click', addPropagandaSite);
  document.getElementById('add-independent-btn')?.addEventListener('click', addIndependentSite);
  document.getElementById('add-facebook-btn')?.addEventListener('click', addFacebookSource);
  
  // Action buttons
  document.getElementById('reset-settings')?.addEventListener('click', resetSettings);
  document.getElementById('export-settings')?.addEventListener('click', exportSettings);
  document.getElementById('import-settings')?.addEventListener('click', importSettings);
  
  // Enter key support for input fields
  document.getElementById('add-propaganda-site')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPropagandaSite();
  });
  
  document.getElementById('add-independent-site')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addIndependentSite();
  });
  
  document.getElementById('add-facebook-source')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addFacebookSource();
  });
}

// Add/remove functions
async function addPropagandaSite() {
  const input = document.getElementById('add-propaganda-site') as HTMLInputElement;
  const hostname = input.value.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  if (!hostname) return;
  
  const data = await getStorageData();
  data.userPropagandaSites.push({
    hostname,
    name: hostname
  });
  
  await chrome.storage.local.set({ userPropagandaSites: data.userPropagandaSites });
  input.value = '';
  await loadSettings();
}

async function addIndependentSite() {
  const input = document.getElementById('add-independent-site') as HTMLInputElement;
  const url = input.value.trim();
  
  if (!url) return;
  
  // Ensure URL has protocol
  const finalUrl = url.startsWith('http') ? url : `https://${url}`;
  const name = new URL(finalUrl).hostname;
  
  const data = await getStorageData();
  data.userIndependentSites.push({
    url: finalUrl,
    name
  });
  
  await chrome.storage.local.set({ userIndependentSites: data.userIndependentSites });
  input.value = '';
  await loadSettings();
}

async function addFacebookSource() {
  const input = document.getElementById('add-facebook-source') as HTMLInputElement;
  const name = input.value.trim();
  
  if (!name) return;
  
  const data = await getStorageData();
  data.userFacebookBlacklist.push({
    id: name.toLowerCase().replace(/\s+/g, ''),
    name,
    reason: 'felhasználó által hozzáadva'
  });
  
  await chrome.storage.local.set({ userFacebookBlacklist: data.userFacebookBlacklist });
  input.value = '';
  await loadSettings();
}

async function removePropagandaSite(index: number) {
  const data = await getStorageData();
  data.userPropagandaSites.splice(index, 1);
  await chrome.storage.local.set({ userPropagandaSites: data.userPropagandaSites });
  await loadSettings();
}

async function removeIndependentSite(index: number) {
  const data = await getStorageData();
  data.userIndependentSites.splice(index, 1);
  await chrome.storage.local.set({ userIndependentSites: data.userIndependentSites });
  await loadSettings();
}

async function removeFacebookSource(index: number) {
  const data = await getStorageData();
  data.userFacebookBlacklist.splice(index, 1);
  await chrome.storage.local.set({ userFacebookBlacklist: data.userFacebookBlacklist });
  await loadSettings();
}

async function removeWhitelistedSite(index: number) {
  const data = await getStorageData();
  data.redirectWhitelistedSites.splice(index, 1);
  await chrome.storage.local.set({ redirectWhitelistedSites: data.redirectWhitelistedSites });
  await loadSettings();
}

// Action functions
async function resetSettings() {
  if (confirm('Biztosan visszaállítod az alapértelmezett beállításokat?')) {
    await chrome.storage.local.clear();
    await loadSettings();
    alert('Beállítások visszaállítva!');
  }
}

async function exportSettings() {
  const data = await getStorageData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hirszuro-settings.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

async function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (data.settings && typeof data.settings === 'object') {
        await chrome.storage.local.set(data);
        await loadSettings();
        alert('Beállítások sikeresen importálva!');
      } else {
        alert('Érvénytelen beállítási fájl!');
      }
    } catch (error) {
      alert('Hiba történt a fájl olvasása során!');
    }
  });
  
  input.click();
}