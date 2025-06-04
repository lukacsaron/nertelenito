Okay, Claude Code, let's get to work on "HírSzűrő"! This is a fantastic concept with real potential to empower users. Here's a detailed technical specification, focusing on modern UX, usability, and engaging copy, designed for you to understand and build upon.

---

## 🧾 Technical Specification: "HírSzűrő" Chrome Extension for Claude Code

---

**Project Codename:** HírSzűrő (NewsFilter)
**Version:** 1.0 (MVP Focus)
**AI Developer:** Claude Code
**Objective:** To craft a Chrome extension that intelligently guides Hungarian users towards a more diverse and independent media landscape, while providing clear context and control.

---

### 1. 🧠 Core Philosophy & Objective

HírSzűrő aims to be a digital companion for Hungarian internet users, empowering them to consciously navigate the media landscape. It's not about censorship, but about **awareness, choice, and fostering media literacy.**

**The extension will achieve this by:**

1.  **Gentle Redirection:** Nudging users away from state-aligned media towards verified independent sources when a direct visit is attempted.
2.  **Facebook Feed Awareness:** Identifying and subtly highlighting or optionally concealing posts from known propagandist sources within the Facebook feed.
3.  **Context & Transparency:** Clearly communicating *why* an action is taken, offering users control and insight.
4.  **Promoting Diversity:** Encouraging the consumption of a wider range of journalistic voices.

**Tone of Voice (App-wide):**
*   **Empathetic & Supportive:** "We're here to help you see the bigger picture."
*   **Clear & Direct:** No jargon, straightforward explanations.
*   **Respectful:** Acknowledges user autonomy.
*   **Slightly Witty/Engaging (Hungarian context):** Where appropriate, using relatable Hungarian expressions or a light touch. For example, instead of just "Blocked," maybe "Kiszűrve, a nyugalmadért!" (Filtered out, for your peace of mind!).

---

### 2. 👤 Target Audience Persona

*   **"Eszter, the Engaged Citizen" (35, Budapest, Marketing Manager):**
    *   Politically aware, uses Facebook daily, reads news from various sources but finds it exhausting to constantly vet them.
    *   Worried about algorithmic bias and the prevalence of propaganda.
    *   Tech-savvy enough to install and configure an extension but wants it to "just work" with minimal fuss.
    *   Values transparency and control. Wants to understand *why* the extension does what it does.
    *   Appreciates clean, modern design and clear, non-alarmist communication.

---

### 3. ⚙️ Core Features (MVP Focus, with UX & Copywriting Notes)

---

#### ✅ 3.1 Site Redirection ("Útvonaltervező" - Route Planner)

**Goal:** When a user navigates to a predefined propaganda site, they are transparently redirected to a randomly selected independent news site, or potentially a relevant article.

**User Experience & Copywriting:**

