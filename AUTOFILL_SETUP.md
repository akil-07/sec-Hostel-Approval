# 🎯 Auto-Fill Student Data Setup Guide

## ✅ What's Implemented

When a student enters their **Registration Number**, the system will automatically fill:
- ✅ **Student Name**
- ✅ **Room Number**

---

## 📝 How to Add Your Student Data

### Step 1: Open the Student Data File

Open: `src/data/students.js`

### Step 2: Add Student Records

The file has this format:

```javascript
export const studentData = {
    "25013835": { name: "Nihil D", room: "103" },
    "21CS001": { name: "John Doe", room: "101" },
    // Add more students here
};
```

### Step 3: Convert Your Excel Data

You have `ANNEX FIRST FLOOR.xlsx`. Here's how to add that data:

#### Option A: Manual Entry (Quick for small lists)

1. Open `ANNEX FIRST FLOOR.xlsx`
2. For each row, add an entry in this format:
   ```javascript
   "RegNo": { name: "Student Name", room: "RoomNo" },
   ```

**Example:**
```javascript
export const studentData = {
    "25013835": { name: "Nihil D", room: "103" },
    "25013836": { name: "Akil S", room: "104" },
    "25013837": { name: "Surya K", room: "105" },
    // ... add all students
};
```

#### Option B: Excel to JSON Converter (For large lists)

1. Go to: https://www.convertcsv.com/excel-to-json.htm
2. Upload your `ANNEX FIRST FLOOR.xlsx`
3. Convert to JSON
4. Copy the JSON data
5. Paste into `src/data/students.js` and format like this:

```javascript
export const studentData = {
    "RegNo1": { name: "Name1", room: "Room1" },
    "RegNo2": { name: "Name2", room: "Room2" },
    // ... etc
};
```

---

## 🧪 Testing Auto-Fill

### Test It:

1. **Login as a student** with registration number: `25013835`
2. Click **"+ New Request"**
3. **Name and Room should auto-fill!**
   - Name: "Nihil D"
   - Room: "103"

### Add Your Own Data:

1. Open `src/data/students.js`
2. Add your registration number:
   ```javascript
   "YOUR_REG_NO": { name: "Your Name", room: "Your Room" },
   ```
3. Save the file
4. Login with your registration number
5. Create new request - fields should auto-fill!

---

## 📊 Excel Column Names

The system looks for these column names in your Excel file:
- **Registration Number**: `Registration Number`, `Reg No`, `RegNo`, `Register Number`
- **Name**: `Name`, `Student Name`
- **Room**: `Room`, `Room No`, `Room Number`

Make sure your Excel file has these columns!

---

## 🔧 Advanced: Bulk Import from Excel

If you have many students, you can use this script:

### Step 1: Install xlsx library
```bash
npm install xlsx
```

### Step 2: Run the converter
```bash
node convert-excel.js
```

This will read `ANNEX FIRST FLOOR.xlsx` and create `src/data/students.json` automatically!

---

## ✨ How It Works

```
Student logs in with RegNo: "25013835"
        ↓
System looks up in studentData
        ↓
Finds: { name: "Nihil D", room: "103" }
        ↓
Auto-fills Name and Room fields
```

---

## 📝 Example: Complete Student Data File

```javascript
// src/data/students.js
export const studentData = {
    // Annex First Floor - Room 101-110
    "25013835": { name: "Nihil D", room: "103" },
    "25013836": { name: "Akil Surya", room: "104" },
    "25013837": { name: "Raj Kumar", room: "105" },
    "25013838": { name: "Priya S", room: "106" },
    "25013839": { name: "Karthik M", room: "107" },
    
    // Add all your students here
    // Format: "RegNo": { name: "Name", room: "Room" },
};

export const getStudentInfo = (regNo) => {
    if (!regNo) return null;
    const normalizedRegNo = regNo.toString().trim().toUpperCase();
    
    if (studentData[normalizedRegNo]) {
        return studentData[normalizedRegNo];
    }
    
    const key = Object.keys(studentData).find(
        k => k.toUpperCase() === normalizedRegNo
    );
    
    return key ? studentData[key] : null;
};
```

---

## 🎯 Quick Start

**To add your data NOW:**

1. Open `src/data/students.js`
2. Replace the example data with your students:
   ```javascript
   export const studentData = {
       "YOUR_REG_NO_1": { name: "Student 1", room: "101" },
       "YOUR_REG_NO_2": { name: "Student 2", room: "102" },
       // ... add all students from ANNEX FIRST FLOOR.xlsx
   };
   ```
3. Save the file
4. The auto-fill will work immediately!

---

## ✅ Benefits

- ✅ **Faster form filling** - Students don't need to type name/room
- ✅ **Fewer errors** - No typos in names or room numbers
- ✅ **Consistent data** - All requests have standardized info
- ✅ **Easy updates** - Just edit one file to update all student data

---

## 🆘 Troubleshooting

### Auto-fill not working?

1. **Check registration number** - Must match exactly (case-insensitive)
2. **Check student data file** - Make sure entry exists
3. **Check browser console** - Look for errors
4. **Refresh page** - Hard refresh (Ctrl+Shift+R)

### Need to update student data?

1. Edit `src/data/students.js`
2. Save the file
3. Refresh browser - changes take effect immediately!

---

**Your auto-fill feature is now ready!** 🎉

Just add your student data from the Excel file and it will work automatically!
