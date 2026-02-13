# 📤 Letter Upload & Excel Link Implementation

## ✅ What's New
Detailed implementation of the "Upload to Drive/Storage & Link in Excel" feature.

### 1. Direct Cloud Uploads
- **Previous:** Images were converted to massive text strings (Base64) and sent to Google Sheets (often failing due to size limits).
- **Now:** Incoming letters are uploaded **directly to Firebase Storage** (Cloud).
- **Result:** Faster uploads, support for larger files/PDFs, and permanent storage.

### 2. Sharable Links
- Once uploaded, we generate a public **download URL** (e.g., `https://firebasestorage.googleapis.com/...`).
- This URL is saved to the specific leave request.

### 3. Excel / Google Sheet Integration
- The system now sends this **URL link** to your Google Sheet instead of the raw image data.
- **In your Excel/Sheet:** You will see a clickable link in the `fileUrl` or `letterImage` column.
- **Benefit:** You can view the letter directly from the Excel sheet by clicking the link.

## 📁 Technical Changes

### Modified `src/api.js`
- **Replaced:** `compressImage()` (Base64 conversion)
- **With:** `uploadBytes()` (Firebase Storage Upload)
- **Updated:** Payload sent to Google Script now allows the script to simply record the URL.

```javascript
// New Workflow
1. User selects file
2. App uploads to Firebase Storage -> Gets URL
3. App saves Request Data + URL to Firestore
4. App sends Request Data + URL to Google Sheet
```

## ⚠️ Important Configuration
Ensure your Firebase Storage Rules allow uploads.
Go to **Firebase Console > Storage > Rules** and ensure they look like this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /leave_letters/{fileName} {
      allow read: if true;
      allow write: if request.auth != null; // Or 'if true' for testing
    }
  }
}
```
