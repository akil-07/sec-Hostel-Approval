# 🔐 Warden Login System (Corrected)

## Overview

The warden login system now enforces a strict **Two-Factor Authentication (2FA)** flow. Wardens must provide both their access code/password AND authenticate with their Google account to access the dashboard.

---

## 🚀 Login Flow

1. **Enter Warden Code**
   - Example: `pavi1234`
   - The password field will appear automatically.

2. **Enter Password**
   - Example: `pavi123`
   - Click **"Sign In"**.
   - *If the password is wrong, access is denied immediately.*

3. **Google Authentication (2FA)**
   - If the password is correct, a **Google Sign-In popup** will automatically appear.
   - Select your authorized Google account.
   - *If the email is not authorized, access is denied.*

4. **Success**
   - Only after BOTH password and Google Auth are verified, you are logged in.

---

## 🔑 Credentials

### 1. Access Codes & Passwords (Step 1)

| Name | Access Code | Password |
|------|-------------|----------|
| Pavithrakannan | `pavi1234` | `pavi123` |
| Somu | `somu1234` | `somu123` |
| Raguram | `ram1234` | `ram123` |

### 2. Authorized Google Emails (Step 2)

| Name | Authorized Email |
|------|------------------|
| Pavithrakannan | `akilsudhagar7@gmail.com` |
| Somu | `akilsudhagar19@gmail.com` |
| Raguram | `akilsudhagar69@gmail.com` |

---

## ❓ FAQ

**Q: Can I skip the Google Sign-In?**
A: No. It is mandatory for security.

**Q: Can I use any Google account?**
A: No. You must use the specific Gmail address linked to your warden profile (listed above).

**Q: What if I forget my password?**
A: Contact the Super Admin to reset it.

**Q: Why don't I see a "Sign in with Google" button?**
A: It was removed because Google Sign-In is now triggered *automatically* after you enter your correct password.
