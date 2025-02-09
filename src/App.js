import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/LoginForm';  // Ensure you import the Login component
import DashboardPage from './pages/dashboardPage';  // Import your Dashboard component

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for Login page */}
        <Route path="/" element={<Login />} />

        {/* Route for Dashboard page */}
        <Route path="/DashboardPage" element={<DashboardPage/>} />
      </Routes>
    </Router>
  );
};

export default App;
