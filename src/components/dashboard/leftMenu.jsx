//import React from 'react';
import logo from "../dashboard/logo1.png";
import React, { useState } from 'react';

const LeftMenu = ({ onMenuItemClick }) => {
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (menuItem) => 
    {
    setActiveButton(menuItem);
    onMenuItemClick(menuItem); // Call the function to change content
  };
  return (
    <div className="left-menu">
      <div className='logo'>
               <img src={logo} alt="Company Logo" width="58" height="60"/>
      </div>
      <h3>Dashboard</h3>
      <br></br>
      <ul className="menu-list">
      <li><button className={activeButton === 'funnel' ? 'active' : ''} onClick={() => handleButtonClick('funnel')}>Funnel</button></li>
      <li><button className={activeButton === 'customers' ? 'active' : ''} onClick={() => handleButtonClick('customers')}>Customers</button></li>
      <li><button className={activeButton === 'products' ? 'active' : ''} onClick={() => handleButtonClick('products')}>Products</button></li>
      <li><button className={activeButton === 'purchase_orders' ? 'active' : ''} onClick={() => handleButtonClick('purchase_orders')}>Purchase Orders</button></li>
      <li><button className={activeButton === 'renewal' ? 'active' : ''} onClick={() => handleButtonClick('renewal')}>Renewal</button></li>
      <li><button className={activeButton === 'cx_payment' ? 'active' : ''} onClick={() => handleButtonClick('cx_payment')}>Cx Payment</button></li>
      <li><button className={activeButton === 'vx_payment' ? 'active' : ''} onClick={() => handleButtonClick('vx_payment')}>Vx Payment</button></li>
      <li><button className={activeButton === 'reports' ? 'active' : ''} onClick={() => handleButtonClick('reports')}>Reports</button></li>
      <li><button className={activeButton === 'admin' ? 'active' : ''} onClick={() => handleButtonClick('admin')}>Admin</button></li>
    </ul>
    </div>
  );
};

export default LeftMenu;