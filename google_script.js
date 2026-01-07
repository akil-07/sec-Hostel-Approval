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
        obj['row_index'] = index + 2; // Store 1-based row index (Header is 1, so first data is 2)
        return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LeaveRequests"); // Ensure this sheet exists

    // Parse the POST data
    try {
        var params = JSON.parse(e.postData.contents);
        var action = params.action;

        if (action === "create") {
            // Append new row
            // Expected params matches the columns
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
                params.letterSigned,
                "Pending", // Initial Status
                "", // Initial Remarks
                Utilities.getUuid() // Unique ID for finding this later
            ];

            sheet.appendRow(newRow);
            return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Request Submitted" })).setMimeType(ContentService.MimeType.JSON);

        } else if (action === "update") {
            // Update existing row
            // We need to identify the row. Let's use the Unique ID (last column) or row_index if provided safely
            // Searching by UUID is safer.

            var id = params.id;
            var status = params.status;
            var remarks = params.remarks;

            var data = sheet.getDataRange().getValues();
            var rowIndex = -1;

            // Assume ID is the 19th column (index 18)
            for (var i = 1; i < data.length; i++) {
                if (data[i][18] == id) {
                    rowIndex = i + 1; // 1-based index
                    break;
                }
            }

            if (rowIndex !== -1) {
                // Update Status (Col Q -> 17) and Remarks (Col R -> 18)
                // Set values takes a 2D array.
                // Q is 17th letter, R is 18th. 
                // 1-based column index: Q=17, R=18. 
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
