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
            // Handle File Upload to Drive
            var fileUrl = "";
            if (params.fileData && params.fileName) {
                try {
                    // Extract Base64 data (remove header if present)
                    var data = params.fileData.indexOf(",") > -1 ? params.fileData.split(",")[1] : params.fileData;
                    var blob = Utilities.newBlob(Utilities.base64Decode(data), params.mimeType, params.fileName);

                    // Create file in the root of Drive (or specific folder if ID provided)
                    var file = DriveApp.createFile(blob);

                    // distinct permission to ensure it can be viewed in the app
                    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

                    // Use getDownloadUrl or getUrl. getUrl is the preview link.
                    // For <img> tag, we might need a thumbnail or download link, but preview link is safer for "View" button.
                    fileUrl = file.getUrl();
                } catch (err) {
                    fileUrl = "Upload Error: " + err.toString();
                }
            }

            var newRow = [
                new Date(), // Timestamp
                params.regNo,
                params.name,
                params.year,
                params.dept,
                params.studentMobile,
                params.parentMobile,
                params.room,
                params.reason,
                params.floorInCharge,
                params.leaveDates,
                params.numDays,
                params.leavingDate,
                params.outTime,
                params.returnDate,
                params.letterSigned, // Keep this as Yes/No
                "Pending", // Approval
                "", // Remarks
                Utilities.getUuid(), // ID
                fileUrl // New Column T: Letter Image URL
            ];

            sheet.appendRow(newRow);
            return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Request Submitted" })).setMimeType(ContentService.MimeType.JSON);

        } else if (action === "update") {
            var id = params.id;
            var status = params.status;
            var remarks = params.remarks;

            var data = sheet.getDataRange().getValues();
            var rowIndex = -1;

            // Search by ID (Col S -> index 18)
            for (var i = 1; i < data.length; i++) {
                if (data[i][18] == id) {
                    rowIndex = i + 1;
                    break;
                }
            }

            if (rowIndex !== -1) {
                sheet.getRange(rowIndex, 17).setValue(status); // Approval
                sheet.getRange(rowIndex, 18).setValue(remarks); // Remarks
                return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Updated successfully" })).setMimeType(ContentService.MimeType.JSON);
            } else {
                return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ID not found" })).setMimeType(ContentService.MimeType.JSON);
            }
        }

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}

function testDrivePermission() {
    DriveApp.getRootFolder();
    Logger.log("Permissions are good!");
}
