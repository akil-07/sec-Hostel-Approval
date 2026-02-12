# 🔐 Mandatory Google 2FA for Wardens - Setup Guide

## Overview

Wardens are now required to authenticate via **both** their password AND Google Sign-In. This provides **mandatory Two-Factor Authentication (2FA)** security.

---

## 🎯 How It Works

### For Wardens:

1. **Step 1: Credentials**
   - Enter warden code (e.g., `pavi1234`)
   - Enter password (e.g., `pavi123`)
   - Click **Sign In**

2. **Step 2: Google Authentication**
   - If the password is correct, a **Google Sign-In popup** automatically appears.
   - Select your authorized Google account.
   - **Login Successful!**

### For Students & Admin:
- **No changes.**
- Students continue using their registration number.
- Admin uses `admin1234` + password.

---

## 🔧 Configuring Access

### Authorized Emails (Hardcoded)

| Name | Google Email (Required for 2FA) |
|------|---------------------------------|
| Pavithrakannan | `akilsudhagar7@gmail.com` |
| Somu | `akilsudhagar19@gmail.com` |
| Raguram | `akilsudhagar69@gmail.com` |

---

## 🚨 Troubleshooting

### "Failed to sign in with Google" popup closed by user
- Make sure you complete the Google Sign-In popup after entering your password.

### "This Google account is not authorized"
- You must use the **exact** email address listed above.
- If you use a different personal email, access will be denied.

### Google popup not appearing
- Check if your browser is blocking popups for `localhost` or your Vercel domain.
- Allow popups for this site.

---

## 🔒 Security Summary

This system ensures maximum security:
1. **Something you know:** Your password.
2. **Something you possess:** Your authenticated Google session.

Only users who pass BOTH checks can access the Warden Dashboard.
