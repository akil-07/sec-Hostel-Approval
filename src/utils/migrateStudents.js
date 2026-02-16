// Utility function to migrate students from Excel to Firebase
// This runs in the browser where Firebase is already configured
// AUTO-GENERATED FROM 'NBF Student Details_for Leave Application.xlsx'

import { db } from '../firebase';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// Student data parsed from Excel
// Mapped: Roll Number -> regNo (ID), Register Number -> universityRegNo
const STUDENT_DATA = [
    {
        "regNo": "25008479",
        "universityRegNo": "212225040110",
        "name": "HARIHARAN V",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9360611153",
        "parentMobile": "6381131658"
    },
    {
        "regNo": "25009157",
        "universityRegNo": "212225040143",
        "name": "JASIM AHAMED A",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "7904005949",
        "parentMobile": "9894044302"
    },
    {
        "regNo": "25004201",
        "universityRegNo": "212225040241",
        "name": "A. MOHAMED MUBEEN",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "6380523886",
        "parentMobile": "8870224446"
    },
    {
        "regNo": "25011192",
        "universityRegNo": "212225040251",
        "name": "MOHAMMED SHAMEER M",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9345895145",
        "parentMobile": "9443748648"
    },
    {
        "regNo": "25003242",
        "universityRegNo": "212225040280",
        "name": "R K NIKKIL VARSHAN",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "6379837001",
        "parentMobile": "8825104455"
    },
    {
        "regNo": "25010862",
        "universityRegNo": "212225040310",
        "name": "PRAGATHEESWARAN K",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9489960873",
        "parentMobile": "8610141313"
    },
    {
        "regNo": "25009816",
        "universityRegNo": "212225040314",
        "name": "S PRAVEEN",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8072287962",
        "parentMobile": "9245809119"
    },
    {
        "regNo": "25007890",
        "universityRegNo": "212225040329",
        "name": "RAJESH.S",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9894447440",
        "parentMobile": "9442532476"
    },
    {
        "regNo": "25006075",
        "universityRegNo": "212225040333",
        "name": "REVANTH REDDY G",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "7013243993",
        "parentMobile": "9666116693"
    },
    {
        "regNo": "25014892",
        "universityRegNo": "212225040435",
        "name": "SUJIN M L",
        "room": "NBF-101",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8015098773",
        "parentMobile": "9715608773"
    },
    {
        "regNo": "25012709",
        "universityRegNo": "212225040136",
        "name": "JACK WALLACE",
        "room": "NBF-102",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "78451 94667",
        "parentMobile": "8675634667"
    },
    {
        "regNo": "25008637",
        "universityRegNo": "212225040345",
        "name": "RITHISH RAM",
        "room": "NBF-102",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9629026279",
        "parentMobile": "9629026279"
    },
    {
        "regNo": "25012470",
        "universityRegNo": "212225040391",
        "name": "SATHISH",
        "room": "NBF-102",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "7904138319",
        "parentMobile": "7904138319"
    },
    {
        "regNo": "25004238",
        "universityRegNo": "212225040503",
        "name": "YUKESHKANNA",
        "room": "NBF-102",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9488530216",
        "parentMobile": "9943762300"
    },
    {
        "regNo": "25006183",
        "universityRegNo": "212225060088",
        "name": "HASAN MOHAMED . A",
        "room": "NBF-102",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8248631018",
        "parentMobile": "9994910853"
    },
    {
        "regNo": "25012253",
        "universityRegNo": "212225220052",
        "name": "KHOVARTHAN V",
        "room": "NBF-102",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "6381462683",
        "parentMobile": "9944083937"
    },
    {
        "regNo": "25003659",
        "universityRegNo": "212225230006",
        "name": "AHMED ALIKHAN",
        "room": "NBF-102",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "8428877057",
        "parentMobile": "9790391818"
    },
    {
        "regNo": "25005595",
        "universityRegNo": "212225230210",
        "name": "S. P. PRADISH PRIYAN",
        "room": "NBF-102",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9894416034",
        "parentMobile": "8838846586"
    },
    {
        "regNo": "25006843",
        "universityRegNo": "212225230217",
        "name": "PREM NATH D",
        "room": "NBF-102",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "7010039939",
        "parentMobile": "9790160032"
    },
    {
        "regNo": "25005972",
        "universityRegNo": "212225230231",
        "name": "SABARINATHAN A",
        "room": "NBF-102",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "8883614009",
        "parentMobile": "8883614008"
    },
    {
        "regNo": "25007390",
        "universityRegNo": "212225040499",
        "name": "YASWANTH R",
        "room": "NBF-103",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9361737470",
        "parentMobile": "9080499316"
    },
    {
        "regNo": "25007607",
        "universityRegNo": "212225100004",
        "name": "BHAVAN M S",
        "room": "NBF-103",
        "dept": "Computer Science and Engineering(Cyber Security)",
        "year": "1",
        "studentMobile": "9789163986",
        "parentMobile": "944344644, 9629920000"
    },
    {
        "regNo": "25001187",
        "universityRegNo": "212225100015",
        "name": "HARI PRASATH M",
        "room": "NBF-103",
        "dept": "Computer Science and Engineering(Cyber Security)",
        "year": "1",
        "studentMobile": "9087204884",
        "parentMobile": "9087204884"
    },
    {
        "regNo": "25013635",
        "universityRegNo": "212225220007",
        "name": "AKIL",
        "room": "NBF-103",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "6374825608",
        "parentMobile": "9629943129"
    },
    {
        "regNo": "25007255",
        "universityRegNo": "212225220058",
        "name": "S.LOGESHWARAN",
        "room": "NBF-103",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "9344524564",
        "parentMobile": "8098425857"
    },
    {
        "regNo": "25010748",
        "universityRegNo": "212225220073",
        "name": "PRAVEEN J",
        "room": "NBF-103",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "7092395965",
        "parentMobile": "9840449596"
    },
    {
        "regNo": "25010246",
        "universityRegNo": "212225220091",
        "name": "SARVAJITH SIVAKUMAR SUJATHA",
        "room": "NBF-103",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "7305316443",
        "parentMobile": "8056041684"
    },
    {
        "regNo": "25008769",
        "universityRegNo": "212225230109",
        "name": "JAIHARI S",
        "room": "NBF-103",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "7092018656",
        "parentMobile": "9944038342"
    },
    {
        "regNo": "25011643",
        "universityRegNo": "212225240098",
        "name": "V.NAVEEN",
        "room": "NBF-103",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "6385313317",
        "parentMobile": "9786133172"
    },
    {
        "regNo": "25005800",
        "universityRegNo": "212225240117",
        "name": "RAMESH JAISURYA",
        "room": "NBF-103",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9966789177",
        "parentMobile": "9000489177"
    },
    {
        "regNo": "25001681",
        "universityRegNo": "212225060099",
        "name": "JASWANTH S",
        "room": "NBF-104",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9361997878",
        "parentMobile": "6369930145"
    },
    {
        "regNo": "25005989",
        "universityRegNo": "212225060144",
        "name": "V M MADHAVAN",
        "room": "NBF-104",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8122840594",
        "parentMobile": "9677375346"
    },
    {
        "regNo": "25009087",
        "universityRegNo": "212225080027",
        "name": "KRITHIK",
        "room": "NBF-104",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "9677076159",
        "parentMobile": "9443141949"
    },
    {
        "regNo": "25007668",
        "universityRegNo": "212225100050",
        "name": "SIVA R",
        "room": "NBF-104",
        "dept": "Computer Science and Engineering(Cyber Security)",
        "year": "1",
        "studentMobile": "9851073760",
        "parentMobile": "8825437194"
    },
    {
        "regNo": "25009804",
        "universityRegNo": "212225100061",
        "name": "YOGESH G",
        "room": "NBF-104",
        "dept": "Computer Science and Engineering(Cyber Security)",
        "year": "1",
        "studentMobile": "81488628466",
        "parentMobile": "9566893011"
    },
    {
        "regNo": "25011599",
        "universityRegNo": "212225230018",
        "name": "ANUGOLU RAVI TEJA ROYAL",
        "room": "NBF-104",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6301857545",
        "parentMobile": "6371774660"
    },
    {
        "regNo": "25015010",
        "universityRegNo": "212225240001",
        "name": "S AADITHYAN",
        "room": "NBF-104",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "8667553660",
        "parentMobile": "8754861130"
    },
    {
        "regNo": "25012175",
        "universityRegNo": "212225240058",
        "name": "JEENSFER JO",
        "room": "NBF-104",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "6381923940",
        "parentMobile": "9445324948"
    },
    {
        "regNo": "25013013",
        "universityRegNo": "212225240100",
        "name": "NIGIL. S",
        "room": "NBF-104",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "9384573704",
        "parentMobile": "9944252240"
    },
    {
        "regNo": "25014330",
        "universityRegNo": "212225240113",
        "name": "S.RAJAPRABU",
        "room": "NBF-104",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "9159978399",
        "parentMobile": "8778744584"
    },
    {
        "regNo": "25005367",
        "universityRegNo": "212225020057",
        "name": "V.TEJESHWAR",
        "room": "NBF-105",
        "dept": "Biomedical Engineering",
        "year": "1",
        "studentMobile": "8056036516",
        "parentMobile": "9092244669"
    },
    {
        "regNo": "25015246",
        "universityRegNo": "212225060063",
        "name": "DONTHI SAI VENKATA RAMANA",
        "room": "NBF-105",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "7780653370",
        "parentMobile": "7013884668"
    },
    {
        "regNo": "25009937",
        "universityRegNo": "212225060181",
        "name": "NAVEEN V",
        "room": "NBF-105",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8778925504",
        "parentMobile": "9943304611"
    },
    {
        "regNo": "25004183",
        "universityRegNo": "212225060202",
        "name": "K PRAGATHISHAN",
        "room": "NBF-105",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9585417236",
        "parentMobile": "9585698993"
    },
    {
        "regNo": "25012742",
        "universityRegNo": "212225060215",
        "name": "RAJURESH",
        "room": "NBF-105",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "9500265735",
        "parentMobile": "9443270820"
    },
    {
        "regNo": "25013054",
        "universityRegNo": "212225060263",
        "name": "SIBIVARSHAAN S",
        "room": "NBF-105",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9345871686",
        "parentMobile": "9786243285"
    },
    {
        "regNo": "25012054",
        "universityRegNo": "212225060279",
        "name": "SUHIN L",
        "room": "NBF-105",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9080147296",
        "parentMobile": "9965812582"
    },
    {
        "regNo": "25005684",
        "universityRegNo": "212225060315",
        "name": "YUWAN SHANTHOSH K",
        "room": "NBF-105",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "7708817521",
        "parentMobile": "7550352857"
    },
    {
        "regNo": "25013768",
        "universityRegNo": "212225230214",
        "name": "PRASANNA .P",
        "room": "NBF-105",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9342744672",
        "parentMobile": "9360931588"
    },
    {
        "regNo": "25014765",
        "universityRegNo": "212225240171",
        "name": "THARUN",
        "room": "NBF-105",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "7538837395",
        "parentMobile": "9952897744"
    },
    {
        "regNo": "25004426",
        "universityRegNo": "212225020032",
        "name": "PEARARASAN ALIAS BOSE",
        "room": "NBF-106",
        "dept": "Biomedical Engineering",
        "year": "1",
        "studentMobile": "7010395783",
        "parentMobile": "9751032852"
    },
    {
        "regNo": "25010828",
        "universityRegNo": "212225040279",
        "name": "NIHIL D",
        "room": "NBF-106",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8248482952",
        "parentMobile": "9787871487"
    },
    {
        "regNo": "25013728",
        "universityRegNo": "212225060024",
        "name": "S. ASHIK AHAMED",
        "room": "NBF-106",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9384798988",
        "parentMobile": "9842498988"
    },
    {
        "regNo": "25004515",
        "universityRegNo": "212225060137",
        "name": "LIFNO RETZIO.L",
        "room": "NBF-106",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9498196913",
        "parentMobile": "9488156913"
    },
    {
        "regNo": "25014200",
        "universityRegNo": "212225060156",
        "name": "MOHAMED JIYAAD",
        "room": "NBF-106",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "6369570105",
        "parentMobile": "6384916064"
    },
    {
        "regNo": "25009995",
        "universityRegNo": "212225060250",
        "name": "SARAN PRIYAN R",
        "room": "NBF-106",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9514336626",
        "parentMobile": "9245669440"
    },
    {
        "regNo": "25008158",
        "universityRegNo": "212225060267",
        "name": "SIVACHARAN S",
        "room": "NBF-106",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9025872448",
        "parentMobile": "9043005265"
    },
    {
        "regNo": "25009636",
        "universityRegNo": "212225230015",
        "name": "ANBUSELVAN J",
        "room": "NBF-106",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9442346050",
        "parentMobile": "9543789072"
    },
    {
        "regNo": "25013161",
        "universityRegNo": "212225230084",
        "name": "R GOPINATH",
        "room": "NBF-106",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9345744948",
        "parentMobile": "6369368465"
    },
    {
        "regNo": "25011965",
        "universityRegNo": "212225240137",
        "name": "SANTHOSH REDDY K",
        "room": "NBF-106",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "7708502888",
        "parentMobile": "6380210542"
    },
    {
        "regNo": "25014751",
        "universityRegNo": "212225230051",
        "name": "DHANUSH M",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6369762255",
        "parentMobile": "9443137829"
    },
    {
        "regNo": "25008644",
        "universityRegNo": "212225230076",
        "name": "GOKUL B",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9344323428",
        "parentMobile": "7812854445"
    },
    {
        "regNo": "25011828",
        "universityRegNo": "212225230087",
        "name": "GUNDARAPU CHAITHANYA",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "8886831913",
        "parentMobile": "9392115346"
    },
    {
        "regNo": "25011663",
        "universityRegNo": "212225230088",
        "name": "GUTHIKONDA SUSHANTH",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6303877699",
        "parentMobile": "9866154603"
    },
    {
        "regNo": "25013933",
        "universityRegNo": "212225230089",
        "name": "HARI PRASAD",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9342730740",
        "parentMobile": "9080703911"
    },
    {
        "regNo": "25014801",
        "universityRegNo": "212225230129",
        "name": "KARNAM PAREESH NAIDU",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9154239236",
        "parentMobile": "9581632422"
    },
    {
        "regNo": "25012598",
        "universityRegNo": "212225230303",
        "name": "VIMALESH KANNA MK",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9443381837",
        "parentMobile": "9952881781"
    },
    {
        "regNo": "25005365",
        "universityRegNo": "212225240050",
        "name": "HEMAVARATHAN",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "8098335568",
        "parentMobile": "9843545274"
    },
    {
        "regNo": "25004610",
        "universityRegNo": "212225240082",
        "name": "MAHITH M",
        "room": "NBF-107",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "8124281262",
        "parentMobile": "9944223366"
    },
    {
        "regNo": "25014809",
        "universityRegNo": "212225030027",
        "name": "S P SREE VARDHAN",
        "room": "NBF-108",
        "dept": "Civil Engineering",
        "year": "1",
        "studentMobile": "7812858421",
        "parentMobile": "8248311392"
    },
    {
        "regNo": "25008640",
        "universityRegNo": "212225040117",
        "name": "HARISH PRANAV K S",
        "room": "NBF-108",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "7010063604",
        "parentMobile": "8300705088"
    },
    {
        "regNo": "25013707",
        "universityRegNo": "212225040150",
        "name": "G.V JEFFRIN DINO",
        "room": "NBF-108",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8098445575",
        "parentMobile": "8098445575"
    },
    {
        "regNo": "25014734",
        "universityRegNo": "212225040282",
        "name": "NIRMAL.M",
        "room": "NBF-108",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "6380413975",
        "parentMobile": "9442973149"
    },
    {
        "regNo": "25009508",
        "universityRegNo": "212225050006",
        "name": "BAALABAARATHI P",
        "room": "NBF-108",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "9500208163",
        "parentMobile": "9566908163"
    },
    {
        "regNo": "25006748",
        "universityRegNo": "212225050013",
        "name": "M GIRIPRAKASH",
        "room": "NBF-108",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "8754661337",
        "parentMobile": "9705700098"
    },
    {
        "regNo": "25005836",
        "universityRegNo": "212225080059",
        "name": "VASANTH.S",
        "room": "NBF-108",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "8072002626",
        "parentMobile": "9944585685"
    },
    {
        "regNo": "25001152",
        "universityRegNo": "212225220061",
        "name": "MAHITH.M",
        "room": "NBF-108",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "9360722303",
        "parentMobile": "9894461423"
    },
    {
        "regNo": "25004373",
        "universityRegNo": "212225230240",
        "name": "B.SAKTHIVEL",
        "room": "NBF-108",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6379696171",
        "parentMobile": "8148937039"
    },
    {
        "regNo": "25013497",
        "universityRegNo": "212225040040",
        "name": "BALAJI B",
        "room": "NBF-109",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8300382375",
        "parentMobile": "9442370635"
    },
    {
        "regNo": "25012069",
        "universityRegNo": "212225040378",
        "name": "SANTHOSH A",
        "room": "NBF-109",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "916369419807",
        "parentMobile": "9842037608"
    },
    {
        "regNo": "25013978",
        "universityRegNo": "212225060036",
        "name": "S.BOOMESH",
        "room": "NBF-109",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8939696839",
        "parentMobile": "8939696839"
    },
    {
        "regNo": "25014833",
        "universityRegNo": "212225060230",
        "name": "U.S.RISHVANTH RAJA",
        "room": "NBF-109",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9842999555",
        "parentMobile": "7010079856"
    },
    {
        "regNo": "25014685",
        "universityRegNo": "212225080009",
        "name": "CHRIS AUGUSTO J",
        "room": "NBF-109",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "7978488040",
        "parentMobile": "7978142625"
    },
    {
        "regNo": "25015487",
        "universityRegNo": "212225220034",
        "name": "GODWIN LAWRANCE L",
        "room": "NBF-109",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "9342341053",
        "parentMobile": "9442269812"
    },
    {
        "regNo": "25011655",
        "universityRegNo": "212225230176",
        "name": "MOHAMED SARJUN M",
        "room": "NBF-109",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6385948195",
        "parentMobile": "6385948195"
    },
    {
        "regNo": "25012800",
        "universityRegNo": "212225230262",
        "name": "SHERIL.P",
        "room": "NBF-109",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9994731278",
        "parentMobile": "9943463977"
    },
    {
        "regNo": "25013725",
        "universityRegNo": "212225240059",
        "name": "JEEVANANTHAM C",
        "room": "NBF-109",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "7904798998",
        "parentMobile": "9976955113"
    },
    {
        "regNo": "25015912",
        "universityRegNo": "212225410089",
        "name": "KARTHIKEYAN S",
        "room": "NBF-109",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "8754199195",
        "parentMobile": "9443562331"
    },
    {
        "regNo": "25017572",
        "universityRegNo": "212225040190",
        "name": "KISHOOR.I",
        "room": "NBF-110",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8760474140",
        "parentMobile": "9843488548"
    },
    {
        "regNo": "25005854",
        "universityRegNo": "212225050002",
        "name": "AJAY S",
        "room": "NBF-110",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "8248407881",
        "parentMobile": "9786488831"
    },
    {
        "regNo": "25013962",
        "universityRegNo": "212225050044",
        "name": "ROHITH R",
        "room": "NBF-110",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "8122333887",
        "parentMobile": "9787974751"
    },
    {
        "regNo": "25013384",
        "universityRegNo": "212225050061",
        "name": "WINRAJAN K",
        "room": "NBF-110",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "8778810062",
        "parentMobile": "7010935594"
    },
    {
        "regNo": "25011654",
        "universityRegNo": "212225060029",
        "name": "BALAKUMARAN",
        "room": "NBF-110",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9884844663",
        "parentMobile": "7867926737"
    },
    {
        "regNo": "25018464",
        "universityRegNo": "212225080006",
        "name": "S.ARASU",
        "room": "NBF-110",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "7395980678",
        "parentMobile": "9176880678"
    },
    {
        "regNo": "25018628",
        "universityRegNo": "212225080008",
        "name": "BALAJI.S",
        "room": "NBF-110",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "8807800850",
        "parentMobile": "9585702181"
    },
    {
        "regNo": "25003270",
        "universityRegNo": "212225230022",
        "name": "ASHFAK N",
        "room": "NBF-110",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "7200849426",
        "parentMobile": "8608350214"
    },
    {
        "regNo": "25004079",
        "universityRegNo": "212225230175",
        "name": "MOHAMED HAFEES R",
        "room": "NBF-110",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6374539861",
        "parentMobile": "8098237559"
    },
    {
        "regNo": "25000819",
        "universityRegNo": "212225040109",
        "name": "HARIHARAN S",
        "room": "NBF-111",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9500320163",
        "parentMobile": "9894171592"
    },
    {
        "regNo": "25007375",
        "universityRegNo": "212225040209",
        "name": "LOKESH KUMAR",
        "room": "NBF-111",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "6382009300",
        "parentMobile": "8489591444"
    },
    {
        "regNo": "25000358",
        "universityRegNo": "212225040237",
        "name": "MOHAMED ARSATH",
        "room": "NBF-111",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8056978599",
        "parentMobile": "9629360734"
    },
    {
        "regNo": "25011967",
        "universityRegNo": "212225040276",
        "name": "R NAVEEN",
        "room": "NBF-111",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9047903600",
        "parentMobile": "9698942406"
    },
    {
        "regNo": "25009774",
        "universityRegNo": "212225040366",
        "name": "R. S. SANJAI RAM",
        "room": "NBF-111",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9994861089",
        "parentMobile": "9994861090"
    },
    {
        "regNo": "25011969",
        "universityRegNo": "212225040367",
        "name": "SANJAY.A",
        "room": "NBF-111",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "6385263715",
        "parentMobile": "9952384278"
    },
    {
        "regNo": "25011320",
        "universityRegNo": "212225040416",
        "name": "P.SIVA SUNDAR",
        "room": "NBF-111",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8870583436",
        "parentMobile": "9750503013"
    },
    {
        "regNo": "25008273",
        "universityRegNo": "212225230256",
        "name": "SEJILAN",
        "room": "NBF-111",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6382619004",
        "parentMobile": "6380132950"
    },
    {
        "regNo": "25014134",
        "universityRegNo": "212225040121",
        "name": "HARSHITH SANJAI",
        "room": "NBF-112",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "7200233114",
        "parentMobile": "9952377100"
    },
    {
        "regNo": "25012989",
        "universityRegNo": "212225040247",
        "name": "MOHAMMED AFSAL.S",
        "room": "NBF-112",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9976961697",
        "parentMobile": "9262021582"
    },
    {
        "regNo": "25011618",
        "universityRegNo": "212225080038",
        "name": "P.NITHYA PRASATH",
        "room": "NBF-112",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "6383952416",
        "parentMobile": "9443800806"
    },
    {
        "regNo": "25009906",
        "universityRegNo": "212225230157",
        "name": "MADHIYOLI",
        "room": "NBF-112",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6381604502",
        "parentMobile": "6370567067"
    },
    {
        "regNo": "25008762",
        "universityRegNo": "212225230165",
        "name": "M. MAHENDIRAN",
        "room": "NBF-112",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9942557638",
        "parentMobile": "8072806154"
    },
    {
        "regNo": "25003095",
        "universityRegNo": "212225230294",
        "name": "RAHUL",
        "room": "NBF-112",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9100714422",
        "parentMobile": "8074768710"
    },
    {
        "regNo": "25014933",
        "universityRegNo": "212225240143",
        "name": "SHAFI AHMED M S",
        "room": "NBF-112",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "7604888434",
        "parentMobile": "6383248258"
    },
    {
        "regNo": "25000201",
        "universityRegNo": "212225240176",
        "name": "N. THIRU SUBRAMANIA SAMI",
        "room": "NBF-112",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "9488586326",
        "parentMobile": "8277604424"
    },
    {
        "regNo": "25010763",
        "universityRegNo": "212225040038",
        "name": "AVINASH KARTHICK.B.M",
        "room": "NBF-113",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9366623457",
        "parentMobile": "9159273291"
    },
    {
        "regNo": "25015366",
        "universityRegNo": "212225040339",
        "name": "RITESH DP",
        "room": "NBF-113",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8825743549",
        "parentMobile": "8903500599"
    },
    {
        "regNo": "25008066",
        "universityRegNo": "212225050046",
        "name": "ROSHAN IKTHITHAR M",
        "room": "NBF-113",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "6383390822",
        "parentMobile": "9677809243"
    },
    {
        "regNo": "25014628",
        "universityRegNo": "212225080004",
        "name": "ADITHYA M",
        "room": "NBF-113",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "7548841101",
        "parentMobile": "8940101101"
    },
    {
        "regNo": "25014606",
        "universityRegNo": "212225080049",
        "name": "M. SANJITH",
        "room": "NBF-113",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "9943152078",
        "parentMobile": "9843676951"
    },
    {
        "regNo": "25015594",
        "universityRegNo": "212225220014",
        "name": "K.ASHWIN NEHREJ",
        "room": "NBF-113",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "7339183384",
        "parentMobile": "9682392717"
    },
    {
        "regNo": "25003626",
        "universityRegNo": "212225240093",
        "name": "M.MUKESH",
        "room": "NBF-113",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "8610418422",
        "parentMobile": "9597341023"
    },
    {
        "regNo": "25010815",
        "universityRegNo": "212225410065",
        "name": "B GURU PRASAD",
        "room": "NBF-113",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "8870940006",
        "parentMobile": "9894102029"
    },
    {
        "regNo": "25010774",
        "universityRegNo": "212225030011",
        "name": "S.KAMALESH",
        "room": "NBF-114",
        "dept": "Civil Engineering",
        "year": "1",
        "studentMobile": "6379953247",
        "parentMobile": "9442345771"
    },
    {
        "regNo": "25011566",
        "universityRegNo": "212225030030",
        "name": "THARUKESH A",
        "room": "NBF-114",
        "dept": "Civil Engineering",
        "year": "1",
        "studentMobile": "7397399533",
        "parentMobile": "759829533"
    },
    {
        "regNo": "25014706",
        "universityRegNo": "212225040323",
        "name": "K RAGAPRIYAN",
        "room": "NBF-114",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8825937046",
        "parentMobile": "9842584373"
    },
    {
        "regNo": "25015705",
        "universityRegNo": "212225040325",
        "name": "RAGHUL S",
        "room": "NBF-114",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9360181476",
        "parentMobile": "9488043342"
    },
    {
        "regNo": "25011402",
        "universityRegNo": "212225050048",
        "name": "SAIRAM S",
        "room": "NBF-114",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "9442070113",
        "parentMobile": "9384472864"
    },
    {
        "regNo": "25013003",
        "universityRegNo": "212225060077",
        "name": "HARESH RAGAVAN V",
        "room": "NBF-114",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9360494287",
        "parentMobile": "9944992978"
    },
    {
        "regNo": "25000783",
        "universityRegNo": "212225080012",
        "name": "GIRISH PRIYAN G",
        "room": "NBF-114",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "8124463325",
        "parentMobile": "9443989442"
    },
    {
        "regNo": "25000481",
        "universityRegNo": "212225080030",
        "name": "MOHAMED ABUBAKR S",
        "room": "NBF-114",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "9344139795",
        "parentMobile": "6382811209"
    },
    {
        "regNo": "25008056",
        "universityRegNo": "212225040353",
        "name": "S.B.SACHIN",
        "room": "NBF-115",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9342771173",
        "parentMobile": "8754001253"
    },
    {
        "regNo": "25005727",
        "universityRegNo": "212225050014",
        "name": "HARISH S",
        "room": "NBF-115",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "7397669671",
        "parentMobile": "8110811215"
    },
    {
        "regNo": "25006108",
        "universityRegNo": "212225060033",
        "name": "BHARATH S",
        "room": "NBF-115",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "7339372952",
        "parentMobile": "9788017452"
    },
    {
        "regNo": "25006078",
        "universityRegNo": "212225060068",
        "name": "GANESH.G",
        "room": "NBF-115",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "6381612552",
        "parentMobile": "9751228331"
    },
    {
        "regNo": "25006077",
        "universityRegNo": "212225220111",
        "name": "SUNDARESH K",
        "room": "NBF-115",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "9994160280",
        "parentMobile": "9790130280"
    },
    {
        "regNo": "25014364",
        "universityRegNo": "212225240142",
        "name": "SATHISH H",
        "room": "NBF-115",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "9080439611",
        "parentMobile": "9943201910"
    },
    {
        "regNo": "25001283",
        "universityRegNo": "212225240149",
        "name": "N.SIVANESH KUMAR",
        "room": "NBF-115",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "9025541429",
        "parentMobile": "9786982988"
    },
    {
        "regNo": "25012833",
        "universityRegNo": "212225240188",
        "name": "S VISHVA",
        "room": "NBF-115",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "7539977542",
        "parentMobile": "8667549100"
    },
    {
        "regNo": "25010834",
        "universityRegNo": "212225060109",
        "name": "JOSHIN",
        "room": "NBF-116",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8940049886",
        "parentMobile": "9715919061"
    },
    {
        "regNo": "25011585",
        "universityRegNo": "212225060141",
        "name": "LOGESH.S",
        "room": "NBF-116",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "7010528171",
        "parentMobile": "6379862037"
    },
    {
        "regNo": "25000588",
        "universityRegNo": "212225060171",
        "name": "MURSHID AHMED S",
        "room": "NBF-116",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8667065963",
        "parentMobile": "9965838312"
    },
    {
        "regNo": "25007847",
        "universityRegNo": "212225060189",
        "name": "NITHISH. K",
        "room": "NBF-116",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8072371582",
        "parentMobile": "9791273288"
    },
    {
        "regNo": "25013204",
        "universityRegNo": "212225060204",
        "name": "PRANAV K",
        "room": "NBF-116",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "8610507002",
        "parentMobile": "8148612092"
    },
    {
        "regNo": "25000250",
        "universityRegNo": "212225060284",
        "name": "SYED NIYAZ A",
        "room": "NBF-116",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9344786982",
        "parentMobile": "9486497249"
    },
    {
        "regNo": "25013468",
        "universityRegNo": "212225240038",
        "name": "DWIJESH RAJ SINHA Y",
        "room": "NBF-116",
        "dept": "Artificial Intelligence and Machine Learning",
        "year": "1",
        "studentMobile": "7358157779",
        "parentMobile": "9994378787"
    },
    {
        "regNo": "25001843",
        "universityRegNo": "212225410202",
        "name": "K.T. SHYAM",
        "room": "NBF-116",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "9789284027",
        "parentMobile": "9976687090"
    },
    {
        "regNo": "25005583",
        "universityRegNo": "212225050018",
        "name": "JISHO C",
        "room": "NBF-117",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "8682037365",
        "parentMobile": "9487603736"
    },
    {
        "regNo": "25010986",
        "universityRegNo": "212225080011",
        "name": "DINESH S",
        "room": "NBF-117",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "9488942252",
        "parentMobile": "9442408252"
    },
    {
        "regNo": "25015589",
        "universityRegNo": "212225230064",
        "name": "S DURGESH",
        "room": "NBF-117",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "6380653102",
        "parentMobile": "8870533774"
    },
    {
        "regNo": "25005710",
        "universityRegNo": "212225230120",
        "name": "KALAIMARAN.I",
        "room": "NBF-117",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "7010566448",
        "parentMobile": "9443466674"
    },
    {
        "regNo": "25004464",
        "universityRegNo": "212225230307",
        "name": "R.VISHAL",
        "room": "NBF-117",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "7418109150",
        "parentMobile": "9150609150"
    },
    {
        "regNo": "25003438",
        "universityRegNo": "212225410001",
        "name": "AAKASH",
        "room": "NBF-117",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "8438878090",
        "parentMobile": "9944394050"
    },
    {
        "regNo": "25006483",
        "universityRegNo": "212225410070",
        "name": "HARISH KUMAR HARI BABU",
        "room": "NBF-117",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "6381010740",
        "parentMobile": "9566637418"
    },
    {
        "regNo": "25011386",
        "universityRegNo": "212225410196",
        "name": "A.SHEIK MOHAMMED",
        "room": "NBF-117",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "7395859233",
        "parentMobile": "9003360464"
    },
    {
        "regNo": "25015393",
        "universityRegNo": "212225060271",
        "name": "SREESUNDAR",
        "room": "NBF-118",
        "dept": "Electronics and Communication Engineering",
        "year": "1",
        "studentMobile": "9488433534",
        "parentMobile": "9942427600"
    },
    {
        "regNo": "25013895",
        "universityRegNo": "212225060292",
        "name": "THILOCHAN",
        "room": "NBF-118",
        "dept": "Electrical and Electronics Engineering",
        "year": "1",
        "studentMobile": "9043624214",
        "parentMobile": "8870074050"
    },
    {
        "regNo": "25007473",
        "universityRegNo": "212225080005",
        "name": "ALAN.M",
        "room": "NBF-118",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "8122314380",
        "parentMobile": "9952246422"
    },
    {
        "regNo": "25016058",
        "universityRegNo": "212225080018",
        "name": "HIRUDHITH S",
        "room": "NBF-118",
        "dept": "Mechanical Engineering",
        "year": "1",
        "studentMobile": "7339661629",
        "parentMobile": "7200853184"
    },
    {
        "regNo": "25009105",
        "universityRegNo": "212225220071",
        "name": "M. PRADEEP",
        "room": "NBF-118",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "8056289185",
        "parentMobile": "9710789185"
    },
    {
        "regNo": "25016064",
        "universityRegNo": "212225220103",
        "name": "SRI SAI SARAN G",
        "room": "NBF-118",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "8608457048",
        "parentMobile": "8438672699"
    },
    {
        "regNo": "25016022",
        "universityRegNo": "212225230020",
        "name": "M A ARUNJUTHAN",
        "room": "NBF-118",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "8220137055",
        "parentMobile": "7502737055"
    },
    {
        "regNo": "25015695",
        "universityRegNo": "212225230290",
        "name": "VARDHAN SAI I",
        "room": "NBF-118",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "9524574762",
        "parentMobile": "9360814610"
    },
    {
        "regNo": "25009074",
        "universityRegNo": "212225030014",
        "name": "V LINGESH PANDIAN",
        "room": "NBF-119",
        "dept": "Civil Engineering",
        "year": "1",
        "studentMobile": "8098502244",
        "parentMobile": "9943746637"
    },
    {
        "regNo": "25017732",
        "universityRegNo": "212225040095",
        "name": "D R.GOKUL",
        "room": "NBF-119",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "9361816055",
        "parentMobile": "9791567058"
    },
    {
        "regNo": "25016374",
        "universityRegNo": "212225040286",
        "name": "NITHIN KAVI A.R",
        "room": "NBF-119",
        "dept": "Computer Science and Engineering",
        "year": "1",
        "studentMobile": "8015300539",
        "parentMobile": "9791530870"
    },
    {
        "regNo": "25016762",
        "universityRegNo": "212225100045",
        "name": "SARVESH",
        "room": "NBF-119",
        "dept": "Computer Science and Engineering(Cyber Security)",
        "year": "1",
        "studentMobile": "9342688864",
        "parentMobile": "9865934049"
    },
    {
        "regNo": "25008132",
        "universityRegNo": "212225220023",
        "name": "DHARSHAN BABU A",
        "room": "NBF-119",
        "dept": "Information Technology",
        "year": "1",
        "studentMobile": "6369815938",
        "parentMobile": "9443521921"
    },
    {
        "regNo": "25015509",
        "universityRegNo": "212225230040",
        "name": "DARUNBALA S",
        "room": "NBF-119",
        "dept": "Artificial Intelligence and Data Science",
        "year": "1",
        "studentMobile": "8015854867",
        "parentMobile": "9159174318"
    },
    {
        "regNo": "25000476",
        "universityRegNo": "212225410073",
        "name": "ILLAMPARITHI.K",
        "room": "NBF-119",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "8778065646",
        "parentMobile": "9486368326"
    },
    {
        "regNo": "25006617",
        "universityRegNo": "212225410092",
        "name": "B.KEERTHIVASAN",
        "room": "NBF-119",
        "dept": "Master of Busineess Administration",
        "year": "1",
        "studentMobile": "9894619283",
        "parentMobile": "8807619283"
    }
];

export const migrateStudentsToFirebase = async (onProgress, customData = null) => {
    console.log('🚀 Starting student migration to Firebase...');

    // Use custom data if provided, otherwise default to hardcoded STUDENT_DATA
    const dataToMigrate = customData || STUDENT_DATA;

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < dataToMigrate.length; i++) {
        const student = dataToMigrate[i];
        if (!student.regNo) {
            console.warn(`Skipping row ${i}: Missing regNo`, student);
            continue;
        }

        // Ensure ID is uppercase/trimmed if alphanumeric, though typically numeric
        const normalizedRegNo = student.regNo.toString().toUpperCase().trim();

        try {
            await setDoc(doc(db, 'students', normalizedRegNo), {
                regNo: student.regNo,
                universityRegNo: student.universityRegNo || '', // New Field
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
                    total: dataToMigrate.length,
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
        total: dataToMigrate.length,
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
