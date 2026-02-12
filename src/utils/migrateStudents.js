// Utility function to migrate students from student-list.txt to Firebase
// This runs in the browser where Firebase is already configured

import { db } from '../firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

// Student data parsed from student-list.txt
const STUDENT_DATA = [
    { regNo: '25000201', name: 'N. THIRU SUBRAMANIA SAMI', room: 'NBF-112' },
    { regNo: '25000250', name: 'SYED NIYAZ A', room: 'NBF-116' },
    { regNo: '25000358', name: 'MOHAMED ARSATH', room: 'NBF-111' },
    { regNo: '25000476', name: 'ILLAMPARITHI.K', room: 'NBF-113' },
    { regNo: '25000481', name: 'MOHAMED ABUBAKR S', room: 'NBF-114' },
    { regNo: '25000588', name: 'MURSHID AHMED S', room: 'NBF-116' },
    { regNo: '25000783', name: 'GIRISH PRIYAN G', room: 'NBF-114' },
    { regNo: '25000819', name: 'HARIHARAN S', room: 'NBF-111' },
    { regNo: '25001152', name: 'MAHITH.M', room: 'NBF-108' },
    { regNo: '25001187', name: 'HARI PRASATH M', room: 'NBF-103' },
    { regNo: '25001283', name: 'N.SIVANESH KUMAR', room: 'NBF-115' },
    { regNo: '25001681', name: 'JASWANTH S', room: 'NBF-104' },
    { regNo: '25001843', name: 'K.T. SHYAM', room: 'NBF-116' },
    { regNo: '25003095', name: 'RAHUL', room: 'NBF-112' },
    { regNo: '25003242', name: 'R K NIKKIL VARSHAN', room: 'NBF-101' },
    { regNo: '25003270', name: 'ASHFAK N', room: 'NBF-110' },
    { regNo: '25003438', name: 'AAKASH', room: 'NBF-113' },
    { regNo: '25003626', name: 'M.MUKESH', room: 'NBF-113' },
    { regNo: '25003659', name: 'AHMED ALIKHAN', room: 'NBF-102' },
    { regNo: '25004079', name: 'MOHAMED HAFEES R', room: 'NBF-110' },
    { regNo: '25004183', name: 'K PRAGATHISHAN', room: 'NBF-105' },
    { regNo: '25004201', name: 'A. MOHAMED MUBEEN', room: 'NBF-101' },
    { regNo: '25004238', name: 'YUKESHKANNA', room: 'NBF-102' },
    { regNo: '25004373', name: 'B.SAKTHIVEL', room: 'NBF-108' },
    { regNo: '25004426', name: 'PEARARASAN ALIAS BOSE', room: 'NBF-106' },
    { regNo: '25004464', name: 'R.VISHAL', room: 'NBF-117' },
    { regNo: '25004515', name: 'LIFNO RETZIO.L', room: 'NBF-106' },
    { regNo: '25004610', name: 'MAHITH M', room: 'NBF-107' },
    { regNo: '25005365', name: 'HEMAVARATHAN', room: 'NBF-107' },
    { regNo: '25005367', name: 'V.TEJESHWAR', room: 'NBF-105' },
    { regNo: '25005583', name: 'JISHO C', room: 'NBF-117' },
    { regNo: '25005595', name: 'S. P. PRADISH PRIYAN', room: 'NBF-102' },
    { regNo: '25005684', name: 'YUWAN SHANTHOSH K', room: 'NBF-105' },
    { regNo: '25005710', name: 'KALAIMARAN.I', room: 'NBF-117' },
    { regNo: '25005727', name: 'HARISH S', room: 'NBF-115' },
    { regNo: '25005800', name: 'RAMESH JAISURYA', room: 'NBF-103' },
    { regNo: '25005836', name: 'VASANTH.S', room: 'NBF-108' },
    { regNo: '25005854', name: 'AJAY S', room: 'NBF-110' },
    { regNo: '25005972', name: 'SABARINATHAN A', room: 'NBF-102' },
    { regNo: '25005989', name: 'V M MADHAVAN', room: 'NBF-104' },
    { regNo: '25006075', name: 'REVANTH REDDY G', room: 'NBF-101' },
    { regNo: '25006077', name: 'SUNDARESH K', room: 'NBF-115' },
    { regNo: '25006078', name: 'GANESH.G', room: 'NBF-115' },
    { regNo: '25006108', name: 'BHARATH S', room: 'NBF-115' },
    { regNo: '25006183', name: 'HASAN MOHAMED . A', room: 'NBF-102' },
    { regNo: '25006483', name: 'HARISH KUMAR HARI BABU', room: 'NBF-117' },
    { regNo: '25006617', name: 'B.KEERTHIVASAN', room: 'NBF-119' },
    { regNo: '25006748', name: 'M GIRIPRAKASH', room: 'NBF-108' },
    { regNo: '25006843', name: 'PREM NATH D', room: 'NBF-102' },
    { regNo: '25007255', name: 'S.LOGESHWARAN', room: 'NBF-103' },
    { regNo: '25007375', name: 'LOKESH KUMAR', room: 'NBF-111' },
    { regNo: '25007390', name: 'YASWANTH R', room: 'NBF-103' },
    { regNo: '25007473', name: 'ALAN.M', room: 'NBF-118' },
    { regNo: '25007607', name: 'BHAVAN M S', room: 'NBF-103' },
    { regNo: '25007668', name: 'SIVA R', room: 'NBF-104' },
    { regNo: '25007847', name: 'NITHISH. K', room: 'NBF-116' },
    { regNo: '25007890', name: 'RAJESH.S', room: 'NBF-101' },
    { regNo: '25008056', name: 'S.B.SACHIN', room: 'NBF-115' },
    { regNo: '25008066', name: 'ROSHAN IKTHITHAR M', room: 'NBF-119' },
    { regNo: '25008132', name: 'DHARSHAN BABU A', room: 'NBF-120' },
    { regNo: '25008158', name: 'SIVACHARAN S', room: 'NBF-106' },
    { regNo: '25008273', name: 'SEJILAN', room: 'NBF-111' },
    { regNo: '25008360', name: 'NANDHAA J', room: 'NBF-107' },
    { regNo: '25008479', name: 'HARIHARAN V', room: 'NBF-101' },
    { regNo: '25008637', name: 'RITHISH RAM', room: 'NBF-102' },
    { regNo: '25008640', name: 'HARISH PRANAV K S', room: 'NBF-108' },
    { regNo: '25008644', name: 'GOKUL B', room: 'NBF-107' },
    { regNo: '25008762', name: 'M. MAHENDIRAN', room: 'NBF-112' },
    { regNo: '25008769', name: 'JAIHARI S', room: 'NBF-103' },
    { regNo: '25009056', name: 'AASHON D', room: 'NBF-108' },
    { regNo: '25009074', name: 'V LINGESH PANDIAN', room: 'NBF-119' },
    { regNo: '25009087', name: 'KRITHIK', room: 'NBF-104' },
    { regNo: '25009105', name: 'M. PRADEEP', room: 'NBF-118' },
    { regNo: '25009157', name: 'JASIM AHAMED A', room: 'NBF-101' },
    { regNo: '25009508', name: 'BAALABAARATHI P', room: 'NBF-108' },
    { regNo: '25009636', name: 'ANBUSELVAN J', room: 'NBF-106' },
    { regNo: '25009774', name: 'R. S. SANJAI RAM', room: 'NBF-111' },
    { regNo: '25009804', name: 'YOGESH G', room: 'NBF-104' },
    { regNo: '25009816', name: 'S PRAVEEN', room: 'NBF-101' },
    { regNo: '25009906', name: 'MADHIYOLI', room: 'NBF-112' },
    { regNo: '25009937', name: 'NAVEEN V', room: 'NBF-105' },
    { regNo: '25009995', name: 'SARAN PRIYAN R', room: 'NBF-106' },
    { regNo: '25010246', name: 'SARVAJITH SIVAKUMAR SUJATHA', room: 'NBF-103' },
    { regNo: '25010748', name: 'PRAVEEN J', room: 'NBF-103' },
    { regNo: '25010763', name: 'AVINASH KARTHICK.B.M', room: 'NBF-113' },
    { regNo: '25010774', name: 'S.KAMALESH', room: 'NBF-114' },
    { regNo: '25010815', name: 'B GURU PRASAD', room: 'NBF-117' },
    { regNo: '25010828', name: 'NIHIL D', room: 'NBF-106' },
    { regNo: '25010834', name: 'JOSHIN', room: 'NBF-116' },
    { regNo: '25010862', name: 'PRAGATHEESWARAN K', room: 'NBF-101' },
    { regNo: '25010986', name: 'DINESH S', room: 'NBF-117' },
    { regNo: '25011192', name: 'MOHAMMED SHAMEER M', room: 'NBF-101' },
    { regNo: '25011320', name: 'P.SIVA SUNDAR', room: 'NBF-111' },
    { regNo: '25011386', name: 'A.SHEIK MOHAMMED', room: 'NBF-117' },
    { regNo: '25011402', name: 'SAIRAM S', room: 'NBF-114' },
    { regNo: '25011566', name: 'THARUKESH A', room: 'NBF-114' },
    { regNo: '25011585', name: 'LOGESH.S', room: 'NBF-116' },
    { regNo: '25011599', name: 'ANUGOLU RAVI TEJA ROYAL', room: 'NBF-104' },
    { regNo: '25011618', name: 'P.NITHYA PRASATH', room: 'NBF-112' },
    { regNo: '25011643', name: 'V.NAVEEN', room: 'NBF-103' },
    { regNo: '25011654', name: 'BALAKUMARAN', room: 'NBF-110' },
    { regNo: '25011655', name: 'MOHAMED SARJUN M', room: 'NBF-109' },
    { regNo: '25011663', name: 'GUTHIKONDA SUSHANTH', room: 'NBF-107' },
    { regNo: '25011828', name: 'GUNDARAPU CHAITHANYA', room: 'NBF-107' },
    { regNo: '25011965', name: 'SANTHOSH REDDY K', room: 'NBF-106' },
    { regNo: '25011967', name: 'R NAVEEN', room: 'NBF-111' },
    { regNo: '25011969', name: 'SANJAY.A', room: 'NBF-111' },
    { regNo: '25012054', name: 'SUHIN L', room: 'NBF-105' },
    { regNo: '25012069', name: 'SANTHOSH A', room: 'NBF-109' },
    { regNo: '25012175', name: 'JEENSFER JO', room: 'NBF-104' },
    { regNo: '25012253', name: 'KHOVARTHAN V', room: 'NBF-102' },
    { regNo: '25012470', name: 'SATHISH', room: 'NBF-102' },
    { regNo: '25012598', name: 'VIMALESH KANNA MK', room: 'NBF-107' },
    { regNo: '25012709', name: 'JACK WALLACE', room: 'NBF-102' },
    { regNo: '25012742', name: 'RAJURESH', room: 'NBF-105' },
    { regNo: '25012800', name: 'SHERIL.P', room: 'NBF-109' },
    { regNo: '25012833', name: 'S VISHVA', room: 'NBF-115' },
    { regNo: '25012989', name: 'MOHAMMED AFSAL.S', room: 'NBF-112' },
    { regNo: '25013003', name: 'HARESH RAGAVAN V', room: 'NBF-114' },
    { regNo: '25013013', name: 'NIGIL. S', room: 'NBF-104' },
    { regNo: '25013054', name: 'SIBIVARSHAAN S', room: 'NBF-105' },
    { regNo: '25013161', name: 'R GOPINATH', room: 'NBF-106' },
    { regNo: '25013204', name: 'PRANAV K', room: 'NBF-116' },
    { regNo: '25013384', name: 'WINRAJAN K', room: 'NBF-110' },
    { regNo: '25013468', name: 'DWIJESH RAJ SINHA Y', room: 'NBF-116' },
    { regNo: '25013497', name: 'BALAJI B', room: 'NBF-109' },
    { regNo: '25013635', name: 'AKIL', room: 'NBF-103' },
    { regNo: '25013707', name: 'G.V JEFFRIN DINO', room: 'NBF-108' },
    { regNo: '25013725', name: 'JEEVANANTHAM  C', room: 'NBF-109' },
    { regNo: '25013728', name: 'S. ASHIK AHAMED', room: 'NBF-106' },
    { regNo: '25013768', name: 'PRASANNA .P', room: 'NBF-105' },
    { regNo: '25013895', name: 'THILOCHAN', room: 'NBF-118' },
    { regNo: '25013933', name: 'HARI PRASAD', room: 'NBF-107' },
    { regNo: '25013962', name: 'ROHITH R', room: 'NBF-110' },
    { regNo: '25013978', name: 'S.BOOMESH', room: 'NBF-109' },
    { regNo: '25014134', name: 'HARSHITH SANJAI', room: 'NBF-112' },
    { regNo: '25014200', name: 'MOHAMED JIYAAD', room: 'NBF-106' },
    { regNo: '25014330', name: 'S.RAJAPRABU', room: 'NBF-104' },
    { regNo: '25014364', name: 'SATHISH H', room: 'NBF-115' },
    { regNo: '25014606', name: 'M. SANJITH', room: 'NBF-113' },
    { regNo: '25014628', name: 'ADITHYA M', room: 'NBF-113' },
    { regNo: '25014685', name: 'CHRIS AUGUSTO J', room: 'NBF-109' },
    { regNo: '25014706', name: 'K RAGAPRIYAN', room: 'NBF-114' },
    { regNo: '25014734', name: 'NIRMAL.M', room: 'NBF-108' },
    { regNo: '25014751', name: 'DHANUSH M', room: 'NBF-107' },
    { regNo: '25014765', name: 'THARUN', room: 'NBF-105' },
    { regNo: '25014801', name: 'KARNAM PAREESH NAIDU', room: 'NBF-107' },
    { regNo: '25014809', name: 'S P SREE VARDHAN', room: 'NBF-108' },
    { regNo: '25014833', name: 'U.S.RISHVANTH RAJA', room: 'NBF-109' },
    { regNo: '25014892', name: 'SUJIN M L', room: 'NBF-101' },
    { regNo: '25014933', name: 'SHAFI AHMED M S', room: 'NBF-112' },
    { regNo: '25015010', name: 'S AADITHYAN', room: 'NBF-104' },
    { regNo: '25015246', name: 'DONTHI SAI VENKATA RAMANA', room: 'NBF-105' },
    { regNo: '25015366', name: 'RITESH DP', room: 'NBF-113' },
    { regNo: '25015393', name: 'SREESUNDAR', room: 'NBF-118' },
    { regNo: '25015487', name: 'GODWIN LAWRANCE L', room: 'NBF-109' },
    { regNo: '25015509', name: 'DARUNBALA S', room: 'NBF-119' },
    { regNo: '25015589', name: 'S DURGESH', room: 'NBF-117' },
    { regNo: '25015594', name: 'K.ASHWIN NEHREJ', room: 'NBF-113' },
    { regNo: '25015695', name: 'VARDHAN SAI I', room: 'NBF-118' },
    { regNo: '25015705', name: 'RAGHUL S', room: 'NBF-114' },
    { regNo: '25015912', name: 'KARTHIKEYAN S', room: 'NBF-109' },
    { regNo: '25016022', name: 'M A ARUNJUTHAN', room: 'NBF-118' },
    { regNo: '25016058', name: 'HIRUDHITH S', room: 'NBF-118' },
    { regNo: '25016064', name: 'SRI SAI SARAN G', room: 'NBF-118' },
    { regNo: '25016374', name: 'NITHIN KAVI A.R', room: 'NBF-119' },
    { regNo: '25017572', name: 'KISHOOR.I', room: 'NBF-110' },
    { regNo: '25017732', name: 'D R.GOKUL', room: 'NBF-119' },
    { regNo: '25018027', name: 'BHARATHI SHANKAR R', room: 'NBF-110' },
    { regNo: '25018464', name: 'S.ARASU', room: 'NBF-110' },
    { regNo: '25018628', name: 'BALAJI.S', room: 'NBF-110' }
];

export const migrateStudentsToFirebase = async (onProgress) => {
    console.log('🚀 Starting student migration to Firebase...');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < STUDENT_DATA.length; i++) {
        const student = STUDENT_DATA[i];
        const normalizedRegNo = student.regNo.toUpperCase();

        try {
            await setDoc(doc(db, 'students', normalizedRegNo), {
                regNo: student.regNo,
                name: student.name,
                room: student.room,
                year: '',
                dept: ''
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
            console.error(`❌ Error uploading ${normalizedRegNo}:`, error.message);
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
