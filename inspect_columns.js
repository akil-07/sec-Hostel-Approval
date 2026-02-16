
import XLSX from 'xlsx';
import fs from 'fs';

try {
    const workbook = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);
    if (data.length > 0) {
        console.log("COLUMNS:", JSON.stringify(Object.keys(data[0]), null, 2));
        console.log("SAMPLE ROW:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("No data");
    }
} catch (e) {
    console.error("Error:", e);
}
