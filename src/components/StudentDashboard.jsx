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
                            {requests.map((req, idx) => {
                                const formatDate = (dateString) => {
                                    if (!dateString) return '';
                                    const date = new Date(dateString);
                                    if (isNaN(date.getTime())) return dateString; // Return original if not a valid date
                                    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                                };

                                const fromDate = formatDate(req['Leaving date'] || req['leavingDate']);
                                const toDate = formatDate(req['Date of Return'] || req['returnDate']);
                                const dateRange = fromDate && toDate ? `${fromDate} - ${toDate}` : (fromDate || toDate);

                                return (
                                    <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                    {dateRange || 'Date Not Specified'}
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                    {req['Reason'] || req['reason']}
                                                </div>
                                            </div>
                                            <div className={`status-badge ${(req['Approval'] || 'Pending') === 'Approved' ? 'status-approved' :
                                                (req['Approval'] || 'Pending') === 'Rejected' ? 'status-rejected' : 'status-pending'
                                                }`}>
                                                {req['Approval'] || 'Pending'}
                                            </div>
                                        </div>

                                        {/* Display Signed Letter Logic */}
                                        {(() => {
                                            const fileUrl = req['letter imqge'] || req['letter image'] || req['Letter Image URL'] || req['fileUrl'];
                                            if (fileUrl && fileUrl.startsWith('http')) {
                                                let previewUrl = fileUrl;
                                                // Attempt to convert Google Drive view links to direct image links
                                                if (fileUrl.includes('drive.google.com')) {
                                                    let id = null;
                                                    if (fileUrl.includes('/d/')) {
                                                        const match = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                                        if (match) id = match[1];
                                                    } else if (fileUrl.includes('id=')) {
                                                        const match = fileUrl.match(/id=([a-zA-Z0-9_-]+)/);
                                                        if (match) id = match[1];
                                                    }
                                                    if (id) previewUrl = `https://drive.google.com/uc?export=view&id=${id}`;
                                                }

                                                return (
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <div style={{
                                                            marginBottom: '0.75rem',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            background: 'rgba(0, 0, 0, 0.2)'
                                                        }}>
                                                            <img
                                                                src={previewUrl}
                                                                alt="Permission Letter"
                                                                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }}
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        </div>
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                background: 'rgba(59, 130, 246, 0.2)',
                                                                color: '#60a5fa',
                                                                textDecoration: 'none',
                                                                fontSize: '0.9rem',
                                                                padding: '0.5rem 1rem'
                                                            }}
                                                        >
                                                            <span>📄</span> View Full Document
                                                        </a>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {req['Remarks'] && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                padding: '0.75rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '0.5rem',
                                                borderLeft: '3px solid var(--accent-primary)',
                                                fontSize: '0.9rem'
                                            }}>
                                                <div style={{ fontWeight: '600', color: 'var(--accent-primary)', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Warden's Remarks
                                                </div>
                                                <div style={{ color: '#e2e8f0', fontStyle: 'italic' }}>
                                                    "{req['Remarks']}"
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentDashboard;
