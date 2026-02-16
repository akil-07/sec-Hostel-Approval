
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const verifyAkil = async () => {
    // Roll No for Akil from screenshot: 25013635
    const rollNo = '25013635';
    const docRef = doc(db, 'students', rollNo);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        console.log('AKIL DATA:', JSON.stringify(snap.data(), null, 2));
    } else {
        console.log('AKIL NOT FOUND');
    }
};

verifyAkil().then(() => process.exit(0));
