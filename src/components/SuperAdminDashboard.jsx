import React, { useState, useEffect } from 'react';
import { addStudent, addWarden, fetchWardens, deleteAllLeaveRequests, fetchConfig, updateConfig, fetchAllStudents, deleteStudent, deleteWarden, deleteAllStudents } from '../api';
import * as XLSX from 'xlsx';
import { migrateStudentsToFirebase, checkMigrationStatus } from '../utils/migrateStudents';

const SuperAdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('students'); // 'students', 'wardens', 'settings', 'clean'
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('Initializing...');
    const [studentForm, setStudentForm] = useState({
        regNo: '',
        name: '',
        room: '',
        year: '',
        dept: ''
    });
    const [wardenForm, setWardenForm] = useState({
        name: '',
        password: ''
    });
    const [config, setConfig] = useState({ is24HourRuleEnabled: false });
    const [statusMsg, setStatusMsg] = useState('');
    const [existingWardens, setExistingWardens] = useState([]);
    const [cleaning, setCleaning] = useState(false);
    const [existingStudents, setExistingStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [migrating, setMigrating] = useState(false);
    const [migrationProgress, setMigrationProgress] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [uploadStats, setUploadStats] = useState(null);

    // Helper: Timeout for promises that returns a fallback value instead of throwing
    const withTimeout = (promise, ms, fallbackValue) => {
        return Promise.race([
            promise,
            new Promise((resolve) => setTimeout(() => {
                console.warn("Request timed out, using fallback.");
                resolve(fallbackValue);
            }, ms))
        ]);
    };

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setLoadingText('Syncing...');
        setStatusMsg('');

        try {
            // Fetch all data in parallel with timeouts (10s), defaulting to empty arrays if they time out
            const [wardens, students, globalConfig] = await Promise.all([
                withTimeout(fetchWardens(), 10000, null),
                withTimeout(fetchAllStudents(), 10000, null),
                withTimeout(fetchConfig(), 10000, null)
            ]);

            // processing results
            const failedList = [];

            if (wardens !== null) setExistingWardens(wardens);
            else failedList.push("Wardens");

            if (students !== null) setExistingStudents(students);
            else failedList.push("Students");

            if (globalConfig !== null) setConfig(globalConfig);
            else failedList.push("Config");

            if (failedList.length > 0) {
                setStatusMsg(`⚠️ Offline Mode: Could not sync ${failedList.join(", ")}. Using empty/default data.`);
            } else {
                // optional success message, or just clear
                // setStatusMsg("✅ Data synced successfully");
            }

        } catch (error) {
            console.error("System error loading data:", error);
            setStatusMsg("❌ System Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            await addStudent(studentForm);
            setStatusMsg(`✅ Student ${studentForm.name} added successfully!`);
            setStudentForm({ regNo: '', name: '', room: '', year: '', dept: '' }); // Reset
            loadData();
        } catch (error) {
            setStatusMsg(`❌ Error adding student: ${error.message}`);
        }
    };

    const handleDeleteStudent = async (regNo) => {
        if (!window.confirm(`Are you sure you want to delete student ${regNo}?`)) return;
        try {
            await deleteStudent(regNo);
            setStatusMsg(`✅ Student ${regNo} deleted successfully.`);

            // Optimistic update: Remove from local state immediately
            setExistingStudents(prev => prev.filter(s => s.id !== regNo && s.regNo !== regNo));

        } catch (error) {
            setStatusMsg(`❌ Error deleting student: ${error.message}`);
            // If error, maybe reload to be safe
            loadData();
        }
    };

    const handleWardenSubmit = async (e) => {
        e.preventDefault();
        try {
            await addWarden(wardenForm);
            setStatusMsg(`✅ Warden ${wardenForm.name} added successfully!`);
            setWardenForm({ name: '', password: '' });
            loadData(); // Refresh list
        } catch (error) {
            setStatusMsg(`❌ Error adding warden: ${error.message}`);
        }
    };

    const handleDeleteWarden = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete warden ${name}?`)) return;
        try {
            await deleteWarden(id);
            setStatusMsg(`✅ Warden ${name} deleted successfully.`);
            loadData();
        } catch (error) {
            setStatusMsg(`❌ Error deleting warden: ${error.message}`);
        }
    };

    const handleConfigToggle = async () => {
        const newConfig = { ...config, is24HourRuleEnabled: !config.is24HourRuleEnabled };
        try {
            await updateConfig(newConfig);
            setConfig(newConfig);
            setStatusMsg(`✅ 24-Hour Rule is now ${newConfig.is24HourRuleEnabled ? 'ENABLED' : 'DISABLED'}`);
        } catch (error) {
            setStatusMsg(`❌ Error updating config: ${error.message}`);
        }
    };

    const handleCleanup = async () => {
        if (!window.confirm("⚠️ WARNING: This will PERMANENTLY DELETE ALL leave requests and their attached photos from the database.\n\nThis action CANNOT be undone.\n\nAre you sure you want to clear all storage to free up space?")) {
            return;
        }

        setCleaning(true);
        setStatusMsg("⏳ Deleting requests... Please wait...");

        try {
            const result = await deleteAllLeaveRequests();
            if (result.count === 0) {
                setStatusMsg("ℹ️ Database is already empty.");
            } else {
                setStatusMsg(`✅ Successfully deleted ${result.count} requests and reclaimed storage space.`);
            }
        } catch (error) {
            setStatusMsg(`❌ Error cleaning database: ${error.message}`);
        } finally {
            setCleaning(false);
        }
    };

    const handleMigration = async (customData = null) => {
        let confirmMsg = "📤 MIGRATE STUDENTS TO FIREBASE\n\n";

        if (customData) {
            confirmMsg += `You are about to upload ${customData.length} students from your file.\n\nExisting students with the same Register Number will be updated.\n\nDo you want to proceed?`;
        } else {
            confirmMsg += `This will upload the default backup list (approx 171 students) to Firebase.\n\nExisting students will be updated (merged).\n\nDo you want to proceed?`;
        }

        if (!window.confirm(confirmMsg)) {
            return;
        }

        setMigrating(true);
        const total = customData ? customData.length : 171; // Default is approx 171
        setMigrationProgress({ current: 0, total: total, successCount: 0, errorCount: 0 });
        setStatusMsg("⏳ Starting migration... Please wait...");

        try {
            const result = await migrateStudentsToFirebase((progress) => {
                setMigrationProgress(progress);
                setStatusMsg(`⏳ Migrating students: ${progress.current}/${progress.total} (${progress.successCount} successful)`);
            }, customData);

            if (result.success) {
                setStatusMsg(`✅ Successfully migrated ${result.successCount} students to Firebase!`);
                setParsedData(null); // Reset upload state
                setUploadStats(null);
            } else {
                setStatusMsg(`⚠️ Migration completed with ${result.errorCount} errors. ${result.successCount} students uploaded successfully.`);
            }

            // Reload student list
            await loadData();
        } catch (error) {
            setStatusMsg(`❌ Migration failed: ${error.message}`);
        } finally {
            setMigrating(false);
            setMigrationProgress(null);
        }
    };

    const handleDeleteAllStudents = async () => {
        if (!window.confirm("⚠️ CRITICAL WARNING: DELETE ALL STUDENTS?\n\nThis will PERMANENTLY DELETE ALL student records from the database.\n\nStudents will not be able to login or request leave until they are re-added.\n\nType 'DELETE' to confirm.")) {
            return;
        }

        // Double confirmation prompt (simulated by just checking result, in real app maybe prompt input)
        // Since prompt is not reliable in all environments, I'll stick to a strong confirm.
        if (!window.confirm("Are you really sure? This action cannot be undone.")) return;

        setMigrating(true); // Reuse migrating state to block interactions
        setStatusMsg("⏳ Deleting all students...");

        try {
            const result = await deleteAllStudents();
            setStatusMsg(`✅ Successfully deleted ${result.count} students.`);
            await loadData();
        } catch (error) {
            setStatusMsg(`❌ Error deleting students: ${error.message}`);
        } finally {
            setMigrating(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatusMsg("⏳ Parsing file...");
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const wsname = workbook.SheetNames[0];
                const ws = workbook.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Flexible mapping logic
                const mappedData = data.map(row => {
                    // Normalize Year
                    let year = (row['Year'] || row['year'] || '').toString().trim();
                    if (year === 'I' || year === '1') year = '1';
                    else if (year === 'II' || year === '2') year = '2';
                    else if (year === 'III' || year === '3') year = '3';
                    else if (year === 'IV' || year === '4') year = '4';

                    return {
                        regNo: (row['Roll Number'] || row['Roll No'] || row['regNo'] || '').toString().trim(),
                        universityRegNo: (row['Register Number'] || row['Register No'] || row['universityRegNo'] || '').toString().trim(),
                        name: (row['Student Name'] || row['Name'] || row['name'] || '').trim(),
                        room: (row['Room Number'] || row['Room'] || row['room'] || '').trim(),
                        dept: (row['Department'] || row['Dept'] || row['dept'] || '').trim(),
                        year: year,
                        studentMobile: (row['Student Mobile Number'] || row['Mobile'] || row['studentMobile'] || '').toString().trim(),
                        parentMobile: (row['Parent Mobile Number'] || row['Parent Mobile'] || row['parentMobile'] || '').toString().trim()
                    };
                }).filter(s => s.regNo && s.name); // Basic validation

                if (mappedData.length === 0) {
                    setStatusMsg("❌ No valid student data found in file. Check column names.");
                    setParsedData(null);
                    setUploadStats(null);
                    return;
                }

                setParsedData(mappedData);
                setUploadStats(`${mappedData.length}`);
                setStatusMsg(`✅ File parsed: ${mappedData.length} students ready to upload.`);

            } catch (err) {
                console.error(err);
                setStatusMsg("❌ Error parsing file: " + err.message);
                setParsedData(null);
                setUploadStats(null);
            }
        };
        reader.readAsBinaryString(file);
    };

    // Safe filtering logic
    const safeStudents = Array.isArray(existingStudents) ? existingStudents : [];
    const filteredStudents = safeStudents.filter(s => {
        const term = (searchTerm || '').toLowerCase();
        return (
            (s.name && s.name.toLowerCase().includes(term)) ||
            (s.regNo && s.regNo.toString().toLowerCase().includes(term)) ||
            (s.id && s.id.toString().toLowerCase().includes(term))
        );
    });

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <p>Loading Dashboard...</p>
                <small style={{ color: '#6b7280', marginTop: '0.5rem' }}>{loadingText}</small>
            </div>
        );
    }

    return (
        <div className="container">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '50px', borderRadius: '5px' }} />
                    <div>
                        <h1 className="page-title">Super Admin Portal</h1>
                        <p className="page-subtitle">Manage system users and configurations</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={loadData} title="Retry Sync">🔄 Sync</button>
                    <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {statusMsg && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: statusMsg.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : statusMsg.includes('ℹ️') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: statusMsg.includes('✅') ? '#047857' : statusMsg.includes('ℹ️') ? '#1d4ed8' : '#b91c1c',
                    border: `1px solid ${statusMsg.includes('✅') ? '#059669' : statusMsg.includes('ℹ️') ? '#2563eb' : '#dc2626'}`
                }}>
                    {statusMsg}
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', flexWrap: 'wrap' }}>
                <button
                    className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('students'); setStatusMsg(''); }}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, flex: 1 }}
                >
                    Manage Students
                </button>
                <button
                    className={`btn ${activeTab === 'wardens' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('wardens'); setStatusMsg(''); }}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, flex: 1 }}
                >
                    Manage Wardens
                </button>
                <button
                    className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('settings'); setStatusMsg(''); }}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, flex: 1 }}
                >
                    Settings (Rules)
                </button>
                <button
                    className={`btn ${activeTab === 'clean' ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('clean'); setStatusMsg(''); }}
                    style={{
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        backgroundColor: activeTab === 'clean' ? '#dc2626' : undefined,
                        color: activeTab === 'clean' ? 'white' : undefined,
                        flex: 1
                    }}
                >
                    Cleanup
                </button>
            </div>

            {activeTab === 'students' ? (
                <div className="card">
                    {/* Student Data Management Section */}
                    <div style={{
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#111827', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📂 Student Data Management
                        </h3>
                        <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.5' }}>
                            Manage the student database in bulk. You can upload a new Excel file to add/update students or clear the entire database.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Upload Section */}
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: 'var(--radius-sm)', border: '1px solid #e5e7eb' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>📤 Upload / Update</h4>
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                                    Upload an Excel file (.xlsx) with columns: <strong>Roll Number, Register Number, Student Name, Room Number, Department, Year, Mobile</strong>.
                                </p>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    style={{ marginBottom: '0.5rem', width: '100%', fontSize: '0.9rem' }}
                                    disabled={migrating}
                                />
                                {uploadStats && (
                                    <div style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '0.5rem' }}>
                                        ✅ Ready to upload {uploadStats} students
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleMigration(parsedData)} // Pass parsed data
                                        disabled={!parsedData || migrating}
                                        style={{ width: '100%', fontSize: '0.9rem' }}
                                    >
                                        {migrating ? 'Uploading...' : '🚀 Start Upload'}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleMigration(null)} // Pass null to use default
                                        disabled={migrating}
                                        title="Restore from default backup"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        🔄 Restore Defaults
                                    </button>
                                </div>

                            </div>

                            {/* Delete Section */}
                            <div style={{ padding: '1rem', background: '#fff1f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#b91c1c' }}>🗑️ Delete All Data</h4>
                                <p style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: '1rem' }}>
                                    Permanently delete <strong>ALL</strong> {existingStudents.length} student records. This cannot be undone.
                                </p>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDeleteAllStudents}
                                    disabled={migrating || existingStudents.length === 0}
                                    style={{ width: '100%', fontSize: '0.9rem' }}
                                >
                                    🗑️ Delete All Students
                                </button>
                            </div>
                        </div>

                        {migrationProgress && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: 'var(--radius-sm)', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                                    Progress: {migrationProgress.current}/{migrationProgress.total} students
                                </div>
                                <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        background: '#3b82f6',
                                        height: '100%',
                                        width: `${(migrationProgress.current / migrationProgress.total) * 100}%`,
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <h3 style={{ marginTop: 0 }}>Add New Student</h3>
                    <form onSubmit={handleStudentSubmit} style={{ marginBottom: '2rem' }}>
                        <div className="grid-2">
                            <div className="mb-2">
                                <label>Register Number</label>
                                <input
                                    value={studentForm.regNo}
                                    onChange={(e) => setStudentForm({ ...studentForm, regNo: e.target.value.toUpperCase() })}
                                    placeholder="e.g. 913121104001"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label>Student Name</label>
                                <input
                                    value={studentForm.name}
                                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label>Room Number</label>
                                <input
                                    value={studentForm.room}
                                    onChange={(e) => setStudentForm({ ...studentForm, room: e.target.value })}
                                    placeholder="e.g. NBF-101"
                                    required

                                />
                            </div>
                            <div className="mb-2">
                                <label>Year</label>
                                <select
                                    value={studentForm.year}
                                    onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                                    required
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label>Department</label>
                                <input
                                    value={studentForm.dept}
                                    onChange={(e) => setStudentForm({ ...studentForm, dept: e.target.value })}
                                    placeholder="e.g. CSE"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Add Student
                        </button>
                    </form>

                    <h3 style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>All Students ({existingStudents.length})</h3>

                    <div className="mb-2">
                        <input
                            placeholder="🔍 Search by Name or Register Number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem' }}
                        />
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ background: 'var(--bg-color)', textAlign: 'left' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem' }}>Reg No</th>
                                    <th style={{ padding: '0.75rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem' }}>Room</th>
                                    <th style={{ padding: '0.75rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{s.id || s.regNo}</td>
                                        <td style={{ padding: '0.75rem' }}>{s.name}</td>
                                        <td style={{ padding: '0.75rem' }}>{s.room}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                                onClick={() => handleDeleteStudent(s.id || s.regNo)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No students found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            ) : activeTab === 'wardens' ? (
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Add New Warden</h3>
                    <form onSubmit={handleWardenSubmit} style={{ marginBottom: '2rem' }}>
                        <div className="grid-2">
                            <div className="mb-2">
                                <label>Warden Name</label>
                                <input
                                    value={wardenForm.name}
                                    onChange={(e) => setWardenForm({ ...wardenForm, name: e.target.value })}
                                    placeholder="e.g. New Warden"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label>Password</label>
                                <input
                                    value={wardenForm.password}
                                    onChange={(e) => setWardenForm({ ...wardenForm, password: e.target.value })}
                                    placeholder="Set Password"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Add Warden
                        </button>
                    </form>

                    <h4 style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>Existing Wardens (Firestore)</h4>
                    {existingWardens.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {existingWardens.map((w, idx) => (
                                <li key={idx} style={{ padding: '0.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>👤 <strong>{w.name}</strong></span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password: {w.password}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No dynamic wardens added yet. (System uses hardcoded defaults for now)</p>
                    )}
                </div>
            ) : activeTab === 'settings' ? (
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Rules & Configuration</h3>

                    <div style={{
                        padding: '1.5rem',
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>24-Hour Advance Notice Rule</h4>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                If enabled, students can only apply for leave if the leaving date is at least 24 hours from now.<br />
                                <small>Emergency requests bypass this rule.</small>
                            </p>
                        </div>
                        <div className="toggle-switch-container">
                            <button
                                className={`btn ${config.is24HourRuleEnabled ? 'btn-success' : 'btn-secondary'}`}
                                onClick={handleConfigToggle}
                            >
                                {config.is24HourRuleEnabled ? 'ENABLED' : 'DISABLED'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ border: '1px solid #fecaca', background: '#fff1f2' }}>
                    {/* Cleanup Code (Same as before) */}
                    <h3 style={{ marginTop: 0, color: '#b91c1c' }}>⚠️ Danger Zone: Database Cleanup</h3>
                    <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
                        This action allows you to manage the database storage by deleting old leave requests.
                        Since photos are stored directly in the database, deleting requests will <strong>immediately free up storage space</strong>.
                    </p>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #fca5a5' }}>
                        <h4 style={{ marginTop: 0 }}>Clear All Leave Requests</h4>
                        <p>This will delete <strong>ALL</strong> past and pending leave requests and their attached images.</p>
                        <p><strong>Note:</strong> Student and Warden accounts will NOT be deleted.</p>

                        <button
                            className="btn btn-danger"
                            style={{ backgroundColor: '#dc2626', color: 'white', marginTop: '1rem' }}
                            onClick={handleCleanup}
                            disabled={cleaning}
                        >
                            {cleaning ? '🗑️ Deleting...' : '🗑️ Delete All Requests & Photos'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SuperAdminDashboard;
