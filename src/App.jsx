import React, { useState } from 'react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import WardenDashboard from './components/WardenDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import './App.css'; // Component specific overrides if any

function App() {
  const [view, setView] = useState('login'); // login, student, warden
  const [user, setUser] = useState(null);

  const handleLogin = (role, identifier) => {
    setUser({ role, identifier });
    setView(role);
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  /* Theme Management */
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      {/* Persistent Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="btn btn-secondary"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          padding: 0,
          background: 'var(--card-bg)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {view === 'login' && <Login onLogin={handleLogin} />}
      {view === 'student' && <StudentDashboard user={user} onLogout={handleLogout} />}
      {view === 'warden' && <WardenDashboard user={user} onLogout={handleLogout} />}
      {view === 'superadmin' && <SuperAdminDashboard onLogout={handleLogout} />}
    </div>
  );
}

export default App;
