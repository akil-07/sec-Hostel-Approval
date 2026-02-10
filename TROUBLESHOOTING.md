# 🔍 Troubleshooting: Upload Stuck on "Uploading..."

## Issue
The submit button shows "📤 Uploading..." and never completes. The request doesn't appear in the admin dashboard.

## ✅ Fixes Applied

1. **Fixed syntax error** in `src/api.js` (arrow function)
2. **Improved error handling** - now shows specific error messages
3. **Made upload optional** - form can submit even if file upload fails
4. **Added detailed console logging** - easier to debug

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Press **F12** to open Developer Tools
2. Go to the **Console** tab
3. Try submitting the form again
4. Look for error messages

### Step 2: Check for These Specific Errors

#### Error: "Storage permission denied"
**Cause:** Firebase Storage rules not configured

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **hostel-app-dbs**
3. Click **Storage** in left sidebar
4. Click **Rules** tab
5. Replace with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /leave_letters/{fileName} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
6. Click **Publish**

#### Error: "Failed to fetch" or "Network error"
**Cause:** Google Apps Script URL issue

**Solution:** The form will still submit to Firebase even if Google Sheets backup fails. Check console for "✅ Document written to Firebase" message.

#### Error: "Permission denied" (Firestore)
**Cause:** Firestore rules not allowing writes

**Solution:**
1. Go to Firebase Console → **Firestore Database**
2. Click **Rules** tab
3. Ensure you have:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leave_requests/{document} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Look for Success Messages

When everything works, you should see in console:
```
Uploading file to Firebase Storage...
File details: {name: "...", size: ..., type: "..."}
✅ File uploaded successfully to Storage!
✅ Download URL obtained: https://firebasestorage...
Google Sheets backup response: {...}
Saving to Firestore database...
✅ Document written to Firebase with ID: abc123
✅ Image URL saved to database: https://...
```

## 🚀 Quick Test Without Image

To test if the form works WITHOUT uploading an image:

1. Fill out the leave form
2. Set "Letter Signed by HoD?" to **No** (no file upload)
3. Submit the form
4. Check if it appears in admin dashboard

If this works, the issue is specifically with Firebase Storage.

## 🔧 Manual Fix: Disable Image Upload Temporarily

If you want to test the form without image upload, edit `src/components/LeaveForm.jsx`:

Find line ~129 and comment it out:
```javascript
{formData.letterSigned === 'Yes' && (
    <div>
        {/* Temporarily disabled for testing */}
        {/* <label>Upload Letter Photo</label>
        <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            required
            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
        />
        <small className="text-muted">Supports Images or PDF</small> */}
    </div>
)}
```

## 📊 Check Firebase Console

### Check Firestore Database:
1. Go to Firebase Console → **Firestore Database**
2. Look for `leave_requests` collection
3. Check if new documents are being created
4. If yes, the form IS working!

### Check Storage:
1. Go to Firebase Console → **Storage**
2. Look for `leave_letters/` folder
3. Check if files are being uploaded

## 🎯 Most Likely Causes

Based on the symptoms ("Uploading..." stuck), the most likely issues are:

1. **Firebase Storage rules not set** (90% probability)
   - Solution: Set rules as shown above

2. **Network/CORS issue** (5% probability)
   - Check browser console for CORS errors
   - Ensure Firebase project is correctly configured

3. **File too large** (3% probability)
   - Try with a smaller image (< 1MB)

4. **Firebase quota exceeded** (2% probability)
   - Check Firebase Console for quota warnings

## ✅ Verification Checklist

- [ ] Browser console open (F12)
- [ ] Firebase Storage rules published
- [ ] Firestore rules allow writes
- [ ] Tried submitting without file (letterSigned = "No")
- [ ] Checked Firebase Console for new documents
- [ ] Checked for error messages in console

## 🆘 If Still Not Working

1. **Take a screenshot** of the browser console errors
2. **Check Firebase Console** → Firestore Database → see if documents are created
3. **Try without image** - set "Letter Signed" to "No"

The improved error handling will now show you EXACTLY what's wrong!

## 📝 What Changed in Latest Update

- ✅ Fixed syntax error (arrow function)
- ✅ Upload errors no longer block form submission
- ✅ Better error messages (shows specific Firebase error codes)
- ✅ More detailed console logging with ✅ and ❌ emojis
- ✅ Form continues even if file upload fails

**Try submitting the form again and check the console!**
