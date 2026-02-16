import XLSX from 'xlsx';

const wb = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

if (data.length > 0) {
    console.log('KEYS:', Object.keys(data[0]).join(', '));
} else {
    console.log('NO DATA');
}
