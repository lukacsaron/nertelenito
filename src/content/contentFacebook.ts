import { facebookBlacklist, independentFacebookPages } from '../common/defaultLists';
import { getStorageData } from '../common/storage';

// Track processed posts to avoid duplicates
const processedPosts = new Set<string>();
let settings: any = null;
let blacklist: any[] = [];
let trustedPages: any[] = [];
let hiddenPostCount = 0;
let filteredPostCount = 0;

// Performance optimization - debounce processing
let processingQueue: Element[] = [];
let processingTimeout: number | null = null;

// More comprehensive selectors for Facebook posts
const POST_SELECTORS = [
  '[role="article"]',
  '[data-pagelet*="FeedUnit"]',
  '[data-testid="story-subtitle"]',
  '.story_body_container',
  '[data-ft]',
  '.userContentWrapper',
  '[data-testid="fbfeed_story"]',
  '.feed_story',
  '[data-testid="story-container"]'
];

// Function to filter out incomplete or invalid posts
function isValidPost(element: Element): boolean {
  // Must be visible
  if (element instanceof HTMLElement && element.offsetParent === null) return false;
  
  // Must have some minimum size (avoid tiny containers)
  const rect = element.getBoundingClientRect();
  if (rect.height < 50 || rect.width < 100) return false;
  
  // Should not be a duplicate (check if it has a parent that's also a post)
  const parentPost = element.parentElement?.closest(POST_SELECTORS.join(', '));
  if (parentPost && parentPost !== element) return false;
  
  return true;
}

// Enhanced author link selectors
const AUTHOR_SELECTORS = [
  'a[role="link"][href*="/profile.php"]',
  'a[role="link"][href^="/"][href*="?"]',
  'h4 a[href]',
  'strong a[href]',
  '[data-testid="story_subtitle"] a',
  '.story_body_container a[href]',
  '[data-hovercard*="user"] a',
  '[data-hovercard*="page"] a',
  '.actorName a',
  '.profileLink',
  'span[dir="auto"] a[href]'
];

// Load settings and lists
async function loadSettings() {
  const data = await getStorageData();
  settings = data.settings;
  blacklist = [...facebookBlacklist, ...data.userFacebookBlacklist];
  trustedPages = independentFacebookPages;
  
  console.log('📂 Settings loaded:', settings);
  console.log('📋 Total blacklist items:', blacklist.length);
  console.log('👥 User blacklist items:', data.userFacebookBlacklist.length);
  console.log('🔍 User items:', data.userFacebookBlacklist.map(item => item.name));
}

// Initialize
loadSettings();

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings || changes.userFacebookBlacklist) {
    loadSettings();
  }
});

