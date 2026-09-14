import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DonorPage from './pages/DonorPage';
import VolunteerPage from './pages/VolunteerPage';
import NgoPage from './pages/NgoPage';
import LumenIndex from './pages/LumenIndex';

function getStoredSession() {
  try {
    const s = localStorage.getItem('hl_session');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

// RoleRoute component: enforces strict separation so each email/role only accesses its own UI
function RoleRoute({ session, allowedRole, children }) {
  const currentSession = session || getStoredSession();
  if (!currentSession) {
    return <Navigate to="/login" replace />;
  }
  // Prevent any user from accessing another role's dedicated UI
  if (currentSession.role && currentSession.role !== allowedRole && currentSession.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [session, setSession] = useState(getStoredSession);

  useEffect(() => {
    const sync = () => setSession(getStoredSession());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lumen" element={<LumenIndex />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Full Harvest Network Role-Dedicated Portals matching UI screenshot */}
        <Route path="/ngo" element={<Dashboard roleOverride="ngo" />} />
        <Route path="/donor" element={<Dashboard roleOverride="donor" />} />
        <Route path="/volunteer" element={<Dashboard roleOverride="volunteer" />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
