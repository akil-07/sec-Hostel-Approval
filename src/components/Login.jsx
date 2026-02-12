import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { fetchWardens } from '../api';


const Login = ({ onLogin }) => {
    const [regNumber, setRegNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [availableWardens, setAvailableWardens] = useState([]);

    React.useEffect(() => {
        const load = async () => {
            const wardens = await fetchWardens();
            setAvailableWardens(wardens);
        };
        load();
    }, []);

    // Detect if input looks like a warden/admin code
    const detectUserType = (input) => {
        const normalized = input.toLowerCase().trim();

        // Admin code
        if (normalized === 'admin1234') {
            return { type: 'superadmin', identifier: 'admin' };
        }

        // Warden codes (hardcoded)
        const wardenCodes = {
            'pavi1234': 'Pavithrakannan',
            'somu1234': 'Somu',
            'ram1234': 'Raguram'
        };

        if (wardenCodes[normalized]) {
            return { type: 'warden', identifier: wardenCodes[normalized] };
        }

        // Check dynamic wardens from Firebase
        const dynamicWarden = availableWardens.find(w =>
            normalized === `${w.name.toLowerCase().substring(0, 4)}1234`
        );
        if (dynamicWarden) {
            return { type: 'warden', identifier: dynamicWarden.name };
        }

        // Default to student
        return { type: 'student', identifier: input };
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const userType = detectUserType(regNumber);

        // For wardens and admin, validate password
        if (userType.type === 'superadmin') {
            if (password !== 'admin123') {
                alert("Invalid Admin Password");
                return;
            }
        } else if (userType.type === 'warden') {
            // Check dynamic wardens first
            const dynamicWarden = availableWardens.find(w => w.name === userType.identifier);
            if (dynamicWarden) {
                if (dynamicWarden.password !== password) {
                    alert(`Invalid Password for Warden ${userType.identifier}`);
                    return;
                }
            } else {
                // Fallback to hardcoded
                const wardenCreds = {
                    'Pavithrakannan': 'pavi123',
                    'Somu': 'somu123',
                    'Raguram': 'ram123'
                };
                if (wardenCreds[userType.identifier] !== password) {
                    alert(`Invalid Password for Warden ${userType.identifier}`);
                    return;
                }
            }
        }

        onLogin(userType.type, userType.identifier);
    };

    // Google Sign-In for Wardens
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if the email is authorized as a warden
            const authorizedWardenEmails = [
                'akilsudhagar7@gmail.com',  // Pavithrakannan
                'akilsudhagar19@gmail.com', // Somu
                'akilsudhagar69@gmail.com'  // Raguram
            ];

            // Also check dynamic wardens
            const dynamicWardenEmails = availableWardens.map(w => w.email).filter(Boolean);
            const allAuthorizedEmails = [...authorizedWardenEmails, ...dynamicWardenEmails];

            if (allAuthorizedEmails.includes(user.email)) {
                // Find warden name from email
                let wardenName = 'Warden';
                const dynamicWarden = availableWardens.find(w => w.email === user.email);
                if (dynamicWarden) {
                    wardenName = dynamicWarden.name;
                } else if (user.email === 'akilsudhagar7@gmail.com') {
                    wardenName = 'Pavithrakannan';
                } else if (user.email === 'akilsudhagar19@gmail.com') {
                    wardenName = 'Somu';
                } else if (user.email === 'akilsudhagar69@gmail.com') {
                    wardenName = 'Raguram';
                }

                onLogin('warden', wardenName);
            } else {
                alert('This Google account is not authorized as a warden. Please contact the administrator.');
                await auth.signOut();
            }
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                alert('Failed to sign in with Google. Please try again.');
            }
        }
    };

    // Show password field when warden/admin code is detected
    React.useEffect(() => {
        const userType = detectUserType(regNumber);
        setShowPassword(userType.type !== 'student');
    }, [regNumber, availableWardens]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Hostel Portal</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Please sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label htmlFor="regNo">Register Number</label>
                        <input
                            id="regNo"
                            type="text"
                            placeholder="Enter your registration number"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            required
                            autoComplete="off"
                        />
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                            e.g., 25013635
                        </small>
                    </div>

                    {showPassword && (
                        <div className="mb-2" style={{
                            animation: 'fadeIn 0.3s ease-in',
                            marginTop: '1rem'
                        }}>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            padding: '0.875rem',
                            fontSize: '1rem'
                        }}
                    >
                        Sign In
                    </button>
                </form>

                {/* Google Sign-In for Wardens */}
                {showPassword && detectUserType(regNumber).type === 'warden' && (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '1rem 0',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }}></div>
                            <span style={{ padding: '0 1rem' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="btn"
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                fontSize: '0.95rem',
                                background: '#ffffff',
                                border: '1px solid #dadce0',
                                color: '#3c4043',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                fontWeight: '500'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
                                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        <p style={{
                            marginTop: '0.75rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                            Wardens can use Google Sign-In for extra security
                        </p>
                    </div>
                )}

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'var(--bg-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> Students use their registration number. Staff members use their access code.
                </div>
            </div>
        </div>
    );
};

export default Login;
