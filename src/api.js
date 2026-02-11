import { GOOGLE_SCRIPT_URL } from './config';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, setDoc, getDoc } from "firebase/firestore";

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

export const submitRequest = async (formData) => {
    let imageBase64 = '';

    // STEP 1: Compress and Convert Image to Base64 (if file exists)
    if (formData.rawFile) {
        try {
            console.log("📸 Compressing and converting image to Base64...");
            console.log("File details:", {
                name: formData.rawFile.name,
                size: formData.rawFile.size,
                type: formData.rawFile.type
            });

            // Compress and convert to Base64
            imageBase64 = await compressImage(formData.rawFile);

            const sizeKB = Math.round((imageBase64.length * 3) / 4 / 1024);
            console.log(`✅ Image compressed to Base64 (${sizeKB} KB)`);

        } catch (error) {
            console.error("❌ Error compressing image:", error);
            alert(`Failed to process image: ${error.message}`);
            // Continue without image
            imageBase64 = '';
        }
    }

    // STEP 2: Submit to Google Sheets (Backup Copy - Optional)
    const payload = {
        action: 'create',
        ...formData,
        fileData: imageBase64 || formData.fileData || ''
    };

    let googleResponse = {};
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        googleResponse = await response.json();
        console.log("📊 Google Sheets backup response:", googleResponse);
    } catch (error) {
        console.error("⚠️ Error submitting to Google Sheets (Backup):", error);
        // We continue even if backup fails, as Firebase is primary now.
    }

    // STEP 3: Submit to Firebase Firestore (Primary Database)
    try {
        console.log("💾 Saving to Firestore database...");

        const firestoreData = {
            // Mapped Keys for Frontend Compatibility
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

            // Store Base64 image data
            'letter image': imageBase64,
            'fileData': imageBase64,
            'Letter Image URL': googleResponse.fileUrl || '',

            // Other fields
            'Approval': 'Pending',
            'Remarks': '',

            // Include other form fields
            floorInCharge: formData.floorInCharge,
            outTime: formData.outTime,
            numDays: formData.numDays,
            letterSigned: formData.letterSigned,
            fileName: formData.fileName || '',
            mimeType: formData.mimeType || '',
            warden: formData.warden,

            // Meta
            timestamp: new Date().toISOString(),
            sheetRow: googleResponse.row || null
        };

        // Remove rawFile object (not serializable)
        if (firestoreData.rawFile) delete firestoreData.rawFile;

        const docRef = await addDoc(collection(db, "leave_requests"), firestoreData);
        console.log("✅ Document written to Firebase with ID:", docRef.id);
        console.log("✅ Image saved as Base64 data");

        return { status: 'success', id: docRef.id };
    } catch (error) {
        console.error("❌ Error submitting request to Firebase:", error);
        console.error("Error details:", error.message);
        alert(`Failed to submit request: ${error.message}`);
        throw error;
    }
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
        await setDoc(doc(db, "students", studentData.regNo), studentData);
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
        const docRef = doc(db, "students", regNo);
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
