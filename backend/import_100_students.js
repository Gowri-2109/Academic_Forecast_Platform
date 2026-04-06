const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const rawData = `
1	III	7376231EC102	ABHISRI M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
2	III	7376231EC103	ABINAYA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
3	III	7376231EC104	ABISHEK KS	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
4	III	7376231EC106	AHMED ABU HURAIRAH M H	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
5	III	7376231EC107	AJAY A	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
6	III	7376231EC108	AKASH S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
7	III	7376231EC109	AKSHAYA G J	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
8	III	7376231EC111	ANEES FATHIMA B I	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
9	III	7376231EC113	APSARA A R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
10	III	7376231EC114	ARTHI K	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
11	III	7376231EC115	ARUN G R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
12	III	7376231EC116	ARUN R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
13	III	7376231EC117	ASHIKA A	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
14	III	7376231EC118	ASHVITHA THANYA K	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
15	III	7376231EC119	ASHWIN KUMARAN S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. DANIEL RAJ A ECE
16	III	7376231EC121	ATHEEQ SAQLAIN M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
17	III	7376231EC122	BALA BAVADHARANI R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
18	III	7376231EC123	BALAJI K A	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
19	III	7376231EC124	BARATH VIGNESH C	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
20	III	7376231EC125	BAVAN KALYAN S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
21	III	7376231EC126	BHARANEEDHAR S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
22	III	7376231EC127	BHARATHKUMAR P	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
23	III	7376231EC128	BOSEVETRIVELRAM M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
24	III	7376231EC129	CELSIA JUVANITTA J	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
25	III	7376231EC130	DARSANI T S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
26	III	7376231EC131	DEEPIKA R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
27	III	7376231EC133	DHANU SHRI V	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
28	III	7376231EC134	DHANUSRI K R R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
29	III	7376231EC135	DHANUSRI T	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
30	III	7376231EC136	DHARANISH S S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
31	III	7376231EC137	DHARSAN A K	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
32	III	7376231EC138	DHARSHINI M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
33	III	7376231EC139	DIBAGAR S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
34	III	7376231EC140	DINESH S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMYA P ECE
35	III	7376231EC141	DIVYA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
36	III	7376231EC142	DURKAIBALAN P	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
37	III	7376231EC143	ELAKKIYA R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
38	III	7376231EC144	ELAKKIYASRI S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
39	III	7376231EC145	GANGA T	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
40	III	7376231EC146	GIRIDHARAN M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
41	III	7376231EC147	GIRIJA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
42	III	7376231EC148	GOKUL PRASATH S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
43	III	7376231EC150	GOPIKA SRI E	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
44	III	7376231EC151	GOWRI N	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
45	III	7376231EC152	HARIHARAN P S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
46	III	7376231EC154	HARIPREETHI S M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
47	III	7376231EC155	HARIRAM BHARATHAN M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
48	III	7376231EC156	HARISH KARTHIC J K	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
49	III	7376231EC157	HARISH KUMAR S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
50	III	7376231EC158	HARISHMITHA R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
51	III	7376231EC159	HARISURYAPRAKASH O	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
52	III	7376231EC160	HARSHINI S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. RAMKUMAR R ECE
53	III	7376231EC161	HARSINI R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
54	III	7376231EC162	HEMA PRIYA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
55	III	7376231EC163	HEMAPRIYA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
56	III	7376231EC164	INDHU S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
57	III	7376231EC165	JAIDEV M C	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
58	III	7376231EC166	JANA KIRI G	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
59	III	7376231EC167	JANE MYSTIKA D	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
60	III	7376231EC168	JAYAPRABHA GOKUL KUMAR	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
61	III	7376231EC169	JAYASWAROOPA S M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
62	III	7376231EC170	JEFFERY SANTO J A	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
63	III	7376231EC171	JEYA PRASANNA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
64	III	7376231EC172	JOSHIKA M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
65	III	7376231EC173	JOTHIKA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
66	III	7376231EC174	KABIL M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Dr. ARUN KUMAR R AIDS
67	III	7376231EC175	KABILAN D	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
68	III	7376231EC176	KABILAN N	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
69	III	7376231EC177	KABILAN R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
70	III	7376231EC178	KAMALI KASTHURI K	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
71	III	7376231EC179	KAMALNATH V	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
72	III	7376231EC180	KAMESH S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. TAMILSELVAN S ECE
73	III	7376231EC181	KANISHKA M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
74	III	7376231EC182	KARTHIKA R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
75	III	7376231EC183	KARTHIKEYAN K	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
76	III	7376231EC184	KATHIR V B	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
77	III	7376231EC185	KAVIN R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
78	III	7376231EC186	KAVIN S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
79	III	7376231EC187	KAVIYA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
80	III	7376231EC188	KAVYA C	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
81	III	7376231EC190	KEERTHIVASAN S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
82	III	7376231EC191	KHARIZMA A	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
83	III	7376231EC192	KOUSIK A B	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
84	III	7376231EC193	KOWSIC S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
85	III	7376231EC194	KOWSIKA D	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
86	III	7376231EC196	LALITHKUMAR R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
87	III	7376231EC197	LEAH AGALYA RAJ	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
88	III	7376231EC198	LINGESH G R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
89	III	7376231EC199	LOHITH R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
90	III	7376231EC200	LUCKSHANA VR	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
91	III	7376231EC201	MADHANKUMAR E	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
92	III	7376231EC202	MADHUBALA N	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
93	III	7376231EC203	MADHUMITHA N	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
94	III	7376231EC204	MADHUMITHA S	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
95	III	7376231EC205	MALLIHARJUN M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
96	III	7376231EC206	MANIMEGALAI M	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
97	III	7376231EC207	MANISHA D	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
98	III	7376231EC208	MANOJ J	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
99	III	7376231EC209	MANOJ R	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mr. KARTHIKEYAN S ECE
100	III	7376231EC189	KEERTHIVASAN J	B. E.	ELECTRONICS AND COMMUNICATION ENGINEERING	Mrs. DHANALAKSHMI S ECE
`;