// Enhanced author info extraction with multiple fallback strategies
function extractAuthorInfo(postElement: Element): { id?: string; name?: string; url?: string } | null {
  try {
    let authorLink: Element | null = null;
    
    // Try multiple selector strategies
    for (const selector of AUTHOR_SELECTORS) {
      authorLink = postElement.querySelector(selector);
      if (authorLink) {
        break;
      }
    }
    
    // Additional fallback: look for any link that contains user/page indicators
    if (!authorLink) {
      const allLinks = Array.from(postElement.querySelectorAll('a[href]'));
      
      for (const link of allLinks) {
        const href = link.getAttribute('href') || '';
        if (href.includes('/profile.php?id=') || 
            href.match(/^\/[^?\/]+\/?$/) ||
            href.includes('facebook.com/')) {
          authorLink = link;
          break;
        }
      }
    }
    
    if (!authorLink) return null;
    
    const href = authorLink.getAttribute('href') || '';
    let name = authorLink.textContent?.trim() || '';
    
    // If name is empty, try to get it from parent elements
    if (!name) {
      const parentSpan = authorLink.closest('span[dir="auto"]');
      if (parentSpan) {
        name = parentSpan.textContent?.trim() || '';
      }
    }
    
    // Extract ID from URL with more comprehensive patterns
    let id = '';
    
    // Profile URLs like /profile.php?id=100044249000000
    const profileMatch = href.match(/profile\.php\?id=(\d+)/);
    if (profileMatch) {
      id = profileMatch[1];
    } else {
      // Page URLs like /PageName or /PageName/
      const pageMatch = href.match(/^\/([^\/\?]+)/);
      if (pageMatch && pageMatch[1] !== 'photo.php' && pageMatch[1] !== 'groups') {
        id = pageMatch[1];
      }
    }
    
    // Also extract full URL for additional matching
    const fullUrl = href.startsWith('http') ? href : `https://facebook.com${href}`;
    
    const result = { id, name, url: fullUrl };
    
    // Only log when we actually find author info
    if (id && name) {
      console.log('👤 Found author:', name, `(${id})`);
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting author info:', error);
    return null;
  }
}

// Create warning overlay for a post
function createWarningOverlay(postElement: Element, authorName: string, reason: string) {
  const overlay = document.createElement('div');
  overlay.className = 'hirszuro-overlay';
  
  overlay.innerHTML = `
    <div class="hirszuro-warning">
      <h3>Hoppá! Egy megfontolandó forrás.</h3>
      <p>Ezt a bejegyzést <strong>${authorName}</strong> tette közzé, aki/ami ismerten ${reason}.</p>
      <div class="hirszuro-buttons">
        <button class="hirszuro-btn hirszuro-btn-show">Mutasd a tartalmat!</button>
        <button class="hirszuro-btn hirszuro-btn-hide">Forrás elrejtése a jövőben</button>
        <button class="hirszuro-btn hirszuro-btn-why">Miért látom ezt?</button>
      </div>
    </div>
  `;
  
  // Add event listeners
  overlay.querySelector('.hirszuro-btn-show')?.addEventListener('click', () => {
    postElement.classList.remove('hirszuro-blurred');
    overlay.remove();
  });
  
  overlay.querySelector('.hirszuro-btn-hide')?.addEventListener('click', async () => {
    // Add to user's personal blocklist
    const authorInfo = extractAuthorInfo(postElement);
    if (authorInfo?.id) {
      const data = await getStorageData();
      data.userFacebookBlacklist.push({
        id: authorInfo.id,
        name: authorName,
        reason: 'felhasználó által hozzáadva'
      });
      await chrome.storage.local.set({ userFacebookBlacklist: data.userFacebookBlacklist });
    }
    
    // Hide the post
    (postElement as HTMLElement).style.display = 'none';
  });
  
  overlay.querySelector('.hirszuro-btn-why')?.addEventListener('click', () => {
    alert('A NERtelenítő segít felismerni a propagandaforrásokat és ösztönzi a független média fogyasztását. A beállításokban testreszabhatod a működését.');
  });
  
  return overlay;
}

// Enhanced trust badge with better positioning
function addTrustBadge(postElement: Element, sourceName: string) {
  // Try multiple positioning strategies
  const positioningSelectors = [
    'h4', 'h3', 'h2',
    '[data-testid="story_subtitle"]',
    '.story_body_container h4',
    '.actorName',
    'strong a[href]',
    'span[dir="auto"] a[href]'
  ];
  
  let targetElement: Element | null = null;
  
  for (const selector of positioningSelectors) {
    targetElement = postElement.querySelector(selector);
    if (targetElement && !targetElement.querySelector('.hirszuro-badge')) {
      break;
    }
  }
  
  if (targetElement) {
    const badge = document.createElement('div');
    badge.className = 'hirszuro-badge';
    badge.innerHTML = `<span>✓ Ellenőrzötten független</span>`;
    badge.title = `${sourceName} - Független forrás`;
    
    // Insert badge after the target element
    targetElement.appendChild(badge);
  }
}

// Hidden posts notification system
function updateHiddenPostsNotification() {
  const existingNotification = document.querySelector('.hirszuro-hidden-notification');
  
  if (hiddenPostCount > 0) {
    if (!existingNotification) {
      createHiddenPostsNotification();
    } else {
      updateNotificationText(existingNotification as HTMLElement);
    }
  } else if (existingNotification) {
    existingNotification.remove();
  }
}

function createHiddenPostsNotification() {
  const notification = document.createElement('div');
  notification.className = 'hirszuro-hidden-notification';
  
  updateNotificationText(notification);
  
  // Add click handler to show details
  notification.addEventListener('click', () => {
    const details = notification.querySelector('.hirszuro-notification-details');
    if (details) {
      details.classList.toggle('visible');
    }
  });
  
  // Insert at the top of the feed
  const feedContainer = document.querySelector('[role="main"], [role="feed"], #content');
  if (feedContainer) {
    feedContainer.insertBefore(notification, feedContainer.firstChild);
  }
}

function updateNotificationText(notification: HTMLElement) {
  notification.innerHTML = `
    <div class="hirszuro-notification-content">
      <span class="hirszuro-notification-icon">🛡️</span>
      <span class="hirszuro-notification-text">
        NERtelenítő ${hiddenPostCount} bejegyzést rejtett el a hírfolyamodból.
      </span>
      <button class="hirszuro-notification-toggle">Részletek</button>
    </div>
    <div class="hirszuro-notification-details">
      <p>Összesen ${filteredPostCount} propaganda tartalom szűrve ebben a munkamenetben.</p>
      <button class="hirszuro-show-hidden">Rejtett bejegyzések megjelenítése</button>
    </div>
  `;
  
  // Add event listeners
  const toggleBtn = notification.querySelector('.hirszuro-notification-toggle');
  const showHiddenBtn = notification.querySelector('.hirszuro-show-hidden');
  
  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const details = notification.querySelector('.hirszuro-notification-details');
    details?.classList.toggle('visible');
  });
  
  showHiddenBtn?.addEventListener('click', () => {
    showAllHiddenPosts();
  });
}

