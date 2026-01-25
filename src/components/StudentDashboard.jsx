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

        // Client side filtering
        const myRequests = allRequests.filter(r => {
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
        <div className="container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Student Portal</h1>
                    <p className="page-subtitle">Welcome, <span style={{ color: 'var(--primary)' }}>{user.identifier}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>My Leave History</h2>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Request</button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⌛</div>
                            Loading your requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            <div style={{ marginBottom: '1rem', fontSize: '2.5rem', opacity: 0.5 }}>📭</div>
                            No leave requests found.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {requests.map((req, idx) => {
                                const formatDate = (dateString) => {
                                    if (!dateString) return '';
                                    const date = new Date(dateString);
                                    if (isNaN(date.getTime())) return dateString;
                                    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                                };

                                const fromDate = formatDate(req['Leaving date'] || req['leavingDate']);
                                const toDate = formatDate(req['Date of Return'] || req['returnDate']);
                                const dateRange = fromDate && toDate ? `${fromDate} - ${toDate}` : (fromDate || toDate);
                                const status = req['Approval'] || 'Pending';

                                return (
                                    <div key={idx} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                    {dateRange || 'Date Not Specified'}
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                    {req['Reason'] || req['reason']}
                                                </div>
                                            </div>
                                            <div className={`status-badge ${status === 'Approved' ? 'status-approved' :
                                                    status === 'Rejected' ? 'status-rejected' : 'status-pending'
                                                }`}>
                                                {status}
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
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <div style={{
                                                            marginBottom: '0.75rem',
                                                            borderRadius: 'var(--radius-md)',
                                                            overflow: 'hidden',
                                                            border: '1px solid var(--card-border)',
                                                            background: 'rgba(0, 0, 0, 0.2)',
                                                            maxWidth: '200px'
                                                        }}>
                                                            <img
                                                                src={previewUrl}
                                                                alt="Permission Letter"
                                                                style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                                                onClick={() => window.open(fileUrl, '_blank')}
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        </div>
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                color: 'var(--primary)',
                                                                textDecoration: 'none',
                                                            }}
                                                        >
                                                            <span>📄</span> View Full Letter
                                                        </a>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {req['Remarks'] && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                padding: '1rem',
                                                background: 'rgba(0,0,0,0.2)',
                                                borderRadius: 'var(--radius-md)',
                                                borderLeft: '3px solid var(--primary)',
                                                fontSize: '0.9rem'
                                            }}>
                                                <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Warden's Remarks
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
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
