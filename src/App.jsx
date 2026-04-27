import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import AdminDashboard from './pages/AdminDashboard';
import { isAdminAuthenticated, clearAdminSession } from './utils/auth';
import defaultData from './data.json';

function App() {
  const [portfolioData, setPortfolioData] = useState(() => {
    const saved = localStorage.getItem('portfolio-data');
    if (saved) { try { return JSON.parse(saved); } catch { return defaultData; } }
    return defaultData;
  });

  // State-based auth — so navigate('/admin') after login triggers a real re-render
  const [adminAuthed, setAdminAuthed] = useState(isAdminAuthenticated());

  const updateData = (newData) => {
    setPortfolioData(newData);
    localStorage.setItem('portfolio-data', JSON.stringify(newData));
  };

  const handleAdminLogin  = () => setAdminAuthed(true);
  const handleAdminLogout = () => { clearAdminSession(); setAdminAuthed(false); };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Portfolio data={portfolioData} onAdminLogin={handleAdminLogin} />}
        />
        <Route
          path="/admin"
          element={
            adminAuthed
              ? <AdminDashboard data={portfolioData} setData={updateData} onLogout={handleAdminLogout} />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
