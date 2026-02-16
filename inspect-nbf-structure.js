import XLSX from 'xlsx';

const wb = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
// Read as array of arrays to see raw structure
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('Row 0:', data[0]);
console.log('Row 1:', data[1]);
console.log('Row 2:', data[2]);
console.log('Row 3:', data[3]);
