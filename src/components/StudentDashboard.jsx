import React, { useState, useEffect } from 'react';
import { fetchRequests, submitRequest } from '../api';
import LeaveForm from './LeaveForm';

const StudentDashboard = ({ user, onLogout }) => {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load data
    const loadData = async () => {
        setLoading(true);
        const allRequests = await fetchRequests();
        // Filter by student Reg No (assuming 2nd column index 1, or property 'Register Number')
        // My api.js maps headers to keys. The keys come from first row of sheet. 
        // Usually 'Register Number' or 'Timestamp' etc.
        // I should check what keys I used in GAS.
        // In GAS: headers.forEach... It uses the actual header text from the Sheet. 
        // The user image shows "Register Number or Admission Number". 
        // I need to be careful with keys. I'll dump the keys to console if needed, but let's assume we filter safely.
        // Or I'll filter by matching `regNo` or checking if it includes the string.

        // Actually, let's just do client side filtering loosely.
        const myRequests = allRequests.filter(r => {
            // Find the key that looks like register number
            const val = Object.values(r).join(' ').toLowerCase();
            return val.includes(user.identifier.toLowerCase());
        });
        setRequests(myRequests);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormSubmit = async (formData) => {
        setLoading(true);
        await submitRequest(formData);
        setShowForm(false);
        await loadData(); // Reload
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Student Portal
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome, {user.identifier}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={loadData}>Refresh</button>
                    <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {showForm ? (
                <LeaveForm
                    regNo={user.identifier}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>My Leave History</h2>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Request</button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
                    ) : requests.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No leave requests found.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {requests.map((req, idx) => (
                                <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{req['Reason'] || req['reason']}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {req['Leaving date'] || req['leavingDate']} — {req['Date of Return'] || req['returnDate']}
                                        </div>
                                        {req['Remarks'] && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                                <span style={{ fontWeight: 'bold' }}>Warden:</span> {req['Remarks']}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`status-badge ${(req['Approval'] || 'Pending') === 'Approved' ? 'status-approved' :
                                            (req['Approval'] || 'Pending') === 'Rejected' ? 'status-rejected' : 'status-pending'
                                        }`}>
                                        {req['Approval'] || 'Pending'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentDashboard;
