# ⚡ QUICK FIX - Admin Page Not Loading

## 🔴 Problem
```
Error: Firebase client is offline
Admin page stuck on "Loading Dashboard..."
```

## ✅ Solution (3 Steps)

### 1️⃣ Get Firebase Credentials
```
https://console.firebase.google.com/
→ Select "hostel-app-dbs"
→ ⚙️ Project Settings
→ Scroll to "Your apps"
→ Copy the config values
```

### 2️⃣ Update `.env.local`
```bash
# Open: .env.local
# Replace these with your actual values:

VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=hostel-app-dbs.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hostel-app-dbs
VITE_FIREBASE_STORAGE_BUCKET=hostel-app-dbs.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
```

### 3️⃣ Restart Server
```bash
Ctrl+C  # Stop current server
npm run dev  # Start again
```

## 🎯 Then
1. Open http://localhost:5173
2. Login as Super Admin (password: `admin123`)
3. Click "📤 Migrate All Students to Firebase"
4. Done! ✅

---

## 📚 Detailed Guide
See: `FIREBASE_SETUP_REQUIRED.md`

---

**Time needed**: 5 minutes
**Difficulty**: Easy
**Required**: Firebase account access
