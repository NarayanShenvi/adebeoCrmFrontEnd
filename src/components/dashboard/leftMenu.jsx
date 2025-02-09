import React from 'react';
import { Link } from 'react-router-dom';

const LeftMenu = ({ onMenuItemClick }) => {
  return (
    <div className="left-menu">
      <h3>Dashboard</h3>
      <ul>
        <li><button onClick={() => onMenuItemClick('funnel')}>Funnel</button></li>
        <li><button onClick={() => onMenuItemClick('customers')}>Customers</button></li>
     </ul>
    </div>
  );
};

export default LeftMenu;