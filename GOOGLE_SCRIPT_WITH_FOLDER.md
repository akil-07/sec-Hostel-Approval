# 📄 FULL Google Apps Script Code (with Folder Support)

This is specific code to save uploaded files into your **"1ZAmB3y1Egkur5LCnDo7F7hEUv0TkNLJD"** folder.

### 📝 Step 1: Copy-Paste
Delete everything in your Google Script `Code.gs` and paste this ENTIRE block:

```javascript
function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LeaveRequests");
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet 'LeaveRequests' not found" })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);

    var result = rows.map(function (row, index) {
        var obj = {};
        headers.forEach(function (header, i) {
            obj[header] = row[i];
        });
        obj['row_index'] = index + 2;
        return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LeaveRequests");

    try {
        var params = JSON.parse(e.postData.contents);
        var action = params.action;

        if (action === "create") {
            // --- 1. HANDLE FILE UPLOAD TO FOLDER ---
            var fileUrl = "";
            if (params.fileData && params.fileName) {
                try {
                    var data = params.fileData.indexOf(",") > -1 ? params.fileData.split(",")[1] : params.fileData;
                    var blob = Utilities.newBlob(Utilities.base64Decode(data), params.mimeType, params.fileName);
                    
                    // 👉 Your Folder ID
                    var folderId = "1ZAmB3y1Egkur5LCnDo7F7hEUv0TkNLJD";
                    var folder;
                    
                    try {
                        folder = DriveApp.getFolderById(folderId);
                    } catch (e) {
                        folder = DriveApp.getRootFolder(); // Fallback if folder missing
                    }
                    
                    var file = folder.createFile(blob);
                    
                    // Allow anyone to view (Important for App display)
                    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                    
                    fileUrl = file.getUrl(); 
                } catch (err) {
                    fileUrl = "Upload Error: " + err.toString();
                }
            }

            var newRow = [
                new Date(),           // Timestamp
                params.regNo,
                params.name,
                params.year,
                params.dept,
                params.studentMobile,
                params.parentMobile,
                params.room,
                params.reason,
                params.floorInCharge || "", 
                params.leaveDates || "",
                params.numDays,
                params.leavingDate,
                params.outTime,
                params.returnDate,
                params.letterSigned,
                "Pending",            // Approval
                "",                   // Remarks
                Utilities.getUuid(),  // ID
                fileUrl,              // Column T: Letter Image URL
                params.requestType || "Normal" // Column U: Request Type
            ];

            sheet.appendRow(newRow);

            return ContentService.createTextOutput(JSON.stringify({ 
                status: "success", 
                message: "Request Submitted",
                fileUrl: fileUrl,   
                row: sheet.getLastRow()
            })).setMimeType(ContentService.MimeType.JSON);

        } else if (action === "update") {
             // ... existing update logic ...
             var id = params.id;
             var status = params.status;
             var remarks = params.remarks;
 
             var data = sheet.getDataRange().getValues();
             var rowIndex = -1;
 
             for (var i = 1; i < data.length; i++) {
                 if (data[i][18] == id) {
                     rowIndex = i + 1;
                     break;
                 }
             }
 
             if (rowIndex !== -1) {
                 sheet.getRange(rowIndex, 17).setValue(status);
                 sheet.getRange(rowIndex, 18).setValue(remarks);
                 return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Updated successfully" })).setMimeType(ContentService.MimeType.JSON);
             } else {
                 return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ID not found" })).setMimeType(ContentService.MimeType.JSON);
             }
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}
```

### 🚀 Step 2: REDEPLOY (Required)
1.  Click **Deploy** > **Manage Deployments**.
2.  Click **Edit** (pencil icon).
3.  **Version:** Select **"New version"**.
4.  Click **Deploy**.

Now all new uploads will be neatly organized inside your folder!
