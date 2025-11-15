# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NERtelenítő (NewsFilter) is a Chrome Extension (Manifest V3) that helps Hungarian users navigate to independent media sources and filter propaganda content. The extension operates with complete user privacy - all processing happens locally.

### Core Features
1. **Site Redirection**: Redirects visits from propaganda sites to independent news sources with user notification
2. **Facebook Feed Filtering**: Identifies and blurs/hides posts from known propaganda sources  
3. **User Controls**: Popup UI for quick toggles and options page for detailed customization

## Development Setup

### Prerequisites
- Node.js and npm for package management
- Chrome browser for testing
- Basic understanding of Chrome Extension Manifest V3 architecture

### Initial Setup Commands
```bash
# Initialize npm project
npm init -y

# Install development dependencies
npm install --save-dev webpack webpack-cli copy-webpack-plugin
npm install --save-dev @types/chrome typescript ts-loader
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev prettier eslint-config-prettier

# Create basic project structure
mkdir -p src/{background,content,popup,options,common} dist icons
```

### Build Commands
```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Lint TypeScript files
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Testing Commands
```bash
# Load unpacked extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the 'dist' folder

# Test site redirection
# Navigate to any site in propagandaSites list (e.g., origo.hu)

# Test Facebook filtering  
# Visit facebook.com and scroll through feed
```

## Architecture Overview

### Extension Components

1. **Service Worker (background.js)**
   - Handles site redirection via chrome.webRequest API
   - Manages storage initialization and defaults
   - Coordinates between popup and content scripts

2. **Content Scripts**
   - **contentFacebook.js**: Injected into Facebook pages
     - Uses MutationObserver to detect new posts
     - Identifies propaganda sources and applies blur/hide
     - Injects warning overlays and trust badges

3. **UI Components**
   - **popup.html/js**: Quick controls and status display
   - **options.html/js**: Detailed settings and list management

4. **Storage Structure (chrome.storage.local)**
   ```javascript
   {
     settings: {
       isRedirectEnabled: boolean,
       isFacebookCleaningEnabled: boolean,
       facebookAction: "blurAndWarn" | "autoHide"
     },
     userPropagandaSites: Array,
     userIndependentSites: Array,
     userFacebookBlacklist: Array,
     redirectWhitelistedSites: Array
   }
   ```

### Key Technical Considerations

1. **Facebook DOM Monitoring**
   - Facebook's DOM structure changes frequently
   - Target stable selectors like `div[role="article"]` or data-testid attributes
   - Optimize MutationObserver performance with debouncing

2. **Site Redirection Flow**
   - Use chrome.webRequest.onBeforeRequest for interception
   - Show notification overlay before redirect (2-3 seconds)
   - Allow user to cancel redirect or whitelist site

3. **Privacy First**
   - All processing happens locally
   - No external API calls or data collection
   - User has full control over all lists and settings

4. **Hungarian Language Support**
   - All UI text should be in Hungarian
   - Use empathetic, supportive tone
   - Examples: "Pillanat! Egy lépéssel a tudatos médiafogyasztás felé."

### Default Lists (Bundled)
- **propagandaSites**: origo.hu, 888.hu, etc.
- **independentSites**: telex.hu, 444.hu, etc.
- **facebookBlacklist**: Specific page/user IDs

## Common Development Tasks

### Adding a New Propaganda Site
1. Add to default list in src/common/defaultLists.ts
2. Test redirection behavior
3. Verify hostname matching (consider subdomains)

### Updating Facebook Selectors
1. Inspect current Facebook DOM structure
2. Update selectors in contentFacebook.js
3. Test with various post types (text, image, video, shared)

### Implementing New User Setting
1. Add to storage schema in background.js
2. Add UI control in options.html
3. Update relevant component to respect setting

## Important Notes

- This is a politically sensitive project - maintain neutrality in code
- Never add Claude Code as a coproducer in commit messages and also do not add the anthropic / claude email
- Focus on user empowerment and media literacy, not censorship
- All features must be transparent and user-controlled
- Performance is critical, especially for Facebook content script
- Test extensively with Hungarian language browser/Facebook settings