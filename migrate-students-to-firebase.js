// Script to migrate student data from student-list.txt to Firebase
// This is a ONE-TIME migration script
// Run with: node migrate-students-to-firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import dotenv from 'dotenv';

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

// Parse student-list.txt
const parseStudentList = () => {
    const content = fs.readFileSync('student-list.txt', 'utf-8');
    const lines = content.split('\n');
    const students = [];

    for (const line of lines) {
        // Format: 25000201 -> N. THIRU SUBRAMANIA SAMI (Room: NBF-112)
        const match = line.match(/^(\d+)\s*->\s*(.+?)\s*\(Room:\s*(.+?)\)$/);
        if (match) {
            const [, regNo, name, room] = match;
            students.push({
                regNo: regNo.trim(),
                name: name.trim(),
                room: room.trim(),
                year: '', // Will be filled by students on first use
                dept: ''  // Will be filled by students on first use
            });
        }
    }

    return students;
};

// Main migration function
const migrateStudents = async () => {
    console.log('🚀 Starting student data migration to Firebase...\n');

    try {
        // Parse student data
        const students = parseStudentList();
        console.log(`📊 Found ${students.length} students in student-list.txt\n`);

        // Check existing students in Firebase
        console.log('🔍 Checking existing students in Firebase...');
        try {
            const existingSnapshot = await getDocs(collection(db, 'students'));
            const existingCount = existingSnapshot.size;
            console.log(`   Found ${existingCount} existing students in Firebase\n`);
        } catch (error) {
            console.error('   ⚠️ Warning: Could not read existing students');
            console.error('   Error code:', error.code);
            console.error('   Error message:', error.message);
            if (error.code === 'permission-denied') {
                console.error('\n   ❌ PERMISSION DENIED ERROR!');
                console.error('   You need to update your Firestore Security Rules.');
                console.error('   Go to Firebase Console → Firestore Database → Rules');
                console.error('   And update the rules to allow read/write access.\n');
                throw new Error('Firestore permission denied. Please update security rules.');
            }
            console.log('   Continuing with migration...\n');
        }

        // Migrate each student
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        console.log('📤 Uploading students to Firebase...\n');

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const normalizedRegNo = student.regNo.toUpperCase();

            try {
                // Use regNo as document ID for easy lookup
                await setDoc(doc(db, 'students', normalizedRegNo), student, { merge: true });
                successCount++;

                // Show progress every 20 students
                if ((i + 1) % 20 === 0) {
                    console.log(`   ✅ Uploaded ${i + 1}/${students.length} students...`);
                }
            } catch (error) {
                console.error(`   ❌ Error uploading ${normalizedRegNo}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📈 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successfully uploaded: ${successCount} students`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log(`📊 Total processed: ${students.length}`);
        console.log('='.repeat(60));

        // Verify final count
        const finalSnapshot = await getDocs(collection(db, 'students'));
        console.log(`\n🔍 Final verification: ${finalSnapshot.size} students in Firebase`);

        console.log('\n✅ Migration completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. The admin page should now load properly');
        console.log('   2. Students can now auto-fill their details');
        console.log('   3. You can manage students from the Super Admin Dashboard');
        console.log('   4. Students will update their year/dept on first use\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
};

// Run migration
migrateStudents()
    .then(() => {
        console.log('🎉 All done! Exiting...');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
