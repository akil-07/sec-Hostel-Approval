import React, { useState, useEffect } from 'react';
import { fetchRequests, updateRequest } from '../api';

const WardenDashboard = ({ user, onLogout }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending'); // 'Pending', 'All'
    const [actionItem, setActionItem] = useState(null); // The request being acted upon
    const [remarks, setRemarks] = useState('');
    const [viewImage, setViewImage] = useState(null); // For image modal

    const loadData = async () => {
        setLoading(true);
        const data = await fetchRequests();
        const myWardenRequests = data.filter(r => {
            // If the request has a warden field, match it. 
            // If it doesn't (older data), maybe show it to everyone or filter it out.
            // For now, let's show only matching warden requests
            // ALSO SHOW ALL EMERGENCY REQUESTS regardless of warden assignment
            return r['warden'] === user.identifier || r['Warden'] === user.identifier || r['requestType'] === 'Emergency';
        });
        setRequests(myWardenRequests.reverse());
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
        const isEmergency = r['requestType'] === 'Emergency';

        if (filter === 'Pending') return status === 'Pending';
        if (filter === 'Emergency') return isEmergency; // Show all emergency (pending or processed)
        return true;
    });

    // Helper component for individual request cards
    const RequestCard = ({ req, onAction, onViewImage }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const isEmergency = req['requestType'] === 'Emergency';

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        };

        const fromDate = formatDate(req['Leaving date']);
        const toDate = formatDate(req['Date of return'] || req['Date of Return']);
        const dateRange = fromDate && toDate ? `${fromDate} - ${toDate}` : (fromDate || toDate);
        const status = req['Approval'] || 'Pending';

        return (
            <div className="card" style={{
                padding: '0',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                border: isEmergency ? '2px solid #ef4444' : '1px solid var(--card-border)'
            }}>
                {/* Header - Single Line View */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isExpanded ? 'rgba(0,0,0,0.02)' : (isEmergency ? '#fef2f2' : 'transparent'),
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
                        {isEmergency && <span style={{ fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>🚨</span>}
                        <div style={{ fontWeight: '600', fontSize: '1.05rem', minWidth: '180px', color: 'var(--text-primary)' }}>
                            {req['Student Name']}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                            {req['Register Number']}
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'var(--primary)',
                            background: 'var(--bg-color)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: '500'
                        }}>
                            {req['Room']}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={`status-badge ${status === 'Approved' ? 'status-approved' :
                            status === 'Rejected' ? 'status-rejected' : 'status-pending'
                            }`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                            {status}
                        </span>
                        <div style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            color: 'var(--text-secondary)'
                        }}>
                            ▼
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div style={{
                        padding: '1.5rem',
                        borderTop: '1px solid var(--card-border)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        {isEmergency && (
                            <div style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: '1px solid #fca5a5'
                            }}>
                                🚨 EMERGENCY REQUEST - Please review immediately
                            </div>
                        )}
                        <div className="grid-2" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Leave Dates</label>
                                <div style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--primary)' }}>{dateRange}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Department & Year</label>
                                <div style={{ fontWeight: '500' }}>{req['Year']} Year - {req['Dept']}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Student Mobile</label>
                                <div style={{ fontWeight: '500' }}>{req['Student Mobile']}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Parent Mobile</label>
                                <div style={{ fontWeight: '500' }}>{req['Parent Mobile']}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Reason for Leave</label>
                                <div style={{ fontWeight: '500', background: 'var(--bg-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                                    {req['Reason']}
                                </div>
                            </div>
                        </div>

                        {/* Letter Image Logic */}
                        {(() => {
                            const fileUrl = req['letter imqge'] || req['letter image'] || req['Letter Image URL'] || req['fileUrl'];
                            if (fileUrl && (fileUrl.startsWith('data:image') || fileUrl.startsWith('http'))) {
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
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Permission Letter</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    borderRadius: 'var(--radius-md)',
                                                    overflow: 'hidden',
                                                    border: '1px solid var(--card-border)',
                                                    cursor: 'pointer',
                                                    backgroundImage: `url(${previewUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                                onClick={() => onViewImage(fileUrl)}
                                            />
                                            <button
                                                onClick={() => onViewImage(fileUrl)}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                🔍 View Full Size
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Action Buttons */}
                        {status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-success"
                                    onClick={(e) => { e.stopPropagation(); onAction(req, 'Approved'); }}
                                    style={{ flex: 1, padding: '0.75rem' }}
                                >
                                    ✅ Approve Request
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={(e) => { e.stopPropagation(); onAction(req, 'Rejected'); }}
                                    style={{ flex: 1, padding: '0.75rem' }}
                                >
                                    ❌ Reject Request
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'var(--bg-color)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <strong>Remarks:</strong> {req['Remarks'] || 'No remarks provided.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Warden Portal</h1>
                    <p className="page-subtitle">Manage student leave requests</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={loadData}>Refresh</button>
                    <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', overflowX: 'auto' }}>
                <button
                    className={`btn ${filter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('Pending')}
                    style={{ flex: 1, minWidth: '100px', justifyContent: 'center' }}
                >
                    Pending
                </button>
                <button
                    className={`btn ${filter === 'Emergency' ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => setFilter('Emergency')}
                    style={{
                        flex: 1,
                        minWidth: '100px',
                        justifyContent: 'center',
                        backgroundColor: filter === 'Emergency' ? '#dc2626' : undefined,
                        color: filter === 'Emergency' ? 'white' : undefined
                    }}
                >
                    🚨 Emergency
                </button>
                <button
                    className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('All')}
                    style={{ flex: 1, minWidth: '100px', justifyContent: 'center' }}
                >
                    History
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '2rem', animation: 'spin 1s linear infinite' }}>⌛</div>
                    Loading requests...
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '2.5rem', opacity: 0.5 }}>✓</div>
                    No {filter.toLowerCase()} requests found.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {filteredRequests.map((req, idx) => (
                        <RequestCard
                            key={idx}
                            req={req}
                            onAction={handleAction}
                            onViewImage={setViewImage}
                        />
                    ))}
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
                            style={{ marginBottom: '1.5rem', width: '100%', padding: '0.5rem' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={confirmAction} style={{ flex: 1 }}>Confirm</button>
                            <button className="btn btn-secondary" onClick={() => setActionItem(null)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {viewImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 200,
                        padding: '2rem'
                    }}
                    onClick={() => setViewImage(null)}
                >
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <button
                            onClick={() => setViewImage(null)}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '0',
                                background: 'var(--danger)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            ✕ Close
                        </button>
                        <img
                            src={viewImage}
                            alt="Permission Letter Full View"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenDashboard;
