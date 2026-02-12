# 🔐 Google Sign-In for Wardens - Setup Guide

## Overview

Wardens now have an additional secure login option using Google Sign-In. This provides extra security and convenience for staff members.

---

## 🎯 How It Works

### For Wardens:

**Option 1: Traditional Login**
```
1. Enter warden code (e.g., pavi1234)
2. Enter password
3. Click "Sign In"
```

**Option 2: Google Sign-In** ✨
```
1. Enter warden code (e.g., pavi1234)
2. Click "Sign in with Google"
3. Select your Google account
4. Automatically logged in!
```

### For Students & Admin:
- Google Sign-In is **only available for wardens**
- Students continue using their registration number
- Admin uses `admin1234` + password

---

## 🔧 Firebase Setup Required

### Step 1: Enable Google Authentication in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hostel-app-dbs`
3. Click **Authentication** in the left sidebar
4. Click **Get Started** (if not already enabled)
5. Go to **Sign-in method** tab
6. Click **Google** provider
7. Click **Enable**
8. Add your **support email** (required)
9. Click **Save**

### Step 2: Add Authorized Domains (for deployment)

1. In Firebase Console → Authentication → Settings
2. Go to **Authorized domains**
3. Add your deployment domain (e.g., `your-app.vercel.app`)
4. `localhost` is already authorized by default

---

## 👥 Authorized Warden Emails

### Hardcoded Wardens:
```javascript
pavithrakannan@example.com → Pavithrakannan
somu@example.com → Somu
raguram@example.com → Raguram
```

### Dynamic Wardens:
Wardens added through the Super Admin Dashboard can also use Google Sign-In if they have an email configured.

---

## 🎨 User Interface

### When Warden Code is Entered:

```
┌──────────────────────────────────────┐
│  Register Number: pavi1234           │
│  Password: ********                  │
│                                      │
│  [        Sign In        ]           │
│                                      │
│  ─────────── OR ───────────          │
│                                      │
│  [🔵 Sign in with Google ]           │
│                                      │
│  Wardens can use Google Sign-In      │
│  for extra security                  │
└──────────────────────────────────────┘
```

### For Students (No Google Option):

```
┌──────────────────────────────────────┐
│  Register Number: 25013635           │
│                                      │
│  [        Sign In        ]           │
│                                      │
│  Note: Students use their            │
│  registration number.                │
└──────────────────────────────────────┘
```

---

## 🔒 Security Features

### Email Verification
- Only authorized emails can sign in as wardens
- Unauthorized emails are rejected with a clear message
- User is automatically signed out if not authorized

### Error Handling
- Popup closed by user: Silent (no error)
- Network errors: User-friendly message
- Unauthorized email: Clear rejection message

### Session Management
- Firebase handles session persistence
- Secure token-based authentication
- Automatic session refresh

---

## 📝 Adding New Authorized Emails

### Method 1: Update Code (Hardcoded)

Edit `src/components/Login.jsx`:

```javascript
const authorizedWardenEmails = [
    'pavithrakannan@example.com',
    'somu@example.com',
    'raguram@example.com',
    'newemail@example.com'  // Add here
];
```

### Method 2: Through Admin Dashboard (Dynamic)

1. Login as Super Admin
2. Go to "Manage Wardens"
3. Add warden with name, password, **and email**
4. Email is automatically authorized for Google Sign-In

---

## 🧪 Testing

### Test Google Sign-In:

1. **Open**: http://localhost:5173
2. **Enter**: `pavi1234`
3. **Click**: "Sign in with Google"
4. **Select**: Google account with authorized email
5. **Expected**: Login to Warden Dashboard

### Test Unauthorized Email:

1. **Enter**: `pavi1234`
2. **Click**: "Sign in with Google"
3. **Select**: Unauthorized Google account
4. **Expected**: Alert "This Google account is not authorized..."

### Test Student (No Google Option):

1. **Enter**: `25013635`
2. **Expected**: No Google Sign-In button visible

---

## 🎯 Benefits

### For Wardens:
✅ **Faster Login** - One click with Google
✅ **No Password to Remember** - Use Google account
✅ **Extra Security** - Google's 2FA protection
✅ **Convenience** - Already logged into Google

### For Admin:
✅ **Better Security** - Google authentication
✅ **Easy Management** - Add emails in admin panel
✅ **Audit Trail** - Firebase tracks all logins

### For System:
✅ **Professional** - Industry-standard auth
✅ **Reliable** - Firebase handles everything
✅ **Scalable** - Easy to add more wardens

---

## 🚨 Important Notes

### Email Requirements:
- Wardens must use the **exact email** configured
- Email is case-sensitive
- Must be a valid Google account

### Privacy:
- Only email is used for verification
- No other Google data is accessed
- Firebase handles all authentication

### Fallback:
- Traditional password login always available
- Google Sign-In is optional, not required
- Both methods work simultaneously

---

## 🔧 Troubleshooting

### "Failed to sign in with Google"
- Check Firebase Authentication is enabled
- Verify domain is authorized
- Check internet connection

### "This Google account is not authorized"
- Email not in authorized list
- Check spelling of email
- Add email through admin dashboard

### Google button not showing
- Make sure you entered a warden code
- Check if `showPassword` is true
- Verify user type is 'warden'

---

## 📊 Technical Implementation

### Files Modified:
- `src/firebase.js` - Added auth and Google provider
- `src/components/Login.jsx` - Added Google Sign-In logic and UI

### Dependencies:
- `firebase/auth` - Authentication module
- `GoogleAuthProvider` - Google OAuth provider

### Key Functions:

#### `handleGoogleSignIn()`
```javascript
1. Opens Google Sign-In popup
2. Gets user email from Google
3. Checks if email is authorized
4. Maps email to warden name
5. Logs in or rejects
```

---

## 🎊 Summary

**What Changed:**
- ✅ Added Firebase Google Authentication
- ✅ Google Sign-In button for wardens
- ✅ Email-based authorization
- ✅ Professional Google branding
- ✅ Error handling and security

**How to Use:**
1. Enable Google Auth in Firebase Console
2. Wardens enter their code
3. Click "Sign in with Google"
4. Done!

**Security:**
- Only authorized emails can sign in
- Firebase handles all authentication
- Traditional password login still works

---

**Created**: 2026-02-12
**Status**: ✅ Ready to use (after Firebase setup)
**Next Step**: Enable Google Authentication in Firebase Console
