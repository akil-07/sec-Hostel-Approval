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
        <div className="container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Warden Portal</h1>
                    <p className="page-subtitle">Manage student leave requests efficiently</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={loadData}>Refresh</button>
                    <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1px' }}>
                <button
                    className={`btn ${filter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('Pending')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: filter === 'Pending' ? 'none' : '1px solid transparent' }}
                >
                    Pending Requests
                </button>
                <button
                    className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('All')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: filter === 'All' ? 'none' : '1px solid transparent' }}
                >
                    All History
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⌛</div>
                    Loading requests...
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '2.5rem', opacity: 0.5 }}>✓</div>
                    No {filter.toLowerCase()} requests found.
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
                        const status = req['Approval'] || 'Pending';

                        return (
                            <div key={idx} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                            {req['Student Name']}
                                        </div>
                                        <div style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: '500' }}>
                                            {req['Register Number']} • Room {req['Room']} • {req['Year']} Year {req['Dept']}
                                        </div>
                                    </div>
                                    <div className={`status-badge ${status === 'Approved' ? 'status-approved' :
                                            status === 'Rejected' ? 'status-rejected' : 'status-pending'
                                        }`}>
                                        {status}
                                    </div>
                                </div>

                                <div className="grid-2" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                    <div><strong style={{ color: 'var(--text-primary)' }}>Reason:</strong> {req['Reason']}</div>
                                    <div><strong style={{ color: 'var(--text-primary)' }}>Dates:</strong> {dateRange}</div>
                                    <div><strong style={{ color: 'var(--text-primary)' }}>Parents Contact:</strong> {req['Parent Mobile']}</div>
                                    <div><strong style={{ color: 'var(--text-primary)' }}>Student Contact:</strong> {req['Student Mobile']}</div>
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
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <div style={{
                                                    marginBottom: '0.75rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    overflow: 'hidden',
                                                    border: '1px solid var(--card-border)',
                                                    background: 'rgba(0, 0, 0, 0.2)',
                                                    maxWidth: '250px'
                                                }}>
                                                    <img
                                                        src={previewUrl}
                                                        alt="Permission Letter"
                                                        style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block', cursor: 'pointer' }}
                                                        onClick={() => window.open(fileUrl, '_blank')}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary"
                                                    style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                >
                                                    <span>📄</span> View Full Letter
                                                </a>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {status === 'Pending' ? (
                                    <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem' }}>
                                        <button className="btn btn-success" onClick={() => handleAction(req, 'Approved')} style={{ flex: 1 }}>Approve</button>
                                        <button className="btn btn-danger" onClick={() => handleAction(req, 'Rejected')} style={{ flex: 1 }}>Reject</button>
                                    </div>
                                ) : (
                                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem', color: 'var(--text-secondary)' }}>
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
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ marginTop: 0 }}>Confirm {actionItem.status}</h3>
                        <p>Add remarks for this decision (optional for approval, required for rejection):</p>
                        <textarea
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter remarks..."
                            style={{ marginBottom: '1.5rem' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={confirmAction} style={{ flex: 1 }}>Confirm</button>
                            <button className="btn btn-secondary" onClick={() => setActionItem(null)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenDashboard;
