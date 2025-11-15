import { Site, IndependentSite, FacebookSource } from './defaultLists';

export interface StorageData {
  settings: {
    isRedirectEnabled: boolean;
    isFacebookCleaningEnabled: boolean;
    facebookAction: 'blurAndWarn' | 'autoHide';
  };
  userPropagandaSites: Site[];
  userIndependentSites: IndependentSite[];
  userFacebookBlacklist: FacebookSource[];
  redirectWhitelistedSites: string[];
  redirectionLog: RedirectionLogEntry[];
}

export interface RedirectionLogEntry {
  timestamp: number;
  from: string;
  to: string;
}

export const defaultSettings: StorageData['settings'] = {
  isRedirectEnabled: true,
  isFacebookCleaningEnabled: true,
  facebookAction: 'blurAndWarn'
};

export async function getStorageData(): Promise<StorageData> {
  const data = await chrome.storage.local.get([
    'settings',
    'userPropagandaSites',
    'userIndependentSites',
    'userFacebookBlacklist',
    'redirectWhitelistedSites',
    'redirectionLog'
  ]);

  return {
    settings: data.settings || defaultSettings,
    userPropagandaSites: data.userPropagandaSites || [],
    userIndependentSites: data.userIndependentSites || [],
    userFacebookBlacklist: data.userFacebookBlacklist || [],
    redirectWhitelistedSites: data.redirectWhitelistedSites || [],
    redirectionLog: data.redirectionLog || []
  };
}

export async function updateSettings(settings: Partial<StorageData['settings']>): Promise<void> {
  const currentData = await getStorageData();
  await chrome.storage.local.set({
    settings: { ...currentData.settings, ...settings }
  });
}

export async function addRedirectionLogEntry(entry: RedirectionLogEntry): Promise<void> {
  const currentData = await getStorageData();
  const log = currentData.redirectionLog;
  
  log.push(entry);
  
  // Keep only last 100 entries
  if (log.length > 100) {
    log.splice(0, log.length - 100);
  }
  
  await chrome.storage.local.set({ redirectionLog: log });
}

export async function isHostnameWhitelisted(hostname: string): Promise<boolean> {
  const data = await getStorageData();
  return data.redirectWhitelistedSites.includes(hostname);
}

export async function addToWhitelist(hostname: string): Promise<void> {
  const data = await getStorageData();
  if (!data.redirectWhitelistedSites.includes(hostname)) {
    data.redirectWhitelistedSites.push(hostname);
    await chrome.storage.local.set({ redirectWhitelistedSites: data.redirectWhitelistedSites });
  }
}

export async function removeFromWhitelist(hostname: string): Promise<void> {
  const data = await getStorageData();
  const index = data.redirectWhitelistedSites.indexOf(hostname);
  if (index > -1) {
    data.redirectWhitelistedSites.splice(index, 1);
    await chrome.storage.local.set({ redirectWhitelistedSites: data.redirectWhitelistedSites });
  }
}

export async function getTodayStats(): Promise<{ redirectCount: number; facebookFilterCount: number }> {
  const data = await getStorageData();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  
  const redirectCount = data.redirectionLog.filter(
    entry => entry.timestamp >= todayStart
  ).length;
  
  // Facebook filter count would be tracked separately in a real implementation
  const facebookFilterCount = 0;
  
  return { redirectCount, facebookFilterCount };
}