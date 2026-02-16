
import XLSX from 'xlsx';

// Read the Excel file
const workbook = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Extract JSON data
const data = XLSX.utils.sheet_to_json(sheet);

console.log("First 3 rows:");
data.slice(0, 3).forEach(row => {
    console.log(JSON.stringify({
        "Roll Number": row['Roll Number'],
        "Register Number": row['Register Number'],
        "Student Name": row['Student Name']
    }, null, 2));
});
