import { propagandaSites, independentSites } from '../common/defaultLists';
import { 
  getStorageData, 
  defaultSettings, 
  addRedirectionLogEntry
} from '../common/storage';

// Initialize storage with defaults on install
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['settings']);
  if (!data.settings) {
    await chrome.storage.local.set({ settings: defaultSettings });
  }
  
  // Set up declarative rules for site blocking
  await updateDeclarativeRules();
});

// Track if rules update is in progress to prevent conflicts
let isUpdatingRules = false;

// Update declarative rules based on current settings
async function updateDeclarativeRules() {
  if (isUpdatingRules) {
    console.log('Rules update already in progress, skipping...');
    return;
  }
  
  isUpdatingRules = true;
  
  try {
    // Clear ALL existing rules first
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map(rule => rule.id);
    
    if (ruleIdsToRemove.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
      // Wait a bit to ensure rules are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const data = await getStorageData();
    if (!data.settings.isRedirectEnabled) {
      isUpdatingRules = false;
      return;
    }

    // Create rules for each propaganda site
    const rules: chrome.declarativeNetRequest.Rule[] = [];
    const allPropagandaSites = [...propagandaSites, ...data.userPropagandaSites];
    
    let ruleId = 1;
    allPropagandaSites.forEach((site) => {
      // Skip whitelisted sites
      if (data.redirectWhitelistedSites.includes(site.hostname)) return;
      
      // Create multiple rules for better coverage
      const patterns = [
        `*://${site.hostname}/*`,
        `*://www.${site.hostname}/*`,
        `*://*.${site.hostname}/*`
      ];
      
      patterns.forEach(pattern => {
        rules.push({
          id: ruleId++,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: {
              url: chrome.runtime.getURL(`redirect-overlay.html?hostname=${encodeURIComponent(site.hostname)}&siteName=${encodeURIComponent(site.name)}`)
            }
          },
          condition: {
            urlFilter: pattern,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
      });
      
      console.log(`Created rules for ${site.hostname} (${site.name})`);
    });

    if (rules.length > 0) {
      console.log(`Adding ${rules.length} redirect rules`);
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
      console.log('Rules updated successfully');
    }
  } catch (error) {
    console.error('Error updating declarative rules:', error);
  } finally {
    isUpdatingRules = false;
  }
}

// Throttle storage change updates
let updateTimeout: NodeJS.Timeout | null = null;

// Listen for storage changes to update rules
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings || changes.userPropagandaSites || changes.redirectWhitelistedSites) {
    // Clear existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    // Set new timeout to batch updates
    updateTimeout = setTimeout(() => {
      updateDeclarativeRules();
      updateTimeout = null;
    }, 500);
  }
});

// Handle messages from popup and other components
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCEED_REDIRECT') {
    const { url, from, to } = message;
    
    // Log the redirection
    addRedirectionLogEntry({
      timestamp: Date.now(),
      from,
      to
    });

    // Navigate to the target URL
    if (sender.tab?.id) {
      chrome.tabs.update(sender.tab.id, { url });
    }
  } else if (message.type === 'CANCEL_REDIRECT') {
    const { hostname, shouldWhitelist } = message;

    // Handle async operations in IIFE
    (async () => {
      // CRITICAL: Must whitelist BEFORE navigating, otherwise the redirect rules
      // will intercept the navigation and redirect back to overlay (infinite loop)
      if (shouldWhitelist) {
        // Add to permanent whitelist
        const data = await chrome.storage.local.get(['redirectWhitelistedSites']);
        const whitelist = data.redirectWhitelistedSites || [];
        if (!whitelist.includes(hostname)) {
          whitelist.push(hostname);
          await chrome.storage.local.set({ redirectWhitelistedSites: whitelist });
        }
      }

      // Always add to session whitelist temporarily to allow this navigation
      const data = await chrome.storage.local.get(['redirectWhitelistedSites']);
      const whitelist = data.redirectWhitelistedSites || [];
      const wasWhitelisted = whitelist.includes(hostname);

      if (!wasWhitelisted) {
        whitelist.push(hostname);
        await chrome.storage.local.set({ redirectWhitelistedSites: whitelist });
      }

      // Update rules to exclude whitelisted site
      await updateDeclarativeRules();

      // Now safe to navigate - rules won't redirect anymore
      if (sender.tab?.id) {
        chrome.tabs.update(sender.tab.id, { url: `https://${hostname}` });
      }

      // If not permanently whitelisted, remove from whitelist after navigation
      if (!shouldWhitelist && !wasWhitelisted) {
        // Wait a bit for navigation to complete, then remove from whitelist
        setTimeout(async () => {
          const currentData = await chrome.storage.local.get(['redirectWhitelistedSites']);
          const currentWhitelist = currentData.redirectWhitelistedSites || [];
          const index = currentWhitelist.indexOf(hostname);
          if (index > -1) {
            currentWhitelist.splice(index, 1);
            await chrome.storage.local.set({ redirectWhitelistedSites: currentWhitelist });
            await updateDeclarativeRules();
          }
        }, 2000);
      }
    })();
  } else if (message.type === 'WHITELIST_SITE') {
    const { hostname } = message;
    (async () => {
      const data = await chrome.storage.local.get(['redirectWhitelistedSites']);
      const whitelist = data.redirectWhitelistedSites || [];
      if (!whitelist.includes(hostname)) {
        whitelist.push(hostname);
        await chrome.storage.local.set({ redirectWhitelistedSites: whitelist });
        // Update rules after whitelisting
        await updateDeclarativeRules();
      }
    })();
  } else if (message.type === 'GET_STATS') {
    getStorageData().then(data => {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayRedirects = data.redirectionLog.filter(
        entry => entry.timestamp >= todayStart
      );
      
      sendResponse({
        redirectCount: todayRedirects.length,
        lastRedirect: todayRedirects[todayRedirects.length - 1]
      });
    });
    return true; // Keep message channel open for async response
  } else if (message.type === 'DEBUG_RULES') {
    // Debug function to check current rules
    chrome.declarativeNetRequest.getDynamicRules().then(rules => {
      console.log('Current declarative rules:', rules);
      sendResponse({ rules });
    });
    return true;
  }
});

// Export for testing
export { updateDeclarativeRules };