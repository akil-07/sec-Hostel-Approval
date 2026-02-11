import React, { useState, useEffect } from 'react';
import { getStudentInfo } from '../data/students';
import { fetchWardens } from '../api';

const LeaveForm = ({ regNo, onSubmit, onCancel }) => {
    const [uploading, setUploading] = useState(false);
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

    // Load wardens
    useEffect(() => {
        const loadWardens = async () => {
            try {
                const wardens = await fetchWardens();
                setAvailableWardens(wardens);
            } catch (err) {
                console.error("Failed to load wardens", err);
            }
        };
        loadWardens();
    }, []);

    // Auto-fill name and room when regNo is available
    useEffect(() => {
        console.log('🔍 Auto-fill check - RegNo:', regNo);
        if (regNo) {
            const studentInfo = getStudentInfo(regNo);
            console.log('📊 Student info found:', studentInfo);
            if (studentInfo) {
                console.log('✅ Auto-filling:', { name: studentInfo.name, room: studentInfo.room });
                setFormData(prev => ({
                    ...prev,
                    name: studentInfo.name || prev.name,
                    room: studentInfo.room || prev.room
                }));
            } else {
                console.log('❌ No student data found for RegNo:', regNo);
            }
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>New Leave Application</h3>
            <form onSubmit={handleSubmit}>
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
                        <select name="year" onChange={handleChange} required>
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>
                    <div>
                        <label>Department</label>
                        <input name="dept" placeholder="e.g. CSE" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Student Mobile</label>
                        <input name="studentMobile" placeholder="Number" type="tel" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Parent Mobile</label>
                        <input name="parentMobile" placeholder="Number" type="tel" onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Room Number</label>
                        <input name="room" value={formData.room} placeholder="Room No" onChange={handleChange} required />
                    </div>
                </div>

                <div className="mt-4">
                    <label>Reason for Leave</label>
                    <textarea name="reason" rows="3" onChange={handleChange} required placeholder="Briefly explain why you are taking leave..."></textarea>
                </div>

                <div className="grid-2 mt-4">
                    <div>
                        <label>Leaving Date</label>
                        <input name="leavingDate" type="date" onChange={handleChange} required />
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
