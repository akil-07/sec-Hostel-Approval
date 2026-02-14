function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LeaveRequests");
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet 'LeaveRequests' not found" })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);

    // Convert to array of objects
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
            // --- 1. HANDLE FILE UPLOAD TO DRIVE ---
            var fileUrl = "";
            if (params.fileData && params.fileName) {
                try {
                    // Extract Base64 data
                    var data = params.fileData.indexOf(",") > -1 ? params.fileData.split(",")[1] : params.fileData;
                    var blob = Utilities.newBlob(Utilities.base64Decode(data), params.mimeType, params.fileName);

                    // Folder ID provided by user: 1ZAmB3y1Egkur5LCnDo7F7hEUv0TkNLJD
                    var folderId = "1ZAmB3y1Egkur5LCnDo7F7hEUv0TkNLJD";
                    var folder;

                    try {
                        folder = DriveApp.getFolderById(folderId);
                    } catch (e) {
                        folder = DriveApp.getRootFolder(); // Fallback
                    }

                    // Create file in the specific folder
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
                fileUrl,              // Column T: Letter Image URL (Clickable Link!)
                params.requestType || "Normal" // Column U: Request Type
            ];

            sheet.appendRow(newRow);

            // RETURN URL TO APP
            return ContentService.createTextOutput(JSON.stringify({
                status: "success",
                message: "Request Submitted",
                fileUrl: fileUrl,
                row: sheet.getLastRow()
            })).setMimeType(ContentService.MimeType.JSON);
        } else if (action === "update") {
            // ... existing update logic ...
            return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ⬇️ RUN THIS FUNCTION TO FIX PERMISSIONS ⬇️
function checkPermissions() {
    DriveApp.getRootFolder();
    console.log("✅ Permissions are active. You can now Deploy.");
}
