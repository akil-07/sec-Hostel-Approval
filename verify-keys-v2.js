import XLSX from 'xlsx';

const wb = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const keys = Object.keys(data[0]);
console.log('TOTAL COLUMNS:', keys.length);
keys.forEach((k, i) => console.log(`${i}: ${k}`));
