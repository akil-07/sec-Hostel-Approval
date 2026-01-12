import React, { useState, useEffect } from 'react';
import { fetchRequests, updateRequest } from '../api';

const WardenDashboard = ({ user, onLogout }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending'); // 'Pending', 'All'
    const [actionItem, setActionItem] = useState(null); // The request being acted upon
    const [remarks, setRemarks] = useState('');

    const loadData = async () => {
        setLoading(true);
        const data = await fetchRequests();
        // Sort by timestamp desc (assuming first col is timestamp)
        setRequests(data.reverse());
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = (request, status) => {
        setActionItem({ request, status });
        setRemarks('');
    };

    const confirmAction = async () => {
        if (!actionItem) return;

        // Find ID. It might be 'ID'
        const id = actionItem.request['ID'] || actionItem.request['id'];

        setLoading(true);
        await updateRequest(id, actionItem.status, remarks);
        setActionItem(null);
        await loadData();
    };

    const filteredRequests = requests.filter(r => {
        const status = r['Approval'] || 'Pending';
        if (filter === 'Pending') return status === 'Pending';
        return true;
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Warden Portal
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Review and Manage Leave Requests</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={loadData}>Refresh</button>
                    <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className={`btn ${filter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('Pending')}>Pending Requests</button>
                <button className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('All')}>All History</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : filteredRequests.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No requests found.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredRequests.map((req, idx) => {
                        const formatDate = (dateString) => {
                            if (!dateString) return '';
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) return dateString;
                            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                        };

                        const fromDate = formatDate(req['Leaving date']);
                        const toDate = formatDate(req['Date of return'] || req['Date of Return']);
                        const dateRange = fromDate && toDate ? `${fromDate} - ${toDate}` : (fromDate || toDate);

                        return (
                            <div key={idx} className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {req['Student Name']}
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                                                ({req['Register Number']})
                                            </span>
                                        </div>
                                        <div style={{ color: '#ec4899', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            Room: {req['Room']} • {req['Year']} Year {req['Dept']}
                                        </div>
                                    </div>
                                    <div className={`status-badge ${(req['Approval'] || 'Pending') === 'Approved' ? 'status-approved' :
                                        (req['Approval'] || 'Pending') === 'Rejected' ? 'status-rejected' : 'status-pending'
                                        }`}>
                                        {req['Approval'] || 'Pending'}
                                    </div>
                                </div>

                                <div className="grid-2" style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                                    <div><strong>Reason:</strong> {req['Reason']}</div>
                                    <div><strong>Dates:</strong> {dateRange}</div>
                                    <div><strong>Parents Contact:</strong> {req['Parent Mobile']}</div>
                                    <div><strong>Student Contact:</strong> {req['Student Mobile']}</div>
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

                                {(req['Approval'] || 'Pending') === 'Pending' ? (
                                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                                        <button className="btn" style={{ background: '#10b981', color: 'white' }} onClick={() => handleAction(req, 'Approved')}>Approve</button>
                                        <button className="btn" style={{ background: '#ef4444', color: 'white' }} onClick={() => handleAction(req, 'Rejected')}>Reject</button>
                                    </div>
                                ) : (
                                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem', color: '#cbd5e1' }}>
                                        <strong>Remarks:</strong> {req['Remarks'] || 'No remarks'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Action Modal */}
            {actionItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '90%', maxWidth: '500px', background: '#1e293b' }}>
                        <h3 style={{ marginTop: 0 }}>Confirm {actionItem.status}</h3>
                        <p>Add remarks for this decision (optional for approval, required for rejection):</p>
                        <textarea
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter remarks..."
                        ></textarea>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={confirmAction}>Confirm</button>
                            <button className="btn btn-secondary" onClick={() => setActionItem(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenDashboard;
