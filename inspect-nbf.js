import XLSX from 'xlsx';

const wb = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('Headers:', data[0]);
console.log('First Row:', data[1]);