*   **Notification First, Then Redirect:** Instead of an instant, jarring redirect, show a sleek, non-modal overlay for 2-3 seconds *before* the redirect occurs.
    *   **Headline:** "Pillanat! Egy lépéssel a tudatos médiafogyasztás felé." (Hold on! One step towards conscious media consumption.)
    *   **Body:** "Az általad keresett oldal ([propagandaSite.name]) gyakran egyoldalú tájékoztatást nyújt. Átirányítunk egy független forrásra: [independentSite.name]. Vagy maradhatsz itt: [Eredeti oldal megnyitása]" (The site you're looking for ([propagandaSite.name]) often provides biased information. We're redirecting you to an independent source: [independentSite.name]. Or you can stay here: [Open original site])
    *   **Button 1 (Default Action):** "Oké, irány a független hír!" (Okay, take me to the independent news!) - Triggers redirect.
    *   **Button 2 (Override):** "Maradok az eredeti oldalon" (I'll stay on the original site) - Cancels redirect for this instance.
    *   **Checkbox (Optional):** "[PropagandaSite.name] átirányításának szüneteltetése erre a munkamenetre" (Pause redirection for [PropagandaSite.name] for this session)
*   **Visuals:** The overlay should be clean, perhaps with the HírSzűrő logo subtly present.

**Technical Implementation:**

1.  **Monitoring:**
    *   Use `chrome.webRequest.onBeforeRequest` to intercept navigation requests to `main_frame` types.
    *   Listener filters for URLs matching the `propagandaSites` list.
2.  **URL Matching:**
    *   Match primarily against hostnames. Consider `*.domain.tld` to catch subdomains.
    *   `propagandaSites`: Array of objects, e.g., `{ "hostname": "origo.hu", "name": "Origo" }`.
3.  **Redirection Logic (MVP - Random):**
    *   If a match occurs and redirection is enabled for this site:
        *   Randomly select a URL from the `independentSites` list (e.g., `{ "url": "https://telex.hu", "name": "Telex" }`).
        *   The `onBeforeRequest` callback will return `{ redirectUrl: chosenIndependentSiteUrl }`.
4.  **Configuration:**
    *   User can disable redirection globally (see Popup UI).
    *   User can temporarily or permanently whitelist a specific propaganda site from redirection (see Options UI and overlay interaction).
    *   Store user whitelists in `chrome.storage.local`.
5.  **Default Lists (Bundled with extension, updatable):**
    ```json
    "propagandaSites": [
      { "hostname": "origo.hu", "name": "Origo" },
      { "hostname": "888.hu", "name": "888" },
      // ... more
    ],
    "independentSites": [
      { "url": "https://telex.hu", "name": "Telex" },
      { "url": "https://444.hu", "name": "444" },
      // ... more
    ]
    ```

---

#### ✅ 3.2 Facebook Feed Cleaner ("Hírfolyam Tisztító")

**Goal:** Identify posts from known government-linked/propaganda figures and pages within the Facebook feed and allow users to either see a warning or have them hidden.

**User Experience & Copywriting:**

*   **Default Action: Blur + Warn:**
    *   The identified post content is blurred (CSS `filter: blur(8px);`).
    *   A clear, friendly overlay appears on top of the blurred post.
    *   **Headline:** "Hoppá! Egy megfontolandó forrás." (Oops! A source worth considering carefully.)
    *   **Body:** "Ezt a bejegyzést [Forrás Neve] tette közzé, aki/ami ismert(en) [rövid, semleges indoklás, pl. 'gyakran kormányzati narratívákat közvetít' / 'egyoldalú tájékoztatásáról'].
    *   **Button 1:** "Mutasd a tartalmat!" (Show me the content!) - Removes blur and warning.
    *   **Button 2:** "Forrás elrejtése a jövőben" (Hide this source in the future) - Adds source to a user's personal blocklist and hides post.
    *   **Button 3 (Optional):** "Miért látom ezt?" (Why am I seeing this?) - Links to a brief explanation in options or a tooltip.
*   **Optional Action (User Setting): Auto-Hide:** If enabled, posts are hidden with `display: none;` and a small, dismissible notification might appear at the top/bottom of the feed: "HírSzűrő X bejegyzést rejtett el a hírfolyamodból. [Részletek]" (HírSzűrő hid X posts from your feed. [Details])
*   **"Trusted Source" Badge (Phase 2, but consider for MVP if simple):**
    *   A small, unobtrusive badge (e.g., a green checkmark or a "Független" label) on posts from known independent media pages.
    *   Copy: "Ellenőrzötten független" (Verified Independent)

**Technical Implementation:**

1.  **Content Script Injection:**
    *   Inject `contentScript.js` into `https://*.facebook.com/*`.
2.  **DOM Monitoring & Post Identification:**
    *   Use `MutationObserver` to efficiently detect new posts added to the feed (Facebook's DOM structure is complex and changes, target identifiable post containers like `div[role="article"]` or elements with stable `data-testid` attributes if available).
    *   For each post, extract the author's name and profile/page link. The link usually contains the unique Page ID or User ID.
3.  **Blacklist Matching:**
    *   Maintain a `facebookBlacklist` of Page/User IDs.
    *   `facebookBlacklist`: Array of objects, e.g., `{ "id": "100044249...", "name": "Kocsis Máté", "reason": "kormányzati politikus" }`.
    *   Compare extracted ID with the blacklist.
4.  **Applying Action:**
    *   If a match is found:
        *   **Blur + Warn:** Apply CSS classes to blur content. Inject the warning overlay HTML into the post. Event listeners on buttons.
        *   **Auto-Hide:** Set `element.style.display = 'none';`.
5.  **"Trusted Source" Badge Logic:**
    *   Similar to blacklist, but use an `independentFacebookPages` list of IDs. If author matches, inject the badge HTML.
6.  **Performance:**
    *   DOM scanning and manipulation must be optimized. Debounce or throttle operations if necessary.
    *   Be mindful of Facebook's own scripts and avoid interference.

---

#### ✅ 3.3 User Controls (Popup UI - "Vezérlőpult")

**Goal:** Provide a simple, accessible interface for users to control the extension's core functionalities.

**User Experience & Copywriting:**

*   **Design:** Clean, modern, minimal. Use toggles that clearly indicate on/off states.
*   **Header:** "HírSzűrő - A Te Médiakompaszod" (HírSzűrő - Your Media Compass)
*   **Main Toggles:**
    *   `[Toggle Switch] Átirányítás Aktív` (Redirection Active)
        *   Sub-text: "Kormányközeli oldalak átirányítása független forrásokra." (Redirection of government-affiliated sites to independent sources.)
    *   `[Toggle Switch] Facebook Tisztítás Aktív` (Facebook Cleaning Active)
        *   Sub-text: "Propagandatartalmak szűrése a hírfolyamban." (Filtering propaganda content in the newsfeed.)
*   **Status/Quick Stats (Engaging & Informative):**
    *   "Ma átirányítva: X oldal" (Redirected today: X sites)
    *   "Ma kiszűrve Facebookon: Y bejegyzés" (Filtered on Facebook today: Y posts)
    *   "Legutóbbi művelet: origo.hu → telex.hu" (Last action: origo.hu → telex.hu)
*   **Buttons/Links:**
    *   `[Button] Beállítások és Listák Szerkesztése` (Settings & List Editing) → Opens `options.html`.
    *   `[Link] Visszajelzés küldése / Hiba jelentése` (Send feedback / Report an issue) → `mailto:` link or link to a GitHub issues page.
    *   `[Link] Hogyan működik?` (How does it work?) → Links to a simple explanation (could be part of options page).

**Technical Implementation:**

1.  **`popup.html`:** Structure the UI.
2.  **`popup.js`:**
    *   Load current settings from `chrome.storage.local`.
    *   Populate toggle states and stats.
    *   Add event listeners to toggles to save changes to `chrome.storage.local` and communicate changes to the background script if immediate action is needed (e.g., re-registering/unregistering webRequest listeners).
    *   Event listener for the "Settings" button to open `options.html` via `chrome.runtime.openOptionsPage()`.

---

#### ✅ 3.4 Contextual Warning Overlays (Already described in 3.1 & 3.2)

**General Principle:** The messages should be concise, informative, and provide clear calls to action. The design should be consistent across site redirects and Facebook warnings.

---

### 4. 🔧 Technical Architecture

*   **Extension Type:** Chrome Manifest V3
*   **Core Components:**
    1.  **`manifest.json`:**
        *   `manifest_version`: 3
        *   `name`: "HírSzűrő"
        *   `description`: "Tudatosabb médiafogyasztásért. Segít elkerülni a kormányzati befolyás alatt álló médiát és felismerni a propagandát." (For more conscious media consumption. Helps avoid government-influenced media and recognize propaganda.)
        *   `version`: (as per release)
        *   `permissions`: [`"webRequest"`, `"storage"`, `"scripting"`, `"declarativeNetRequest"` (Consider for future, potentially more performant redirects, but `webRequest` is fine for MVP if dynamic logic is needed for showing overlay *before* redirect)]
            *   *Note on `webRequest` vs `declarativeNetRequest`*: For MVP, `webRequest` with `onBeforeRequest` is simpler to implement the "notify then redirect" UX. `declarativeNetRequest` is more performant for pure blocking/redirecting but lacks the ability to run arbitrary JS before the redirect decision easily. Given the UX goal, `webRequest` is acceptable initially.
        *   `host_permissions`: Specific propaganda site URLs (`*://*.origo.hu/*`, etc.), `*://*.facebook.com/*`.
        *   `background`: ` { "service_worker": "background.js" } `
        *   `content_scripts`:
            ```json
            [
              {
                "matches": ["*://*.facebook.com/*"],
                "js": ["contentFacebook.js"],
                "css": ["contentFacebook.css"], // For styling overlays, blur
                "run_at": "document_idle"
              }
              // Potentially a content script for the pre-redirect notification if not handled by background + scripting.executeScript
            ]
            ```
        *   `action` (Popup):
            ```json
            {
              "default_popup": "popup.html",
              "default_icon": {
                "16": "icons/icon16.png",
                // ... other sizes
              }
            }
            ```
        *   `options_page`: `options.html`
        *   `icons`: Provide necessary icon sizes.
    2.  **`background.js` (Service Worker):**
        *   Manages `chrome.webRequest.onBeforeRequest` listener for site redirection.
        *   Handles initial storage setup (default blacklists/whitelists).
        *   Listens for messages from popup or content scripts if needed.
        *   Manages enabling/disabling redirection logic based on user settings.
    3.  **`contentFacebook.js`:**
        *   Runs on `facebook.com`.
        *   Uses `MutationObserver` to detect and process posts.
        *   Identifies blacklisted authors/pages.
        *   Applies blur/warning or hides posts.
        *   Injects "Trusted Source" badges.
    4.  **`popup.html` & `popup.js`:**
        *   UI for quick toggles and status.
        *   Reads/writes settings from/to `chrome.storage.local`.
    5.  **`options.html` & `options.js`:**
        *   **Detailed Settings:**
            *   Toggle for "Facebook Auto-Hide" vs "Blur+Warn".
            *   Button to "Reset all settings to default".
        *   **List Management:**
            *   View/Add/Remove sites from `propagandaSites` (user list).
            *   View/Add/Remove sites from `independentSites` (user list for redirection targets).
            *   View/Add/Remove Facebook Page/User IDs from `facebookBlacklist` (user list).
            *   View/Manage sites user has whitelisted from redirection.
        *   **Copywriting for Options:**
            *   "Személyre szabhatod a HírSzűrő működését." (Customize HírSzűrő's behavior.)
            *   Sections like: "Átirányítási Beállítások" (Redirection Settings), "Facebook Szűrési Beállítások" (Facebook Filtering Settings), "Saját Listáim" (My Lists).
            *   Clear instructions for adding IDs/URLs.

---

### 5. 📦 Storage (`chrome.storage.local`)

*   **`settings` (Object):**
    *   `isRedirectEnabled`: boolean
    *   `isFacebookCleaningEnabled`: boolean
    *   `facebookAction`: "blurAndWarn" (default) or "autoHide"
*   **`userPropagandaSites` (Array of Strings/Objects):** User-added sites for redirection.
*   **`userIndependentSites` (Array of Strings/Objects):** User-added sites as redirection targets.
*   **`userFacebookBlacklist` (Array of Strings/Objects):** User-added Facebook IDs to filter.
*   **`redirectWhitelistedSites` (Array of Strings):** Hostnames of propaganda sites user chose not to redirect from.
*   **`redirectionLog` (Array of Objects, optional, capped size):** `{ timestamp, from, to }` for popup status.
*   **Default lists will be bundled.** The user's lists augment or override defaults where appropriate (e.g., user can't remove a default propaganda site but can whitelist it from redirection). For MVP, user additions are separate.

---

### 6. 🔐 Privacy & Ethics

*   **Strictly Local:** NO user data, browsing history, or blacklists are sent to ANY external server. All processing and storage are client-side.
*   **Transparency:** Open-source is highly encouraged. Clear explanations in-app about *what* it does and *why*.
*   **User Control:** Users can disable any feature, customize lists, and easily understand the extension's impact.
*   **No Moralizing:** The extension provides information and tools, not judgments. The copy should reflect this.

---

### 7. 🛠 Roadmap (MVP First)

| Feature                                      | Priority | Phase   | Notes                                                                 |
| :------------------------------------------- | :------- | :------ | :-------------------------------------------------------------------- |
| **Site Redirection (Random)**                | **High** | **MVP** | Core functionality. Pre-redirect notification UX.                     |
| **Facebook Post Hiding/Warning (Blur+Warn)** | **High** | **MVP** | Core functionality. `MutationObserver` for efficiency.                |
| **Popup UI with Toggles & Basic Stats**      | **High** | **MVP** | Essential user control.                                               |
| **Options Page: List Management & Settings** | **Medium** | **MVP** | Allow user customization of lists & FB behavior.                    |
| Manual Site Override (from notification)     | Medium   | Phase 2 | "Don't redirect from [X] again" option in redirect notification.    |
| "Show Anyway" on FB posts                    | Medium   | MVP     | Part of the "Blur+Warn" UX.                                           |
| "Trusted Source" Badge on Facebook           | Medium   | Phase 2 | Enhances positive reinforcement. (Consider for MVP if simple)       |
| Topic-Aware Redirects                        | Low      | Phase 3 | Advanced: Attempt to match article topic. Complex.                  |
| Onboarding / First-Run Experience            | Medium   | Phase 2 | Introduce features on first install.                                  |
| Default List Auto-Update (User Opt-in)       | Low      | Phase 3 | Fetch updated lists from a trusted source (e.g., GitHub repo).      |
| Daily/Weekly Summary of Actions              | Low      | Phase 3 | More detailed stats for engaged users.                              |

---

### 8. 🧪 Testing & QA Strategy

*   **Browsers:** Latest Chrome, Edge (Chromium-based).
*   **Real-World Testing:**
    *   Navigate to a comprehensive list of Hungarian propaganda and independent sites.
    *   Extensively test on `facebook.com` with various account types, feed layouts, and post types (text, image, video, shared links). Facebook's DOM is a moving target.
    *   Test with Hungarian language settings in the browser and on Facebook.
*   **Specific Checks:**
    *   Redirection logic (including whitelisting).
    *   Facebook DOM element selection robustness.
    *   Performance impact (CPU/memory usage, especially on Facebook).
    *   `chrome.storage` persistence and correctness.
    *   UI responsiveness and clarity of popup and options.
*   **Debug Mode:**
    *   Implement a `DEBUG_MODE` flag (e.g., set via console `chrome.storage.local.set({debug: true})`) that:
        *   Logs detailed actions to the console.
        *   On Facebook, instead of hiding/blurring, might outline identified posts in a bright color and log why they were matched.
*   **User Feedback Loop:** Easy way for beta testers to report missed sites or false positives.

---

### 9. 📛 Branding & Visuals

*   **Name:** *HírSzűrő* is excellent – concise, descriptive, Hungarian.
*   **Tagline Ideas:**
    *   "HírSzűrő: A Te Médiakompaszod." (Your Media Compass)
    *   "HírSzűrő: Láss tisztábban a hírek világában." (See more clearly in the world of news.)
    *   "HírSzűrő: Független hangok, egy kattintásra." (Independent voices, one click away.)
*   **Icons & Visual Style:**
    *   **Logo:** Clean, modern, minimalist. Could be a stylized filter (szűrő), a compass, an eye with a subtle shield, or an abstract representation of information flow.
    *   **Color Palette:**
        *   Primary: A trustworthy blue (e.g., `#3B82F6`) or a calm teal (e.g., `#14B8A6`).
        *   Accents: A hopeful green (e.g., `#22C55E`) for positive actions/badges, or a neutral grey.
        *   Warnings: A muted orange/yellow, not aggressive red.
    *   **Typography:** Readable, modern sans-serif font.

---

### 10. 🚀 Onboarding & First-Run Experience (Consider for Phase 1.5 / 2)

*   **Welcome Page:** On first install, open a new tab with a brief welcome.
    *   "Üdvözöl a HírSzűrő!" (Welcome to HírSzűrő!)
    *   "Segítünk eligazodni a hírözönben, és felfedezni a független magyar sajtót." (We help you navigate the news flood and discover independent Hungarian press.)
    *   Briefly explain the two main features (redirection, FB filter).
    *   Link to Settings.
    *   "Jó böngészést kívánunk!" (Happy browsing!)
*   **Tooltips:** Maybe subtle tooltips on the popup toggles the first time the user opens it.

---

Claude Code, this specification should provide a solid foundation. The key is to start with a robust MVP focusing on the core redirection and Facebook filtering, then iterate. Prioritize clear communication with the user and maintain that empowering, supportive tone throughout the UX and copy. Készen állsz? (Are you ready?) Let's build something impactful!