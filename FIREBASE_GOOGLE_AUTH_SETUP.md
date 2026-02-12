# 🔐 Firebase Google Authentication Setup Guide

To make the "Sign in with Google" button work for wardens, you need to enable it in your Firebase project. Follow these simple steps:

## Step 1: Open Firebase Console
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click on your project: **`hostel-app-dbs`**

## Step 2: Navigate to Authentication
1. In the left sidebar menu, look for **Build**.
2. Click on **Authentication**.
   - If this is your first time, click the big **"Get started"** button.

## Step 3: Enable Google Sign-In
1. Click on the **Sign-in method** tab (top menu).
2. Look for **Google** in the list of Sign-in providers.
3. Click on **Google**.
4. Toggle the **Enable** switch to **ON** (it will turn blue).
5. **Project public-facing name**: You can leave this as "hostel-app-dbs" or change it to "Hostel Leave App".
6. **Project support email**: Select your email address from the dropdown list.
   - *This is required by Google.*
7. Click the blue **Save** button.

## Step 4: Verify It's Enabled
1. You should now see **Google** listed as **Enabled** in the Sign-in providers list.
2. Status should be a green checkmark or say "Enabled".

## Step 5: (Optional) Add Authorized Domains
*You only need this if you deploy your app to a live URL (like Vercel or Netlify).*

1. Go to the **Settings** tab in Authentication.
2. Scroll down to **Authorized domains**.
3. `localhost` is authorized by default (which is why it works on your computer).
4. If you deploy, click **Add domain** and enter your website URL (e.g., `my-hostel-app.vercel.app`).

---

## 🧪 How to Test It Checks Out

1. **Start your app**: `npm run dev`
2. **Open**: `http://localhost:5173`
3. **Enter Warden Code**: `pavi1234` (or any valid warden code)
4. **Click**: "Sign in with Google"
5. A popup window should appear asking you to login with your Google account.
6. **Success!** 🎉

## ⚠️ Important Note on Warden Access
The system security only allows specific emails to login as wardens.

**Allowed Emails (Hardcoded in Login.jsx):**
- `pavithrakannan@example.com`
- `somu@example.com`
- `raguram@example.com`

**How to add your real email for testing:**
1. Open `src/components/Login.jsx`
2. Search for `authorizedWardenEmails`
3. Add your Gmail address to the list:
   ```javascript
   const authorizedWardenEmails = [
       'pavithrakannan@example.com',
       'somu@example.com',
       'raguram@example.com',
       'your.email@gmail.com' // <--- Add this line
   ];
   ```
