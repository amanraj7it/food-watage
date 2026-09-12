import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DonorPage from './pages/DonorPage';
import VolunteerPage from './pages/VolunteerPage';
import NgoPage from './pages/NgoPage';

// RoleRoute component: enforces strict separation so each email/role only accesses its own UI
function RoleRoute({ session, allowedRole, children }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  // Prevent any user from accessing another role's dedicated UI
  if (session.role && session.role !== allowedRole && session.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check localStorage for hl_session
    const s = localStorage.getItem('hl_session');
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (!parsed.role && parsed.userId) {
          // Synchronize role from user data if missing in existing session
          fetch('/api/users')
            .then(r => r.json())
            .then(d => {
              const allUsers = JSON.parse(d.value || '[]');
              const curr = allUsers.find(u => u.id === parsed.userId);
              if (curr) {
                const updated = { ...parsed, role: curr.role };
                localStorage.setItem('hl_session', JSON.stringify(updated));
                setSession(updated);
              } else {
                setSession(parsed);
              }
            })
            .catch(() => setSession(parsed));
        } else {
          setSession(parsed);
        }
      } catch (e) { }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* Strict Role-Guarded Routes */}
        <Route
          path="/donor"
          element={
            <RoleRoute session={session} allowedRole="donor">
              <DonorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/volunteer"
          element={
            <RoleRoute session={session} allowedRole="volunteer">
              <VolunteerPage />
            </RoleRoute>
          }
        />
        <Route
          path="/ngo"
          element={
            <RoleRoute session={session} allowedRole="ngo">
              <NgoPage />
            </RoleRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
