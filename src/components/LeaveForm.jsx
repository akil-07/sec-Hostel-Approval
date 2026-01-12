import React, { useState } from 'react';

const LeaveForm = ({ regNo, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        regNo: regNo,
        name: '',
        year: '',
        dept: '',
        studentMobile: '',
        parentMobile: '',
        room: '',
        reason: '',
        floorInCharge: '',
        leaveDates: '',
        numDays: '',
        leavingDate: '',
        outTime: '',
        returnDate: '',
        letterSigned: 'No',
        fileData: '',
        fileName: '',
        mimeType: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    fileData: reader.result,
                    fileName: file.name,
                    mimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="glass-card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>New Leave Application</h3>
            <form onSubmit={handleSubmit}>
                <div className="grid-2">
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Register Number</label>
                        <input name="regNo" value={formData.regNo} readOnly style={{ opacity: 0.7 }} />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Student Name</label>
                        <input name="name" placeholder="Full Name" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Year of Study</label>
                        <select name="year" onChange={handleChange} required>
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Department</label>
                        <input name="dept" placeholder="e.g. CSE" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Student Mobile</label>
                        <input name="studentMobile" placeholder="Number" type="tel" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Parent Mobile</label>
                        <input name="parentMobile" placeholder="Number" type="tel" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Room Number</label>
                        <input name="room" placeholder="Room No" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Floor In-Charge</label>
                        <input name="floorInCharge" placeholder="Name" onChange={handleChange} required />
                    </div>
                </div>

                <label className="block text-sm mb-1 text-gray-400">Reason for Leave</label>
                <textarea name="reason" rows="2" onChange={handleChange} required></textarea>

                <div className="grid-2">
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Leaving Date</label>
                        <input name="leavingDate" type="date" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Out Time</label>
                        <input name="outTime" type="time" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Return Date</label>
                        <input name="returnDate" type="date" onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">No. of Days</label>
                        <input name="numDays" type="number" onChange={handleChange} required />
                    </div>
                </div>

                <div className="grid-2">
                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Letter Signed by HoD?</label>
                        <select name="letterSigned" onChange={handleChange} required>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                    {formData.letterSigned === 'Yes' && (
                        <div>
                            <label className="block text-sm mb-1 text-gray-400">Upload Letter Photo</label>
                            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} required />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Request</button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default LeaveForm;