// Helper for unique emails
const usedEmails = new Set();

const generateStudentEmail = async (fullName, c, currentUserId = null) => {
    let parts = fullName.trim().split(/\s+/);
    let firstName = parts[0].toLowerCase();
    let initial = parts.length > 1 ? parts[1].replace(/[^a-zA-Z]/g, '').toLowerCase() : '';
    
    // name.ec23@bitsathy.ac.in
    let email1 = firstName + ".ec23@bitsathy.ac.in";
    let [res1] = await c.query('SELECT id FROM users WHERE email = ? AND id != IFNULL(?, -1)', [email1, currentUserId]);
    if (res1.length === 0 && !usedEmails.has(email1)) {
        usedEmails.add(email1);
        return email1;
    }
    
    // nameinitial.ec23@bitsathy.ac.in
    let email2 = firstName + initial + ".ec23@bitsathy.ac.in";
    let [res2] = await c.query('SELECT id FROM users WHERE email = ? AND id != IFNULL(?, -1)', [email2, currentUserId]);
    if (res2.length === 0 && !usedEmails.has(email2)) {
        usedEmails.add(email2);
        return email2;
    }
    
    // Fallback if both exist
    let counter = 1;
    while(true) {
        let email3 = firstName + initial + counter + ".ec23@bitsathy.ac.in";
        let [res3] = await c.query('SELECT id FROM users WHERE email = ? AND id != IFNULL(?, -1)', [email3, currentUserId]);
        if (res3.length === 0 && !usedEmails.has(email3)) {
            usedEmails.add(email3);
            return email3;
        }
        counter++;
    }
};

const generateFacultyEmail = async (fFirstName, c, currentUserId = null) => {
    let base = fFirstName.replace(/\s+/g, '').toLowerCase();
    let email = base + "@bitsathy.ac.in";
    
    let [res] = await c.query('SELECT id FROM users WHERE email = ? AND id != IFNULL(?, -1)', [email, currentUserId]);
    let counter = 1;
    while(res.length > 0 || usedEmails.has(email)) {
        email = base + counter + "@bitsathy.ac.in";
        [res] = await c.query('SELECT id FROM users WHERE email = ? AND id != IFNULL(?, -1)', [email, currentUserId]);
        counter++;
    }
    usedEmails.add(email);
    return email;
};

