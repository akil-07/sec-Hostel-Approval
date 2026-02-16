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

            // Password is correct, now enforce Google Sign-In (2FA)
            handleGoogleSignIn();
            return;
        }

        onLogin(userType.type, userType.identifier);
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
                        <label htmlFor="regNo">Register Number (Roll No)</label>
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
