import { GOOGLE_SCRIPT_URL } from './config';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, setDoc, getDoc, deleteDoc, writeBatch } from "firebase/firestore";

// ... existing code ...

// Delete all leave requests (for storage cleanup)
export const deleteAllLeaveRequests = async () => {
    try {
        const q = query(collection(db, "leave_requests"));
        const snapshot = await getDocs(q);

        if (snapshot.size === 0) return { status: 'success', count: 0 };

        // Firestore batch limit is 500
        const batch = writeBatch(db);
        let count = 0;

        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
            count++;
        });

        await batch.commit();
        console.log(`✅ Deleted ${count} leave requests.`);
        return { status: 'success', count };
    } catch (error) {
        console.error("❌ Error deleting requests:", error);
        throw error;
    }
};

// compressImage function removed from here as it is defined later

export const fetchRequests = async () => {
    try {
        // Fetch from Firestore (Primary Database)
        const q = query(collection(db, "leave_requests"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const requests = [];
        querySnapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() });
        });
        return requests;
    } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        if (error.code === 'permission-denied') {
            return [];
        }
        return [];
    }
};

// Helper to compress and convert image to Base64
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;

                let width = img.width;
                let height = img.height;

                // Resize logic to keep aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Base64 with 70% quality compression
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };

            img.onerror = () => reject(new Error('Failed to load image'));
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
    });
};

export const submitRequest = async (formData) => {
    let imageBase64 = '';

    // STEP 1: Compress and Convert Image to Base64
    if (formData.rawFile) {
        try {
            console.log("📸 Compressing image...");
            imageBase64 = await compressImage(formData.rawFile);
            const sizeKB = Math.round((imageBase64.length * 3) / 4 / 1024);
            console.log(`✅ Image compressed (${sizeKB} KB)`);
        } catch (error) {
            console.error("❌ Error compressing image:", error);
            alert(`Failed to process image: ${error.message}`);
        }
    }

    // STEP 2: Save to Firestore (PRIMARY - App Data)
    // We store the Base64 image directly so the app doesn't depend on external links
    let docId = null;
    try {
        console.log("💾 Saving to Firestore database...");

        const firestoreData = {
            'Register Number': formData.regNo,
            'Student Name': formData.name,
            'Year': formData.year,
            'Dept': formData.dept,
            'Student Mobile': formData.studentMobile,
            'Parent Mobile': formData.parentMobile,
            'Room': formData.room,
            'Reason': formData.reason,
            'Leaving date': formData.leavingDate,
            'Date of return': formData.returnDate,

            // STORE BASE64 DIRECTLY - Ensures App works independently
            'letter image': imageBase64,
            'fileData': imageBase64,
            'fileUrl': '', // No URL yet

            'Approval': 'Pending',
            'Remarks': '',
            outTime: formData.outTime,
            numDays: formData.numDays,
            letterSigned: formData.letterSigned,
            fileName: formData.fileName || '',
            mimeType: formData.mimeType || '',
            warden: formData.warden,
            timestamp: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "leave_requests"), firestoreData);
        docId = docRef.id;
        console.log("✅ Saved to Firestore with ID:", docId);

    } catch (error) {
        console.error("❌ Firestore Save Error:", error);
        alert("Failed to save request. Please try again.");
        throw error;
    }

    // STEP 3: Send to Google Sheets (SECONDARY - Excel/Drive Backup)
    // We do this AFTER Firestore so the user's request is already safe.
    try {
        console.log("📤 Sending to Google Script (Background)...");

        const payload = {
            action: 'create',
            ...formData,
            id: docId, // Link rows if needed
            fileData: imageBase64,
            fileName: formData.fileName || (imageBase64 ? 'image.jpg' : '')
        };

        // Fire and forget (or await but ignore errors) allows the UI to be snappy
        // But we'll await with a short timeout to try and log success
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for backup

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: controller.signal
        })
            .then(res => res.json())
            .then(data => console.log("📊 Google Sheet updated:", data))
            .catch(err => console.warn("⚠️ Google Sheet backup skipped/failed (Non-critical):", err));

    } catch (error) {
        console.warn("⚠️ Google Script error:", error);
    }

    return { status: 'success', id: docId };
};

