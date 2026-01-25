import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [role, setRole] = useState('student'); // 'student' or 'warden'
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role === 'warden' && password !== 'admin123') {
            alert("Invalid Warden Password (try 'admin123')");
            return;
        }
        onLogin(role, identifier);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '380px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Hostel Portal</h2>
                    <p>Please sign in to continue</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-color)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                    <button
                        className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ border: 'none', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => setRole('student')}
                    >
                        Student
                    </button>
                    <button
                        className={`btn ${role === 'warden' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ border: 'none', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => setRole('warden')}
                    >
                        Warden
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {role === 'student' ? (
                        <div className="mb-2">
                            <label htmlFor="regNo">Register Number</label>
                            <input
                                id="regNo"
                                type="text"
                                placeholder="e.g. 912345678"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="mb-2">
                                <label htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter Username"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
