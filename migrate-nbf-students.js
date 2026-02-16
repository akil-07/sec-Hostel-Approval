import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateNBFStudents = async () => {
    console.log('🚀 Starting NBF Student Data Migration...');

    // 1. Read Excel File
    const workbook = XLSX.readFile('NBF Student Details_for Leave Application.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${data.length} students in Excel file.`);

    if (data.length === 0) {
        console.error('❌ No data found in Excel file!');
        return;
    }

    // 2. Clear existing students
    console.log('🧹 Clearing existing student data...');
    const snapshot = await getDocs(collection(db, 'students'));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`🗑️ Deleted ${snapshot.size} existing student records.`);

    let successCount = 0;
    let errorCount = 0;

    console.log('📤 Uploading students to Firebase...');

    for (let i = 0; i < data.length; i++) {
        const row = data[i];

        // Map Excel columns to Firestore fields
        // Excel Headers: 'Room Number', 'Roll Number', 'Register Number', 'Student Name', 'Department', 'Year', 'Student Number', 'Parent Number'

        const rollNo = row['Roll Number'] ? String(row['Roll Number']).trim() : '';
        const regNo = row['Register Number'] ? String(row['Register Number']).trim() : '';
        const name = row['Student Name'] ? String(row['Student Name']).trim() : '';
        const room = row['Room Number'] ? String(row['Room Number']).trim() : '';
        const dept = row['Department'] ? String(row['Department']).trim() : '';

        let year = row['Year'] ? String(row['Year']).trim() : '';
        // Convert Roman Numerals to Arabic
        const romanMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
        if (romanMap[year]) year = romanMap[year];

        // Mobile numbers - Check exact headers from inspection
        // Inspection showed 'Student Mobile Number' and likely 'Parent Mobile Number'
        const studentMobile = row['Student Mobile Number'] ? String(row['Student Mobile Number']).trim() : '';
        // Fallback or exact match for parent
        const parentMobile = row['Parent Mobile Number'] ? String(row['Parent Mobile Number']).trim() : '';

        if (!rollNo) {
            console.warn(`⚠️ Skipping row ${i + 2}: Missing Roll Number`);
            continue;
        }

        // The website uses 'regNo' as the ID. User wants Website['Register No'] -> Excel['Roll No'].
        // So we use Roll No as the document ID.
        const docId = rollNo.toUpperCase();

        const studentData = {
            regNo: rollNo,           // Website Register No = Excel Roll No
            universityRegNo: regNo,  // New field = Excel Register No
            name: name,
            // ... existing fields ...
            room: room,
            dept: dept,
            year: year,
            studentMobile: studentMobile,
            parentMobile: parentMobile
        };

        try {
            await setDoc(doc(db, 'students', docId), studentData, { merge: true });
            successCount++;
            if ((i + 1) % 20 === 0) process.stdout.write('.');
        } catch (error) {
            console.error(`\n❌ Error uploading ${docId}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n\n✅ Migration Complete!`);
    console.log(`Successfully uploaded: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
};

migrateNBFStudents().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