function showAllHiddenPosts() {
  const hiddenPosts = Array.from(document.querySelectorAll('[data-hirszuro-processed][style*="display: none"]'));
  hiddenPosts.forEach(post => {
    (post as HTMLElement).style.display = '';
    post.classList.add('hirszuro-temporarily-shown');
  });
  
  hiddenPostCount = 0;
  updateHiddenPostsNotification();
  
  // Auto-hide again after 10 seconds
  setTimeout(() => {
    const tempShown = Array.from(document.querySelectorAll('.hirszuro-temporarily-shown'));
    tempShown.forEach(post => {
      (post as HTMLElement).style.display = 'none';
      post.classList.remove('hirszuro-temporarily-shown');
    });
    hiddenPostCount = tempShown.length;
    updateHiddenPostsNotification();
  }, 10000);
}

// Enhanced content analysis for sophisticated filtering
function analyzePostContent(postElement: Element): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  
  try {
    const textContent = postElement.textContent?.toLowerCase() || '';
    
    // Check for propaganda keywords (Hungarian)
    const propagandaKeywords = [
      'brüsszel', 'soros', 'migráns', 'gender', 'lgbtq támadás',
      'nemzeti konzultáció', 'magyarország előre megy',
      'fidesz', 'orbán viktor miniszterelnök', 'keresztény értékek',
      'nemzeti szuverenitás', 'bevándorlási válság'
    ];
    
    propagandaKeywords.forEach(keyword => {
      if (textContent.includes(keyword)) {
        score += 2;
        reasons.push(`Propaganda kulcsszó: ${keyword}`);
      }
    });
    
    // Check for emotional manipulation language
    const emotionalWords = [
      'veszély', 'támadás', 'fenyegetés', 'védelem', 'megmentés',
      'hazaáruló', 'ellenség', 'rettenet', 'katasztrófa'
    ];
    
    let emotionalCount = 0;
    emotionalWords.forEach(word => {
      if (textContent.includes(word)) {
        emotionalCount++;
      }
    });
    
    if (emotionalCount > 2) {
      score += 3;
      reasons.push('Érzelmi manipuláció jelei');
    }
    
    // Check for external links to propaganda sites
    const links = Array.from(postElement.querySelectorAll('a[href]'));
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('origo.hu') || href.includes('888.hu') || 
          href.includes('pestisracok.hu') || href.includes('magyarnemzet.hu')) {
        score += 4;
        reasons.push('Propaganda oldal linkje');
      }
    });
    
  } catch (error) {
    console.error('Error analyzing post content:', error);
  }
  
  return { score, reasons };
}

// Simplified content check - just verify it has some basic structure
function hasPostContent(postElement: Element): boolean {
  // Check for any text content at all
  const textContent = postElement.textContent?.trim() || '';
  if (textContent.length < 5) return false;
  
  // Check for any links (most Facebook posts have links)
  const hasLinks = postElement.querySelectorAll('a[href]').length > 0;
  
  // Should have either links or substantial text
  return hasLinks || textContent.length > 50;
}

