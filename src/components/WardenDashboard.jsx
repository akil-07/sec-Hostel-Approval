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
                    {filteredRequests.map((req, idx) => (
                        <div key={idx} className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{req['Student Name'] || req['name']} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({req['Register Number or Admission Number'] || req['regNo']})</span></div>
                                    <div style={{ color: '#ec4899', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Room: {req['Room Number'] || req['room']} • {req['Year of study'] || req['year']} Year {req['Department'] || req['dept']}</div>
                                </div>
                                <div className={`status-badge ${(req['Approval'] || 'Pending') === 'Approved' ? 'status-approved' :
                                        (req['Approval'] || 'Pending') === 'Rejected' ? 'status-rejected' : 'status-pending'
                                    }`}>
                                    {req['Approval'] || 'Pending'}
                                </div>
                            </div>

                            <div className="grid-2" style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                                <div><strong>Reason:</strong> {req['Reason'] || req['reason']}</div>
                                <div><strong>Dates:</strong> {req['Leaving date'] || req['leavingDate']} to {req['Date of Return'] || req['returnDate']}</div>
                                <div><strong>Parents Contact:</strong> {req['Parent Mobile Number'] || req['parentMobile']}</div>
                                <div><strong>Student Contact:</strong> {req['Student Mobile Number'] || req['studentMobile']}</div>
                            </div>

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
                    ))}
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
