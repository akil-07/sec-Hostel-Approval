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
        <div className="login-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Hostel Leave Portal</h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                    <button
                        className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRole('student')}
                    >
                        Student
                    </button>
                    <button
                        className={`btn ${role === 'warden' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRole('warden')}
                    >
                        Warden
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {role === 'student' ? (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Register Number</label>
                            <input
                                type="text"
                                placeholder="Enter Register No."
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Username</label>
                            <input
                                type="text"
                                placeholder="Enter Username"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Password</label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
