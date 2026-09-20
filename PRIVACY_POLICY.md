# Privacy Policy for X Profile Picture Preview

**Last updated:** September 20, 2026

This Privacy Policy explains how **X Profile Picture Preview** ("the Extension", "we", "us", or "our"), created by Sezer İltekin (@sezeriltekin), handles your data.

## 1. Overview & Single Purpose
The Extension is designed solely to allow users to crop, position, and preview candidate profile pictures locally within the X (Twitter) web interface without modifying their public profile or triggering account verification reviews.

## 2. Information We Do NOT Collect
We believe in absolute privacy. The Extension:
- **Does NOT collect** any personally identifiable information (PII) such as your name, email, passwords, IP address, or location.
- **Does NOT collect or track** your browsing history, posts, tweets, bookmarks, direct messages, or contacts.
- **Does NOT upload or transmit** your images, photos, or crops to any remote server or external service.

## 3. How Your Data Is Handled (100% Client-Side)
- **Local Image Processing:** All image cropping, panning, zooming, and rendering take place strictly inside your browser via local HTML5 Canvas and client-side JavaScript.
- **Local Storage (`chrome.storage.local`):** When you choose to apply a preview, the temporary preview image data URL is stored locally on your own device using Chrome's built-in `storage.local` API. This allows the preview to persist across tabs and page reloads on x.com.
- **No External Communication:** The Extension makes zero network requests to external APIs or analytics providers.

## 4. Data Retention & Removal
Your local preview data remains exclusively in your browser until you choose to remove it:
- You can click **"Remove Preview"** inside the extension modal or popup at any time to immediately delete all stored preview data.
- Uninstalling the Extension automatically removes all associated local data.

## 5. Third-Party Sharing
We do not sell, rent, trade, or transfer any user data to third parties under any circumstances.

## 6. Permissions Justification
- **`storage`**: Used exclusively to save your active preview data locally in your browser so it persists while navigating between pages on x.com.
- **Host Permissions (`x.com/*`, `twitter.com/*`)**: Used exclusively to inject the native "Profile Picture Preview" button on your profile header and preview the avatar across your local browsing session.

## 7. Changes to This Policy
If we update this Privacy Policy, the revised version will be published at this repository URL with an updated revision date.

## 8. Contact & Developer Information
If you have any questions or concerns regarding this Privacy Policy, please contact:
- **Developer:** Sezer İltekin
- **X (Twitter):** [@sezeriltekin](https://x.com/sezeriltekin)
- **GitHub Repository:** [https://github.com/iltekin/xppp](https://github.com/iltekin/xppp)
