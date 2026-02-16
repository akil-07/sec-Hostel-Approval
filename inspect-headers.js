import XLSX from 'xlsx';

const wb = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];

// Get headers via range
const range = XLSX.utils.decode_range(ws['!ref']);
const headers = [];
for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
    headers.push(cell ? cell.v : undefined);
}

console.log('EXACT HEADERS:');
console.log(JSON.stringify(headers, null, 2));

// Check first data row for Year format
const firstRow = [];
for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: 1, c: C })];
    firstRow.push(cell ? cell.v : undefined);
}
console.log('FIRST DATA ROW:');
console.log(JSON.stringify(firstRow, null, 2));
