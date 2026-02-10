import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCdGLpq82WeNo97sNYB2dm978pOHUp2JU0",
    authDomain: "hostel-app-dbs.firebaseapp.com",
    projectId: "hostel-app-dbs",
    storageBucket: "hostel-app-dbs.firebasestorage.app",
    messagingSenderId: "799300996393",
    appId: "1:799300996393:web:4d70d4fd7fca9bb21c3b38"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
