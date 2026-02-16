
import XLSX from 'xlsx';

const workbook = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

// Get unique Year values
const years = [...new Set(data.map(r => r['Year']))];
console.log("Unique Year values in Excel:", years);
