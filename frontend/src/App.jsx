import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DonorPage from './pages/DonorPage';
import VolunteerPage from './pages/VolunteerPage';
import NgoPage from './pages/NgoPage';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check localStorage for hl_session
    const s = localStorage.getItem('hl_session');
    if (s) {
      try {
        const parsed = JSON.parse(s);
        setSession(parsed);
      } catch (e) { }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/donor" element={<DonorPage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/ngo" element={<NgoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
