# 📤 Google Drive Upload & Excel Link Guide

## Overview
We have switched from Firebase Storage back to **Google Drive** for file storage to avoid costs.
The system now:
1. Compresses the image in the browser.
2. Sends the image data to your Google Apps Script.
3. The Script uploads it to your Google Drive.
4. The Script puts the **Drive Link** into your Excel Sheet.
5. The Script returns the link to the App, so it's saved in the database for display.

## ⚠️ CRITICAL: Update Your Google Script

You **MUST** update your Google Apps Script with the code below for the "Drive Link" feature to work.

### Step 1: Open Google Script
1. Go to your Google Sheet.
2. Click **Extensions** > **Apps Script**.

### Step 2: Replace Code
Delete all existing code in `Code.gs` and paste this **updated** version:

```javascript
function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LeaveRequests");
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet 'LeaveRequests' not found" })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var rows = data.slice(1);
    var headers = data[0];

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
            // --- HANDLE FILE UPLOAD TO DRIVE ---
            var fileUrl = "";
            if (params.fileData && params.fileName) {
                try {
                    // Extract Base64 data
                    var data = params.fileData.indexOf(",") > -1 ? params.fileData.split(",")[1] : params.fileData;
                    var blob = Utilities.newBlob(Utilities.base64Decode(data), params.mimeType || "image/jpeg", params.fileName);

                    // Create file in Drive
                    var file = DriveApp.createFile(blob);

                    // SET PERMISSIONS: Allow anyone with link to view (CRITICAL for App display)
                    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

                    // Get the View URL
                    fileUrl = file.getUrl();
                } catch (err) {
                    fileUrl = "Upload Error: " + err.toString();
                }
            }
            // -----------------------------------

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
                fileUrl               // Column T: Letter Image URL
            ];

            sheet.appendRow(newRow);

            // RETURN THE FILE URL TO THE APP
            return ContentService.createTextOutput(JSON.stringify({ 
                status: "success", 
                message: "Request Submitted",
                fileUrl: fileUrl,  // <--- IMPORTANT: Sending URL back to App
                row: sheet.getLastRow()
            })).setMimeType(ContentService.MimeType.JSON);

        } else if (action === "update") {
            // Update logic (unchanged)
            var id = params.id;
            var status = params.status;
            var remarks = params.remarks;
            var data = sheet.getDataRange().getValues();
            var rowIndex = -1;

            for (var i = 1; i < data.length; i++) {
                if (data[i][18] == id) { // Col S (index 18) is ID
                    rowIndex = i + 1;
                    break;
                }
            }

            if (rowIndex !== -1) {
                sheet.getRange(rowIndex, 17).setValue(status);
                sheet.getRange(rowIndex, 18).setValue(remarks);
                return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Updated" })).setMimeType(ContentService.MimeType.JSON);
            } else {
                return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ID not found" })).setMimeType(ContentService.MimeType.JSON);
            }
        }

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}
```

### Step 3: Deploy
1. Click **Deploy** > **New Deployment**.
2. Select **Web app**.
3. Under **Who has access**, select **Anyone**.
4. Click **Deploy**.
5. Copy the **Web App URL** (if it changed, update your `.env.local` file, but it usually stays the same if you edit the existing deployment). -> *Pro Tip: Use "Deploy > Manage Deployments > Edit > New Version" to keep the same URL.*

## 🧪 How to Test
1. Create a new request in the App.
2. Upload a photo.
3. Check your **Excel Sheet**: The new row should have a clickable link.
4. Check your **App Dashboard**: The request should appear, and clicking "View Letter" should open the Drive link.