// Simplified post processing - no more retry nonsense
function processPost(postElement: Element) {
  // Skip if already processed
  const postId = postElement.getAttribute('data-hirszuro-processed');
  if (postId) return;
  
  if (!settings?.isFacebookCleaningEnabled) return;
  
  // Mark as processed immediately to avoid loops
  const uniqueId = Date.now().toString();
  postElement.setAttribute('data-hirszuro-processed', uniqueId);
  
  // Quick content check - if no content, just skip silently
  if (!hasPostContent(postElement)) {
    return;
  }
  
  const authorInfo = extractAuthorInfo(postElement);
  if (!authorInfo) {
    return; // No need to log every failure
  }
  
  let shouldFilter = false;
  let filterReason = '';
  let sourceName = authorInfo.name || 'Ismeretlen';
  
  // Check if author is in blacklist (exact match or fuzzy)
  const blacklistedSource = blacklist.find(
    source => {
      if (authorInfo.id && source.id === authorInfo.id) {
        return true;
      }
      if (authorInfo.name && source.name.toLowerCase() === authorInfo.name.toLowerCase()) {
        return true;
      }
      if (authorInfo.url && source.url && authorInfo.url.includes(source.url)) {
        return true;
      }
      // Fuzzy name matching for variations
      if (authorInfo.name && source.name && 
          authorInfo.name.toLowerCase().includes(source.name.toLowerCase())) {
        return true;
      }
      return false;
    }
  );
  
  if (blacklistedSource) {
    shouldFilter = true;
    filterReason = blacklistedSource.reason;
    sourceName = blacklistedSource.name;
    console.log('🚫 BLACKLISTED SOURCE DETECTED:', sourceName, filterReason);
  } else {
    console.log('✅ Source not in blacklist, checking content analysis...');
    // Sophisticated content analysis
    const contentAnalysis = analyzePostContent(postElement);
    if (contentAnalysis.score >= 5) {
      shouldFilter = true;
      filterReason = `propaganda tartalom (${contentAnalysis.reasons.join(', ')})`;
    }
  }
  
  if (shouldFilter) {
    filteredPostCount++;
    
    if (settings.facebookAction === 'blurAndWarn') {
      // Apply blur effect
      postElement.classList.add('hirszuro-blurred');
      
      // Add warning overlay
      const overlay = createWarningOverlay(
        postElement, 
        sourceName, 
        filterReason
      );
      postElement.appendChild(overlay);
    } else if (settings.facebookAction === 'autoHide') {
      // Hide the post
      (postElement as HTMLElement).style.display = 'none';
      hiddenPostCount++;
      updateHiddenPostsNotification();
    }
    
    // Track filtered post count
    chrome.runtime.sendMessage({ 
      type: 'FACEBOOK_POST_FILTERED',
      author: sourceName,
      reason: filterReason
    });
  } else if (authorInfo.id || authorInfo.name) {
    // Check if it's a trusted source
    const trustedSource = trustedPages.find(
      source => {
        if (authorInfo.id && source.id === authorInfo.id) return true;
        if (authorInfo.name && source.name.toLowerCase() === authorInfo.name.toLowerCase()) return true;
        return false;
      }
    );
    
    if (trustedSource) {
      // Add trust badge with better positioning
      addTrustBadge(postElement, trustedSource.name);
    }
  }
}

// Debounced processing function for better performance
function processPostsQueue() {
  if (processingTimeout) {
    clearTimeout(processingTimeout);
  }
  
  processingTimeout = window.setTimeout(() => {
    const uniquePosts = [...new Set(processingQueue)];
    const validPosts = uniquePosts.filter(isValidPost);
    
    if (validPosts.length > 0) {
      console.log(`📊 Processing ${validPosts.length} posts`);
      validPosts.forEach(post => processPost(post));
    }
    
    processingQueue = [];
    processingTimeout = null;
  }, 200); // Increased debounce for better content loading
}

function addToProcessingQueue(posts: Element[]) {
  // Filter posts immediately to avoid processing invalid ones
  const newPosts = posts.filter(post => {
    const alreadyQueued = processingQueue.includes(post);
    const alreadyProcessed = post.getAttribute('data-hirszuro-processed');
    return !alreadyQueued && !alreadyProcessed;
  });
  
  if (newPosts.length > 0) {
    processingQueue.push(...newPosts);
    processPostsQueue();
  }
}

