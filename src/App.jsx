import React, { useState } from 'react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import WardenDashboard from './components/WardenDashboard';
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

  return (
    <div className="App">
      {view === 'login' && <Login onLogin={handleLogin} />}
      {view === 'student' && <StudentDashboard user={user} onLogout={handleLogout} />}
      {view === 'warden' && <WardenDashboard user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
