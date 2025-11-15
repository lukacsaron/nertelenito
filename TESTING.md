# NERtelenítő Testing Guide

## Installation Instructions

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension should now be installed and visible in your extensions

## Testing Checklist

### Site Redirection
- [ ] Visit `origo.hu` - should show redirect notification
- [ ] Visit `888.hu` - should show redirect notification
- [ ] Visit `ripost.hu` - should show redirect notification
- [ ] Test "Proceed to independent site" button
- [ ] Test "Stay on original site" button
- [ ] Test whitelist checkbox functionality

### Extension Popup
- [ ] Click extension icon in toolbar
- [ ] Check that toggles work (Átirányítás Aktív / Facebook Tisztítás Aktív)
- [ ] Verify statistics show after testing redirects
- [ ] Test "Beállítások és Listák Szerkesztése" button

### Options Page
- [ ] Open options page from popup
- [ ] Test toggle switches
- [ ] Test adding custom propaganda sites
- [ ] Test adding custom independent sites
- [ ] Test adding Facebook sources to blacklist
- [ ] Test removing user-added items
- [ ] Test export/import settings

### Facebook Integration
- [ ] Open Facebook.com while extension is enabled
- [ ] Look for propaganda posts in feed (if any)
- [ ] Check if independent media posts show trust badges
- [ ] Test blur/warning overlay functionality
- [ ] Test "Hide this source" functionality

## Known Limitations

1. **Icons**: Placeholder icons are used. Real PNG icons need to be created.
2. **Facebook ID Matching**: The Facebook IDs in the blacklist are placeholder IDs. Real Facebook page/user IDs need to be researched and added.
3. **Dynamic Settings**: Some settings changes require extension reload.

## Troubleshooting

- If extension doesn't load: Check console for errors in `chrome://extensions/`
- If redirects don't work: Check that host permissions are granted
- If Facebook filtering doesn't work: Check content script console on Facebook pages

## Ready for Production

The extension is functionally complete and ready for:
1. Real icon creation (using create-icons.html)
2. Real Facebook page ID research
3. User testing and feedback
4. Chrome Web Store submission