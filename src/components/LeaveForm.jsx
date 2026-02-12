import React, { useState, useEffect } from 'react';
import { getStudentInfo } from '../data/students';
import { fetchWardens, fetchStudent, addStudent, fetchConfig } from '../api';

const LeaveForm = ({ regNo, onSubmit, onCancel }) => {
    // ... existing state ...
    const [uploading, setUploading] = useState(false);
    const [config, setConfig] = useState({ is24HourRuleEnabled: false });
    const [isEmergency, setIsEmergency] = useState(false);

    const [formData, setFormData] = useState({
        regNo: regNo,
        name: '',
        year: '',
        dept: '',
        studentMobile: '',
        parentMobile: '',
        room: '',
        reason: '',
        leaveDates: '',
        numDays: '',
        leavingDate: '',
        outTime: '',
        returnDate: '',
        letterSigned: 'No',
        fileData: '',
        fileName: '',
        mimeType: '',
        warden: ''
    });
    const [availableWardens, setAvailableWardens] = useState([]);

    // Load wardens and config
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const wardens = await fetchWardens();
                setAvailableWardens(wardens);

                const globalConfig = await fetchConfig();
                setConfig(globalConfig);
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        };
        loadInitialData();
    }, []);

    // Auto-fill student data (Firestore -> Static fallback)
    useEffect(() => {
        const loadStudentData = async () => {
            if (!regNo) return;

            console.log('🔍 Checking for saved student profile:', regNo);

            // 1. Try Firestore First (Saved Profile)
            const savedProfile = await fetchStudent(regNo);

            if (savedProfile) {
                console.log('✅ Found saved profile:', savedProfile);
                setFormData(prev => ({
                    ...prev,
                    name: savedProfile.name || prev.name,
                    room: savedProfile.room || prev.room,
                    year: savedProfile.year || prev.year,
                    dept: savedProfile.dept || prev.dept,
                    studentMobile: savedProfile.studentMobile || prev.studentMobile,
                    parentMobile: savedProfile.parentMobile || prev.parentMobile,
                    warden: savedProfile.warden || prev.warden
                }));
            } else {
                // 2. Fallback to Static Data (First time user)
                const staticInfo = getStudentInfo(regNo);
                if (staticInfo) {
                    console.log('ℹ️ Using static fallback data:', staticInfo);
                    setFormData(prev => ({
                        ...prev,
                        name: staticInfo.name || prev.name,
                        room: staticInfo.room || prev.room
                    }));
                }
            }
        };
        loadStudentData();
    }, [regNo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Store raw file for Firebase Storage
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    fileData: reader.result, // Keep base64 for preview or GAS backup if needed
                    rawFile: file,           // Add raw file for Firebase Storage
                    fileName: file.name,
                    mimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const check24HourRule = () => {
        if (!config.is24HourRuleEnabled) return true; // Rule disabled
        if (isEmergency) return true; // Emergency bypass

        if (!formData.leavingDate || !formData.outTime) return true; // Data not ready

        const leaveDateTime = new Date(`${formData.leavingDate}T${formData.outTime}`);
        const now = new Date();
        const diffInHours = (leaveDateTime - now) / (1000 * 60 * 60);

        return diffInHours >= 24;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 24 Hour Rule Check
        if (!check24HourRule()) {
            alert("⚠️ 24-HOUR NOTICE REQUIRED\n\nThe Leave Application mode is currently restricted. You must apply at least 24 hours in advance.\n\nFor urgent matters, please check 'Emergency Request' to bypass this rule.");
            return;
        }

        setUploading(true);

        const finalData = {
            ...formData,
            requestType: isEmergency ? 'Emergency' : 'Normal'
        };

        // Save Profile for next time (Add "Default" behavior)
        const profileData = {
            regNo: formData.regNo,
            name: formData.name,
            year: formData.year,
            dept: formData.dept,
            studentMobile: formData.studentMobile,
            parentMobile: formData.parentMobile,
            room: formData.room,
            warden: formData.warden // Save preferred warden too!
        };

        try {
            await addStudent(profileData); // Save/Update to 'students' collection
            console.log("✅ Student profile updated/saved as default.");
        } catch (err) {
            console.warn("⚠️ Failed to save student profile (non-critical):", err);
        }

        try {
            await onSubmit(finalData);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>New Leave Application</h3>
                {config.is24HourRuleEnabled && (
                    <div style={{ background: '#fffbeb', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fcd34d', fontSize: '0.85rem', color: '#b45309' }}>
                        ⚠️ 24hr Notice Active
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                {config.is24HourRuleEnabled && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: isEmergency ? '#fee2e2' : 'var(--bg-color)',
                        border: isEmergency ? '1px solid #f87171' : '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                id="emergencyCheck"
                                checked={isEmergency}
                                onChange={(e) => setIsEmergency(e.target.checked)}
                                style={{
                                    transform: 'scale(1.2)',
                                    width: 'auto',
                                    margin: 0,
                                    cursor: 'pointer'
                                }}
                            />
                            <label htmlFor="emergencyCheck" style={{ fontWeight: '600', color: isEmergency ? '#dc2626' : 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                This is an EMERGENCY Request
                            </label>
                        </div>
                        <p style={{ margin: '0 0 0 2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Check this only for urgent medical or family emergencies. This will be flagged to the warden.
                        </p>
                    </div>
                )}

                <div className="grid-2">
                    <div>
                        <label>Register Number</label>
                        <input name="regNo" value={formData.regNo} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>
                    <div>
                        <label>Student Name</label>
                        <input name="name" value={formData.name} placeholder="Full Name" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Year of Study</label>
                        <select name="year" value={formData.year} onChange={handleChange} required>
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>
                    <div>
                        <label>Department</label>
                        <input name="dept" value={formData.dept} placeholder="e.g. CSE" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Student Mobile</label>
                        <input name="studentMobile" value={formData.studentMobile} placeholder="Number" type="tel" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Parent Mobile</label>
                        <input name="parentMobile" value={formData.parentMobile} placeholder="Number" type="tel" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Room Number</label>
                        <input name="room" value={formData.room} placeholder="Room No" onChange={handleChange} required />
                    </div>
                </div>

                <div className="mt-4">
                    <label>Reason for Leave</label>
                    <textarea name="reason" value={formData.reason} rows="3" onChange={handleChange} required placeholder="Briefly explain why you are taking leave..."></textarea>
                </div>

                <div className="grid-2 mt-4">
                    <div>
                        <label>Leaving Date</label>
                        <input name="leavingDate" type="date" value={formData.leavingDate} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Out Time</label>
                        <input name="outTime" type="time" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Return Date</label>
                        <input name="returnDate" type="date" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>No. of Days</label>
                        <input name="numDays" type="number" min="1" onChange={handleChange} required />
                    </div>
                </div>

                <div className="grid-2 mt-4">
                    <div>
                        <label>Select Your Warden</label>
                        <select name="warden" value={formData.warden} onChange={handleChange} required>
                            <option value="">Choose Warden...</option>
                            {availableWardens.length > 0 ? (
                                availableWardens.map((w) => (
                                    <option key={w.id} value={w.name}>{w.name}</option>
                                ))
                            ) : (
                                <>
                                    <option value="Pavithrakannan">Pavithrakannan</option>
                                    <option value="Somu">Somu</option>
                                    <option value="Raguram">Raguram</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div>
                        <label>Letter Signed by HoD?</label>
                        <select name="letterSigned" onChange={handleChange} required>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                    {formData.letterSigned === 'Yes' && (
                        <div>
                            <label>Upload Letter Photo</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                required
                                style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                            />
                            <small className="text-muted">Supports Images or PDF</small>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                        {uploading ? '📤 Uploading...' : 'Submit Application'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={uploading} style={{ flex: 1 }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default LeaveForm;
