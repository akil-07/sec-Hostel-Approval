import XLSX from 'xlsx';
import fs from 'fs';

const wb = XLSX.readFile('ANNEX FIRST FLOOR.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

let output = 'All Excel Data:\n\n';
data.forEach((row, i) => {
    if (row && row.length > 0) {
        output += `Row ${i}: Room=${row[0]}, RegNo=${row[1]}, Name=${row[2]}\n`;
    }
});

fs.writeFileSync('excel-full-data.txt', output);
console.log('✅ Saved all Excel data to excel-full-data.txt');
console.log('Total rows:', data.length);
