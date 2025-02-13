import React, { useState } from 'react';
import LeftMenu from './leftMenu';
import RightPanel from './rightPanel';

const Dashboard = () => {
  const [selectedSection, setSelectedSection] = useState(''); // Start with empty string or null

  const handleMenuItemClick = (section) => {
    setSelectedSection(section);  // Update selected section on click
  };

  return (
    <div className="dashboard">
      <LeftMenu onMenuItemClick={handleMenuItemClick} />
      <RightPanel selectedSection={selectedSection} />
    </div>
  );
};

export default Dashboard;

