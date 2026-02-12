# 🔥 Firebase Setup Guide - CRITICAL STEP

## ⚠️ IMPORTANT: Your Admin Page Won't Work Without This!

The error you're seeing (`client is offline`) means Firebase credentials are missing.

---

## 🚀 Quick Fix (5 Minutes)

### Step 1: Get Your Firebase Credentials

1. **Open Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `hostel-app-dbs`
3. **Click the gear icon** (⚙️) next to "Project Overview"
4. **Click "Project settings"**
5. **Scroll down** to "Your apps" section
6. **Find your Web app** (or create one if it doesn't exist)
7. **Copy the config values**

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "hostel-app-dbs.firebaseapp.com",
  projectId: "hostel-app-dbs",
  storageBucket: "hostel-app-dbs.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 2: Update `.env.local` File

I've created a `.env.local` file for you. **Open it and replace the placeholder values**:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=hostel-app-dbs.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hostel-app-dbs
VITE_FIREBASE_STORAGE_BUCKET=hostel-app-dbs.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 3: Restart Dev Server

After updating `.env.local`:

```bash
# Press Ctrl+C to stop the current server
# Then run:
npm run dev
```

### Step 4: Update Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules

**Replace with this** (for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click **"Publish"**

⚠️ **Note**: These rules allow anyone to read/write. For production, implement proper authentication.

---

## 🎯 After Setup

Once you've completed the above steps:

1. ✅ Admin page will load properly
2. ✅ Migration button will work
3. ✅ All Firebase features will function
4. ✅ Students can use auto-fill

---

## 🐛 Troubleshooting

### Still seeing "client is offline"?
- Double-check all credentials are correct
- Make sure there are no extra spaces
- Verify the project ID matches: `hostel-app-dbs`
- Restart the dev server

### Can't find Firebase project?
- Make sure you're logged into the correct Google account
- Check if the project exists at https://console.firebase.google.com/
- You might need to create a new project

### Permission denied errors?
- Update Firestore security rules (see Step 4 above)
- Make sure Firestore Database is enabled
- Check if you have owner/editor access to the project

---

## 📋 Checklist

- [ ] Got Firebase credentials from console
- [ ] Updated `.env.local` with real values
- [ ] Restarted dev server
- [ ] Updated Firestore security rules
- [ ] Verified admin page loads
- [ ] Clicked migration button
- [ ] All 171 students uploaded

---

## 🎓 What Each Credential Does

- **API Key**: Identifies your Firebase project
- **Auth Domain**: Used for authentication
- **Project ID**: Your unique project identifier
- **Storage Bucket**: Where files are stored
- **Messaging Sender ID**: For push notifications
- **App ID**: Identifies your web app

---

## 🔒 Security Note

The `.env.local` file is already in `.gitignore`, so your credentials won't be committed to Git. Keep them safe!

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ No "offline" errors in console
- ✅ Admin dashboard loads with tabs
- ✅ Migration button is clickable
- ✅ Student list appears after migration

---

## 🆘 Need Help?

If you're stuck:
1. Check browser console (F12) for specific errors
2. Verify internet connection
3. Make sure Firebase project exists
4. Double-check all credentials

---

**Next Step**: Get your Firebase credentials and update `.env.local` → Then restart the server! 🚀