export const updateRequest = async (id, status, remarks) => {
    // Update Firebase Firestore (Primary)
    try {
        const requestRef = doc(db, "leave_requests", id);
        await updateDoc(requestRef, {
            Approval: status,
            Remarks: remarks
        });

        console.log("✅ Request updated successfully");
        return { status: 'success' };
    } catch (error) {
        console.error("❌ Error updating request:", error);
        return { status: 'error', message: error.message };
    }
};

// --- Super Admin Functions ---

// Add a new student to Firestore
export const addStudent = async (studentData) => {
    try {
        // Use RegNo as ID for easy lookup, or auto-ID
        // Using RegNo as ID is better for deduplication
        const normalizedRegNo = studentData.regNo.toString().trim().toUpperCase();
        await setDoc(doc(db, "students", normalizedRegNo), studentData, { merge: true });
        console.log("✅ Student added/updated:", studentData.name);
        return { status: 'success' };
    } catch (error) {
        console.error("❌ Error adding student:", error);
        throw error;
    }
};

// Fetch student details (Check Firestore first, could fallback to static file if needed logic exists)
export const fetchStudent = async (regNo) => {
    try {
        const normalizedRegNo = regNo.toString().trim().toUpperCase();
        const docRef = doc(db, "students", normalizedRegNo);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching student:", error);
        return null;
    }
};

// Add a new warden
export const addWarden = async (wardenData) => {
    try {
        // wardenData = { name: "Somu", password: "123" }
        await addDoc(collection(db, "wardens"), wardenData);
        return { status: 'success' };
    } catch (error) {
        console.error("❌ Error adding warden:", error);
        throw error;
    }
};

// Fetch all wardens
export const fetchWardens = async () => {
    try {
        const q = query(collection(db, "wardens"));
        const querySnapshot = await getDocs(q);
        const wardens = [];
        querySnapshot.forEach((doc) => {
            wardens.push({ id: doc.id, ...doc.data() });
        });
        return wardens;
    } catch (error) {
        console.error("Error fetching wardens:", error);
        return [];
    }
};
// Fetch global config
export const fetchConfig = async () => {
    try {
        const docRef = doc(db, "config", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return { is24HourRuleEnabled: false }; // Default
    } catch (error) {
        console.error("Error fetching config:", error);
        return { is24HourRuleEnabled: false };
    }
};

// Update global config
export const updateConfig = async (newConfig) => {
    try {
        const docRef = doc(db, "config", "global");
        await setDoc(docRef, newConfig, { merge: true });
        console.log("✅ Config updated:", newConfig);
        return { status: 'success' };
    } catch (error) {
        console.error("❌ Error updating config:", error);
        throw error;
    }
};

// Fetch all students (for management)
export const fetchAllStudents = async () => {
    try {
        const q = query(collection(db, "students"));
        const querySnapshot = await getDocs(q);
        const students = [];
        querySnapshot.forEach((doc) => {
            students.push({ id: doc.id, ...doc.data() });
        });
        return students;
    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
};

// Delete a student
export const deleteStudent = async (regNo) => {
    try {
        const normalizedRegNo = regNo.toString().trim().toUpperCase();
        await deleteDoc(doc(db, "students", normalizedRegNo));
        console.log("✅ Student deleted:", normalizedRegNo);
        return { status: 'success' };
    } catch (error) {
        console.error("❌ Error deleting student:", error);
        throw error;
    }
};

// Delete a warden
export const deleteWarden = async (id) => {
    try {
        await deleteDoc(doc(db, "wardens", id));
        console.log("✅ Warden deleted:", id);
        return { status: 'success' };
    } catch (error) {
        console.error("❌ Error deleting warden:", error);
        throw error;
    }
};