// Enhanced MutationObserver with performance optimizations
function observeFeed() {
  const observer = new MutationObserver((mutations) => {
    const postsToProcess: Element[] = [];
    
    mutations.forEach((mutation) => {
      // Only process if significant changes occurred
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            // Use comprehensive selector list
            const posts = Array.from(node.querySelectorAll(POST_SELECTORS.join(', ')));
            postsToProcess.push(...posts);
            
            // Check if the node itself is a post
            if (POST_SELECTORS.some(selector => node.matches(selector))) {
              postsToProcess.push(node);
            }
          }
        });
      }
    });
    
    if (postsToProcess.length > 0) {
      addToProcessingQueue(postsToProcess);
    }
  });
  
  // Start observing the main feed container with throttling
  const feedContainer = document.querySelector('[role="main"], [role="feed"], #content, #pagelet_home_stream');
  if (feedContainer) {
    observer.observe(feedContainer, {
      childList: true,
      subtree: true,
      // Optimize for performance
      attributes: false,
      characterData: false
    });
    
    // Process existing posts
    const existingPosts = Array.from(feedContainer.querySelectorAll(POST_SELECTORS.join(', ')));
    addToProcessingQueue(existingPosts);
  } else {
    // Retry after a delay if container not found
    setTimeout(observeFeed, 1000);
  }
}

// Keyboard shortcuts for enhanced accessibility
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only activate when an overlay is visible
    const activeOverlay = document.querySelector('.hirszuro-overlay:not([style*="display: none"])');
    if (!activeOverlay) return;
    
    const postElement = activeOverlay.closest('[data-hirszuro-processed]');
    if (!postElement) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ': // Space
        e.preventDefault();
        // Show content (equivalent to clicking "Mutasd a tartalmat!")
        postElement.classList.remove('hirszuro-blurred');
        activeOverlay.remove();
        break;
        
      case 'h':
      case 'H':
        e.preventDefault();
        // Hide source (equivalent to clicking "Forrás elrejtése")
        const hideBtn = activeOverlay.querySelector('.hirszuro-btn-hide') as HTMLElement;
        hideBtn?.click();
        break;
        
      case 'Escape':
        e.preventDefault();
        // Show content and remove overlay
        postElement.classList.remove('hirszuro-blurred');
        activeOverlay.remove();
        break;
        
      case '?':
        e.preventDefault();
        // Show help (equivalent to clicking "Miért látom ezt?")
        const whyBtn = activeOverlay.querySelector('.hirszuro-btn-why') as HTMLElement;
        whyBtn?.click();
        break;
    }
  });
}

// Periodic sweep to catch posts that might have been missed
function startPeriodicSweep() {
  setInterval(() => {
    if (!settings?.isFacebookCleaningEnabled) return;
    
    const feedContainer = document.querySelector('[role="main"], [role="feed"], #content, #pagelet_home_stream');
    if (!feedContainer) return;
    
    const unprocessedPosts = Array.from(feedContainer.querySelectorAll(POST_SELECTORS.join(', ')))
      .filter(post => !post.getAttribute('data-hirszuro-processed') && isValidPost(post));
    
    if (unprocessedPosts.length > 0) {
      addToProcessingQueue(unprocessedPosts);
    }
  }, 3000); // Check every 3 seconds
}

// Enhanced initialization with retry logic
function initializeFacebookBlocker() {
  let initAttempts = 0;
  const maxAttempts = 10;
  
  function attemptInit() {
    initAttempts++;
    
    // Check if we're actually on Facebook
    if (!window.location.hostname.includes('facebook.com')) {
      return;
    }
    
    // Wait for Facebook to load its main content
    const feedContainer = document.querySelector('[role="main"], [role="feed"], #content, #pagelet_home_stream');
    
    if (feedContainer || initAttempts >= maxAttempts) {
      observeFeed();
      setupKeyboardShortcuts();
      startPeriodicSweep(); // Start the periodic sweep
      
      // Add accessibility info to the page
      if (!document.querySelector('.hirszuro-accessibility-info')) {
        const accessibilityInfo = document.createElement('div');
        accessibilityInfo.className = 'hirszuro-accessibility-info';
        accessibilityInfo.innerHTML = `
          <div title="NERtelenítő gyorsbillentyűk: Enter/Space - tartalom megjelenítése, H - forrás elrejtése, Escape - bezárás, ? - súgó">
            ⌨️ Gyorsbillentyűk aktívak
          </div>
        `;
        document.body.appendChild(accessibilityInfo);
      }
    } else {
      setTimeout(attemptInit, 1000);
    }
  }
  
  attemptInit();
}

// Initialize with enhanced startup logic
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFacebookBlocker);
} else {
  initializeFacebookBlocker();
}

// Handle Facebook's dynamic navigation (single-page app)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // Reinitialize when URL changes (Facebook navigation)
    setTimeout(initializeFacebookBlocker, 1000);
  }
}, 1000);