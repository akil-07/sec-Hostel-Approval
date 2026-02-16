import XLSX from 'xlsx';

const workbook = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Get raw JSON to see headers
const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

if (rawData.length > 0) {
    console.log("Headers found:", Object.keys(rawData[0]));
    console.log("First row sample:", JSON.stringify(rawData[0], null, 2));
    console.log("Total rows:", rawData.length);
} else {
    console.log("No data found in the first sheet.");
}
