import XLSX from 'xlsx';
import fs from 'fs';

const workbook = XLSX.readFile('ANNEX FIRST FLOOR.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

let output = '';
output += 'Sheet name: ' + sheetName + '\n\n';
output += '=== Reading as array of arrays ===\n';
const arrayData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
output += 'Total rows: ' + arrayData.length + '\n';
output += 'First 10 rows:\n';
arrayData.slice(0, 10).forEach((row, i) => {
    output += `Row ${i}: ${JSON.stringify(row)}\n`;
});

output += '\n=== Reading as objects ===\n';
const objectData = XLSX.utils.sheet_to_json(worksheet);
output += 'Total objects: ' + objectData.length + '\n';
output += 'First 5 objects:\n';
objectData.slice(0, 5).forEach((obj, i) => {
    output += `Object ${i}: ${JSON.stringify(obj, null, 2)}\n\n`;
});

fs.writeFileSync('excel-debug-output.txt', output);
console.log('✅ Debug output saved to excel-debug-output.txt');
console.log('Total rows:', arrayData.length);
console.log('Total objects:', objectData.length);
