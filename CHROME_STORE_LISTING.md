# Google Chrome Web Store Yayınlama Paketi

Bu dosya, eklentiyi Chrome Web Store Developer Console'a yüklerken ihtiyaç duyacağınız tüm hazır metinleri, gizlilik beyanlarını ve dosya yollarını içerir.

---

## 📦 1. Yüklenecek Zip Dosyası
- **Dosya:** `x-profile-picture-preview-v1.0.0.zip` (Proje ana dizininde hazırlandı)
- **Paket içeriği:** `manifest.json`, `content.js`, `index.html`, `assets/`, `icons/` (Manifest V3 uyumlu, temiz ve optimize)

---

## 🎨 2. Görsel Varlıklar (`store_assets/` klasöründe hazır)
1. **Promo Banner (1280x800):** `store_assets/xppp-promo.jpg`
2. **Crop Modal Screenshot (1280x800):** `store_assets/xppp-ss.jpg`
3. **Store Icon (128x128):** `store_assets/icon_128.png`
4. **Small Promo Tile (440x280):** `store_assets/promo_tile_440x280.png`
5. **Ekran Görüntüleri:** `store_assets/screenshot_1_profile.png`, `store_assets/screenshot_2_modal.png`, `store_assets/screenshot_3_popup.png`

---

## 📝 3. Mağaza Bilgileri (Store Listing Details)

### Extension Name / Başlık:
```text
X Profile Picture Preview
```

### Short Description / Kısa Açıklama (132 karakter sınırı):
```text
Preview new profile pictures on X without changing your avatar or risking losing your Blue Checkmark.
```

### Detailed Description / Ayrıntılı Açıklama:
```markdown
Preview new profile pictures across X (formerly Twitter) before updating your real account.

On X, changing your profile picture triggers a verification review that temporarily removes your Blue Checkmark for days. If the new photo doesn't look right in circle crops or timeline feeds, you've already lost your verified badge.

X Profile Picture Preview lets you test and preview any photo locally across the actual X interface first—without changing your profile or triggering any review.

Key Features:
• Native Profile Button: Adds a convenient "Profile Picture Preview" button right next to "Edit profile" on your profile page.
• Crop, Zoom & Pan: Easily adjust, reposition, and zoom your photo with a circular guide.
• Multi-Scale Preview: Check how your avatar looks across the Profile Header, Timeline Tweets, and Reply badges before applying.
• Live Site-Wide Preview: Replaces your profile picture locally across x.com in real time as you browse.
• One-Click Reset: Revert to your original profile picture anytime with a single click.

Privacy & Security:
• 100% Client-Side: All image adjustments and previews run locally in your browser. Nothing is uploaded to any server.
• Zero Data Collection: No tracking, no analytics, and no personal data stored.

Created by @sezeriltekin
```

### Category / Kategori:
- **Primary Category:** `Social & Communication` (Sosyal & İletişim)
- **Secondary Category:** `Photos` veya `Productivity`

---

## 🛡️ 4. Gizlilik ve İzin Beyanları (Privacy Practices)

### Privacy Policy URL (Gizlilik Politikası Linki):
```text
https://github.com/iltekin/xppp/blob/main/PRIVACY_POLICY.md
```

### Single Purpose Description (Tek Amaç İlkesi):
```text
To allow verified and standard users to crop, position, and preview a new profile picture locally across X (Twitter) interface contexts without risking losing their Blue Checkmark.
```

### Permission Justification (İzin Gerekçesi):
- **`storage` izni gerekçesi:**
```text
Used exclusively to save the user's active preview image data locally in chrome.storage.local so that the preview remains active while navigating across pages on x.com. No data is ever collected or sent to external servers.
```

### Host Permissions / Content Scripts:
- **Matches:** `https://x.com/*`, `https://twitter.com/*`
- **Gerekçe:**
```text
The extension injects a native preview button into the user's X profile header and previews the avatar locally across the X interface.
```

### Data Usage Disclosures (Veri Kullanımı Kutucukları):
- **Do you collect personal data?** ➔ **NO** (Hayır)
- **Account info, credentials, financial, health, location?** ➔ Hepsi **NO** (İşaretlenmeyecek)
- **Certifications:**
  - [x] *"I certify that this extension complies with the Developer Program Policies."* (İşaretleyin)
  - [x] *"The extension does not sell user data to third parties."* (İşaretleyin)
  - [x] *"The extension does not use or transfer user data for purposes unrelated to the item's core functionality."* (İşaretleyin)
  - [x] *"The extension does not use or transfer user data to determine creditworthiness or for lending purposes."* (İşaretleyin)

---

## 🚀 5. Adım Adım Yükleme Rehberi

1. Tarayıcınızda [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) sayfasına gidin.
2. Sağ üstteki **"New Item"** (Yeni Öğe) butonuna tıklayın.
3. Proje dizininde hazır bulunan `x-profile-picture-preview-v1.0.0.zip` dosyasını sürükleyip bırakın (veya Dosya Seç ile yükleyin).
4. Sol menüdeki **"Store listing"** sekmesine gelin:
   - Yukarıdaki **Description** metnini yapıştırın.
   - Kategori olarak **"Social & Communication"** seçin.
   - `store_assets/` klasöründeki **Screenshot 1** ve **Screenshot 2** görsellerini yükleyin.
   - **Small promo tile (440x280)** görselini yükleyin.
5. Sol menüdeki **"Privacy"** sekmesine gelin:
   - Single purpose ve permission justification metinlerini yukarıdan kopyalayıp yapıştırın.
   - Veri toplama onay kutularını işaretleyin (veri toplanmıyor).
6. Sağ üstteki **"Submit for review"** (İncelemeye Gönder) butonuna tıklayın!
