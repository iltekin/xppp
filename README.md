# X Profile Picture Preview

A Chrome Extension (Manifest V3) that allows users on X (formerly Twitter) to preview how a newly selected profile picture looks across realistic X interface contexts before saving it.

---

## The Problem

When a user changes their profile picture on X, X displays a warning that the blue verification checkmark may temporarily disappear while the new profile photo is reviewed.

Moreover, X does not provide a useful preview showing how the new photo actually appears across different platform contexts (such as small 40px avatars in feeds and replies, search cards, notifications, and the profile header) before committing the change.

## The Solution

**X Profile Picture Preview** solves this by providing a high-fidelity, multi-context sandbox preview on `x.com` before the user clicks save.

- **Non-Destructive & Safe**: Does **NOT** upload images anywhere and does **NOT** modify the user's X account.
- **100% Client-Side**: Operates entirely in-browser using standard Web APIs (`FileReader`, `Canvas`, and `URL.createObjectURL()`). Works offline.
- **Zero Style Interference**: Injected using Shadow DOM (`attachShadow({ mode: 'open' })`), completely isolating extension styles from X's stylesheet.

---

## Core Features & Preview Modes

A segmented navigation bar allows seamlessly switching between 5 realistic X contexts without closing the preview modal:

1. **Profile**
   - 134px circular avatar with border overlapping the profile header banner
   - Display name, @username, verification badge placeholder
   - Bio, website link, location, join date, following/follower counts
2. **Timeline / Post**
   - Realistic X post feed item
   - Small circular 40px avatar
   - Display name, @username, timestamp
   - Post content and interactive action metrics (Reply, Repost, Like, Views, Bookmark, Share)
3. **Reply**
   - Realistic X thread/conversation context
   - Parent post, vertical connector line, and user's reply with 40px avatar in exact position
4. **Search**
   - Realistic user search result card (44px avatar, bio, follower count, and Follow button)
5. **Notifications**
   - Realistic notifications stream (32px avatar showing likes and follow alerts)

### Additional Capabilities
- **Theme Matching**: Seamlessly switch between **Dark** (`#000000`), **Dim** (`#15202b`), and **Light** (`#ffffff`) appearances to see how contrast and colors hold up.
- **Automatic & Fallback Detection**: Automatically detects selected images from X's edit profile flow, and provides a floating **X Profile Picture Preview** button for manual selection anytime.
- **Profile Data Customizer**: Automatically extracts the active user's handle and display name, with options to tweak display name, handle, or toggle verification status.
- **Action Popup**: Click the extension icon in Chrome toolbar for a quick launcher and testing modal.

---

## Project Architecture

```
xppp/
├── manifest.json              # Source Manifest V3 file
├── public/
│   ├── manifest.json          # Chrome Extension Manifest V3 configuration
│   └── icons/                 # Extension icons (16px, 48px, 128px)
├── src/
│   ├── types/
│   │   └── index.ts           # Types for previews, user profile metadata, themes
│   ├── utils/
│   │   ├── xDomSelectors.ts   # Isolated X DOM selectors & profile scrapers
│   │   └── imageProcessor.ts  # Local FileReader & client-side image validation
│   ├── components/
│   │   ├── Icons.tsx          # Authentic X SVG icons (Verified badge, actions)
│   │   ├── ThemeSelector.tsx  # Dark / Dim / Light theme toggle
│   │   ├── FloatingButton.tsx # Non-intrusive fallback launcher
│   │   ├── Modal/
│   │   │   ├── OverlayModal.tsx # Base modal overlay container
│   │   │   └── SegmentedNav.tsx # Segmented tab bar
│   │   └── Previews/
│   │       ├── ProfilePreview.tsx      # Large avatar & profile header view
│   │       ├── PostPreview.tsx         # 40px avatar timeline post view
│   │       ├── ReplyPreview.tsx        # 40px avatar thread reply view
│   │       ├── SearchPreview.tsx       # User search result card view
│   │       └── NotificationPreview.tsx # 32px avatar notification alerts view
│   ├── content/
│   │   ├── detector.ts        # Observes X DOM and detects selected image files
│   │   ├── App.tsx            # Content script React state controller
│   │   └── index.tsx          # Content script entrypoint with Shadow DOM injection
│   ├── popup/
│   │   ├── Popup.tsx          # Extension toolbar popup interface
│   │   └── main.tsx           # Popup mount script
│   └── styles/
│       └── main.css           # Tailwind CSS directives and custom typography
├── vite.config.ts             # Vite popup build config
├── vite.content.config.ts     # Vite content script standalone IIFE bundle config
└── package.json
```

---

## Local Development & Build Instructions

### Prerequisites
- Node.js (v18 or higher recommended; v22 verified)
- npm (v9 or higher; v10 verified)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```
This runs TypeScript type checking (`tsc`) followed by Vite bundling, outputting the complete unpacked extension to the `dist/` directory:
- `dist/manifest.json`
- `dist/content.js` (Standalone IIFE with inline Shadow DOM styles)
- `dist/index.html` & `dist/assets/` (Popup interface)
- `dist/icons/` (Extension icons)

---

## Loading the Extension into Google Chrome

Follow these steps to load **X Profile Picture Preview** into Google Chrome:

1. Open Google Chrome.
2. In the address bar, navigate to `chrome://extensions`.
3. In the top right corner, toggle **Developer mode** ON.
4. Click the **Load unpacked** button in the top left corner.
5. Select the `dist` folder located inside this project directory:
   ```
   /Users/user/Developer/other/xppp/dist
   ```
6. Verify that **X Profile Picture Preview** appears in your list of extensions and is enabled.
7. Pin the extension to your toolbar if desired.

---

## How to Use

1. Navigate to [https://x.com](https://x.com).
2. Click on your profile or click **Edit profile**.
3. When you choose a new profile photo, **X Profile Picture Preview** detects the selected image and displays a **Preview in X Profile Picture Preview** button in the dialog.
4. Alternatively, click the floating **X Profile Picture Preview** pill in the bottom-right corner of `x.com` or click the extension icon in Chrome toolbar to select an image from your computer directly.
5. In the preview modal, switch between **Profile**, **Post**, **Reply**, **Search**, and **Notification** tabs to see how the photo looks at 134px, 44px, 40px, and 32px resolutions.
6. Test against **Dark**, **Dim**, and **Light** themes.
7. When finished, simply close the preview. **Nothing on your X account has changed.**

---

## Privacy & Security

- **Strictly Local**: Images are processed in-memory using browser APIs (`FileReader`, Data URLs, `createObjectURL`).
- **No External Communication**: Zero backend servers, zero analytics, zero external API calls.
- **Minimal Permissions**: The extension only runs on `https://x.com/*` and does not request broad permissions or access to sensitive data.
