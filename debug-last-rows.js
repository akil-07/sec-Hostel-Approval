import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('ANNEX FIRST FLOOR.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to array of arrays
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`Total rows: ${data.length}`);
console.log('Last 5 rows:');
const lastRows = data.slice(-5);
lastRows.forEach((row, index) => {
    console.log(`Row ${data.length - 5 + index + 1}:`, row);
});
