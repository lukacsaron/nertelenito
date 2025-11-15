// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const hostname = urlParams.get('hostname');
const fromSite = urlParams.get('siteName') || hostname;

// Get random independent site for redirect
const independentSites = [
  { url: "https://telex.hu", name: "Telex" },
  { url: "https://444.hu", name: "444" },
  { url: "https://24.hu", name: "24.hu" },
  { url: "https://hvg.hu", name: "HVG" },
  { url: "https://index.hu", name: "Index" },
  { url: "https://nepszava.hu", name: "Népszava" },
  { url: "https://merce.hu", name: "Mérce" },
  { url: "https://atlatszo.hu", name: "Átlátszó" },
  { url: "https://direkt36.hu", name: "Direkt36" },
  { url: "https://azonnali.hu", name: "Azonnali" },
  { url: "https://rtl.hu/hirek", name: "RTL Hírek" },
  { url: "https://szabadeuropa.hu", name: "Szabad Európa" }
];

const randomIndex = Math.floor(Math.random() * independentSites.length);
const targetSite = independentSites[randomIndex];
const toSite = targetSite.name;
const targetUrl = targetSite.url;

// Set site names in the UI
document.getElementById('from-site').textContent = fromSite;
document.getElementById('to-site').textContent = toSite;
document.getElementById('whitelist-text').textContent = fromSite;

// Countdown timer
let countdown = 3;
let countdownInterval;

function updateCountdown() {
  document.getElementById('countdown').textContent = countdown;
  countdown--;
  
  if (countdown < 0) {
    clearInterval(countdownInterval);
    proceedWithRedirect();
  }
}

// Start countdown
countdownInterval = setInterval(updateCountdown, 1000);

// Proceed with redirect
function proceedWithRedirect() {
  clearInterval(countdownInterval);
  
  // Check if whitelist is checked
  const whitelistChecked = document.getElementById('whitelist-checkbox').checked;
  if (whitelistChecked) {
    chrome.runtime.sendMessage({
      type: 'WHITELIST_SITE',
      hostname: hostname
    });
  }
  
  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'PROCEED_REDIRECT',
    url: targetUrl,
    from: fromSite,
    to: toSite
  });
}

// Cancel redirect and stay on original site
function cancelRedirect() {
  clearInterval(countdownInterval);

  // Check if whitelist is checked
  const shouldWhitelist = document.getElementById('whitelist-checkbox').checked;

  // Send message to background script with whitelist preference
  // Background will handle: whitelist -> update rules -> navigate
  chrome.runtime.sendMessage({
    type: 'CANCEL_REDIRECT',
    hostname: hostname,
    shouldWhitelist: shouldWhitelist
  });
}

// Event listeners
document.getElementById('proceed-btn').addEventListener('click', proceedWithRedirect);
document.getElementById('stay-btn').addEventListener('click', cancelRedirect);

// Stop countdown on any user interaction
document.addEventListener('click', () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    document.querySelector('.countdown').style.display = 'none';
  }
});