async function importStudents() {
    console.log("Connecting to database to import 100 students and update emails...");
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });

    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Parse rows
        const rows = rawData.trim().split('\n').filter(r => r.trim() !== '');
        let insertedStus = 0;
        let facultiesCache = {}; // name -> id

        // Get existing faculties first
        const [existingF] = await c.query('SELECT user_id, CONCAT(first_name, " ", last_name) as full_name FROM faculty_profiles');
        for (let f of existingF) {
            facultiesCache[f.full_name.trim().toLowerCase()] = f.user_id;
        }

        for (let row of rows) {
            const cols = row.split('\t');
            if (cols.length < 7) continue;

            const sno = cols[0].trim();
            const semesterStr = cols[1].trim(); // III
            const semesterNum = semesterStr === 'III' ? 3 : 5;
            const regNo = cols[2].trim();
            const name = cols[3].trim();
            const degree = cols[4].trim(); // B. E.
            const dept = cols[5].trim();
            const assignedFacultyRaw = cols[6].trim();

            console.log("Processing", name, "-", assignedFacultyRaw);

            // 1. Resolve Faculty
            let checkKey = assignedFacultyRaw.toLowerCase();
            
            // Map the excel string to the existing faculty name in DB if possible
            if (checkKey.includes('daniel raj')) checkKey = 'dr. daniel raj  a';
            else if (checkKey.includes('ramya')) checkKey = 'dr. ramya p';
            else if (checkKey.includes('ramkumar')) checkKey = 'dr. ramkumar r';
            else if (checkKey.includes('tamilselvan')) checkKey = 'mr. tamilselvan s';
            else if (checkKey.includes('arun kumar r aids')) checkKey = 'dr. arun kumar r aids';
            else if (checkKey.includes('dhanalakshmi')) checkKey = 'mrs. dhanalakshmi  s';
            else if (checkKey.includes('karthikeyan')) checkKey = 'mr. karthikeyan  s';

            let targetFacultyId = null;
            let pieces = assignedFacultyRaw.split(' ');
            let fTitle = pieces[0];
            let fFirstName = pieces.slice(1, -2).join(' ') || "Unknown";
            let fDept = pieces[pieces.length-1];
            const fFullName = fTitle + " " + fFirstName + " " + fDept;
            
            if (facultiesCache[checkKey]) {
                targetFacultyId = facultiesCache[checkKey];
                
                // Update faculty email
                const email = await generateFacultyEmail(fFirstName, c, targetFacultyId);
                await c.query("UPDATE users SET email = ? WHERE id = ?", [email, targetFacultyId]);
                
            } else {
                const email = await generateFacultyEmail(fFirstName, c);
                const [insU] = await c.query(
                    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    [assignedFacultyRaw, email, hashedPassword, 'Faculty']
                );
                targetFacultyId = insU.insertId;
                await c.query(
                    "INSERT INTO faculty_profiles (user_id, first_name, last_name, department) VALUES (?, ?, ?, ?)",
                    [targetFacultyId, fTitle, fFirstName, fDept]
                );
                facultiesCache[checkKey] = targetFacultyId;
            }

            // 2. Create Student
            const [ex] = await c.query("SELECT id FROM students WHERE register_number = ?", [regNo]);
            let sId;
            if (ex.length > 0) {
                sId = ex[0].id;
                
                // Update student email
                const stuEmail = await generateStudentEmail(name, c, sId);
                await c.query("UPDATE users SET email = ? WHERE id = ?", [stuEmail, sId]);
            } else {
                const stuEmail = await generateStudentEmail(name, c);
                const [stuU] = await c.query(
                    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    [name, stuEmail, hashedPassword, 'Student']
                );
                sId = stuU.insertId;

                await c.query(
                    "INSERT INTO students (id, name, register_number, department, semester) VALUES (?, ?, ?, ?, ?)",
                    [sId, name, regNo, dept, semesterNum]
                );
            }

            // 3. Assign Student
            const [asgn] = await c.query('SELECT id FROM student_assignments WHERE student_id = ?', [sId]);
            if (asgn.length === 0) {
                await c.query('INSERT INTO student_assignments (faculty_id, student_id) VALUES (?, ?)', [targetFacultyId, sId]);
            } else {
                await c.query('UPDATE student_assignments SET faculty_id = ? WHERE student_id = ?', [targetFacultyId, sId]);
            }
            insertedStus++;
        }

        console.log("Successfully processed and updated emails for " + insertedStus + " students.");
    } catch(err) {
        console.error("Import failed:", err);
    } finally {
        await c.end();
    }
}

importStudents();
