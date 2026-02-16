
import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Extract JSON data
const rawData = XLSX.utils.sheet_to_json(sheet);

// Map to our schema - CORRECTLY MAPPED THIS TIME
const studentData = rawData.map(row => {
    // Normalize Year (Roman to Number)
    let year = (row['Year'] || '').toString().trim();
    if (year === 'I' || year === '1') year = '1';
    else if (year === 'II' || year === '2') year = '2';
    else if (year === 'III' || year === '3') year = '3';
    else if (year === 'IV' || year === '4') year = '4';

    return {
        // KEY FIX: Use 'Roll Number' as the primary ID (regNo)
        regNo: (row['Roll Number'] || '').toString().trim(),

        // Store 'Register Number' as universityRegNo
        universityRegNo: (row['Register Number'] || '').toString().trim(),

        name: (row['Student Name'] || '').trim(),
        room: (row['Room Number'] || '').trim(),
        dept: (row['Department'] || '').trim(),
        year: year,
        studentMobile: (row['Student Mobile Number'] || '').toString().trim(),
        parentMobile: (row['Parent Mobile Number'] || '').toString().trim()
    };
}).filter(s => s.regNo && s.name); // basic validation

console.log(`Found ${studentData.length} students.`);

// Create the file content
const fileContent = `// Utility function to migrate students from Excel to Firebase
// This runs in the browser where Firebase is already configured
// AUTO-GENERATED FROM 'NBF Student Details_for Leave Application.xlsx'

import { db } from '../firebase';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// Student data parsed from Excel
// Mapped: Roll Number -> regNo (ID), Register Number -> universityRegNo
const STUDENT_DATA = ${JSON.stringify(studentData, null, 4)};

export const migrateStudentsToFirebase = async (onProgress) => {
    console.log('🚀 Starting student migration to Firebase...');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < STUDENT_DATA.length; i++) {
        const student = STUDENT_DATA[i];
        // Ensure ID is uppercase/trimmed if alphanumeric, though typically numeric
        const normalizedRegNo = student.regNo.toString().toUpperCase().trim();

        try {
            await setDoc(doc(db, 'students', normalizedRegNo), {
                regNo: student.regNo,
                universityRegNo: student.universityRegNo, // New Field
                name: student.name,
                room: student.room,
                dept: student.dept,
                year: student.year,
                studentMobile: student.studentMobile,
                parentMobile: student.parentMobile,
                // Add default password or other fields if needed
            }, { merge: true });

            successCount++;

            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: STUDENT_DATA.length,
                    successCount,
                    errorCount,
                    currentStudent: student.name
                });
            }
        } catch (error) {
            errorCount++;
            errors.push({ student: normalizedRegNo, error: error.message });
            console.error(\`❌ Error uploading \${normalizedRegNo}:\`, error.message);
        }
    }

    return {
        success: errorCount === 0,
        successCount,
        errorCount,
        total: STUDENT_DATA.length,
        errors
    };
};

export const checkMigrationStatus = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'students'));
        return {
            exists: snapshot.size > 0,
            count: snapshot.size
        };
    } catch (error) {
        console.error('Error checking migration status:', error);
        return {
            exists: false,
            count: 0,
            error: error.message
        };
    }
};
`;

// Write to file
fs.writeFileSync('src/utils/migrateStudents.js', fileContent);
console.log('Updated src/utils/migrateStudents.js with CORRECT ID mapping!');
