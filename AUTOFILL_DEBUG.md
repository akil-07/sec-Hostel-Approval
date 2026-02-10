# 🔍 Auto-Fill Debug Guide

## How to Test and Debug

### Step 1: Open Browser Console

1. Open your browser to: http://localhost:5173/sec-Hostel-Approval/
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Keep it open while testing

### Step 2: Login and Test

1. **Login as student** with RegNo: `25013835`
2. Click **"+ New Request"**
3. **Check the console** - you should see:
   ```
   🔍 Auto-fill check - RegNo: 25013835
   📊 Student info found: {name: "Nihil D", room: "103"}
   ✅ Auto-filling: {name: "Nihil D", room: "103"}
   ```

4. **Check the form** - Name and Room fields should be filled!

### Step 3: What the Console Messages Mean

✅ **If you see this:**
```
🔍 Auto-fill check - RegNo: 25013835
📊 Student info found: {name: "Nihil D", room: "103"}
✅ Auto-filling: {name: "Nihil D", room: "103"}
```
**Meaning:** Auto-fill is working! The fields should be populated.

❌ **If you see this:**
```
🔍 Auto-fill check - RegNo: 25013835
📊 Student info found: null
❌ No student data found for RegNo: 25013835
```
**Meaning:** The registration number is not in the student data file.
**Solution:** Add it to `src/data/students.js`

❌ **If you see this:**
```
🔍 Auto-fill check - RegNo: undefined
```
**Meaning:** The RegNo is not being passed to the form.
**Solution:** Check that you're logging in correctly.

❌ **If you see errors:**
```
Error: Cannot find module '../data/students'
```
**Meaning:** The students.js file is missing or path is wrong.
**Solution:** Check that `src/data/students.js` exists.

### Step 4: Verify the Fields

After clicking "+ New Request", check:
- [ ] **Name field** - Should show "Nihil D"
- [ ] **Room field** - Should show "103"
- [ ] **Console** - Should show success messages

### Step 5: Test with Your Own RegNo

1. Open `src/data/students.js`
2. Add your registration number:
   ```javascript
   export const studentData = {
       "25013835": { name: "Nihil D", room: "103" },
       "YOUR_REG_NO": { name: "Your Name", room: "Your Room" },
   };
   ```
3. Save the file
4. Refresh browser
5. Login with YOUR_REG_NO
6. Click "+ New Request"
7. Check console and form fields

### Common Issues

#### Issue 1: Console shows "null" for student info
**Cause:** Registration number not in database or doesn't match
**Fix:** 
- Check spelling/format in `src/data/students.js`
- Make sure RegNo is in quotes: `"25013835"`
- Check for extra spaces

#### Issue 2: Console shows nothing
**Cause:** Form not loading or useEffect not running
**Fix:**
- Hard refresh browser (Ctrl+Shift+R)
- Check for JavaScript errors in console
- Make sure you clicked "+ New Request"

#### Issue 3: Fields don't fill even though console shows success
**Cause:** Form state not updating
**Fix:**
- Check that Name and Room fields are not disabled
- Try typing in the fields manually to see if they work
- Check for CSS hiding the values

### Quick Test Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] Browser console open (F12)
- [ ] Logged in as student with RegNo: 25013835
- [ ] Clicked "+ New Request"
- [ ] Console shows auto-fill messages
- [ ] Name field shows "Nihil D"
- [ ] Room field shows "103"

### Screenshot What You See

If it's still not working:
1. Take a screenshot of the **form**
2. Take a screenshot of the **console**
3. Share both screenshots

This will help identify the exact issue!

---

## Expected Behavior

**When working correctly:**
1. Login with RegNo
2. Click "+ New Request"  
3. Console logs appear
4. Name and Room auto-fill instantly
5. You can still edit the fields if needed

**The auto-fill happens ONCE when the form loads, based on your RegNo.**

---

## Test Now!

1. **Refresh your browser** (Ctrl+Shift+R)
2. **Open console** (F12)
3. **Login** with 25013835
4. **Click "+ New Request"**
5. **Check console** for debug messages
6. **Check form** for auto-filled values

Let me know what you see in the console!
