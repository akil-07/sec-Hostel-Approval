# 📂 Organize Uploads into a specific Google Drive Folder

To keep your Google Drive clean, we can save all student leave letters into a dedicated folder (e.g., "Leave Letters") instead of your main Drive directory.

### Step 1: Create the Folder & Get ID
1.  Go to **Google Drive** (drive.google.com).
2.  Click **+ New** > **New Folder**.
3.  Name it **"Hostel Leave Letters"** (or whatever you like).
4.  Double-click to **open the folder**.
5.  Look at the **URL bar** in your browser. It looks like this:
    `https://drive.google.com/drive/folders/1ABCmTz_SomeRandomCharacters_XYZ`
6.  **Copy the ID part**. That is the text *after* `/folders/`.
    *   Example ID: `1ABCmTz_SomeRandomCharacters_XYZ`

### Step 2: Update Your Script
1.  Open your **Google Sheet** > **Extensions** > **Apps Script**.
2.  Replace the `doPost` function (specifically the file creation part) with this updated code:

```javascript
// ... inside doPost function ...

// --- 1. HANDLE FILE UPLOAD ---
var fileUrl = "";
if (params.fileData && params.fileName) {
    try {
        var data = params.fileData.indexOf(",") > -1 ? params.fileData.split(",")[1] : params.fileData;
        var blob = Utilities.newBlob(Utilities.base64Decode(data), params.mimeType, params.fileName);
        
        // 👉 PASTE YOUR FOLDER ID HERE
        var folderId = "PASTE_YOUR_FOLDER_ID_HERE"; 
        
        var folder;
        try {
            folder = DriveApp.getFolderById(folderId);
        } catch (e) {
            folder = DriveApp.getRootFolder(); // Fallback to root if ID is wrong
        }
        
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
    } catch (err) {
        fileUrl = "Upload Error: " + err.toString();
    }
}
// ... rest of the code ...
```

### Step 3: Redeploy (Essential!)
1.  Click **Deploy** > **Manage Deployments**.
2.  Click **Edit** (pencil icon).
3.  **Version:** Select **"New version"**.
4.  Click **Deploy**.

Now all new uploads will go neatly into that folder!
