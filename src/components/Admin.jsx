import React, { useState } from 'react';
import CreateUsers from './CreateUsers';
import ManageUserFunnel from './ManageUserFunnel';
import ManageCustomerData from './ManageCustomerData';
import PerformaInvoiceStatus from './PerformaInvoiceStatus';
import InvoiceStatus from './InvoiceStatus';
import ProductCategory from './ProductCategory';

import './dashboard/Dashboard.css'; // Import the CSS fil


const Admin = () => {
  const [selected, setSelected] = useState('');
  const renderContent = () => {
    switch (selected) {
      case 'CreateUsers': return <CreateUsers />;
      case 'ManageUserFunnel': return <ManageUserFunnel />;
      case 'ManageCustomerData': return <ManageCustomerData />;
      case 'PerformaInvoiceStatus': return <PerformaInvoiceStatus />;
      case 'InvoiceStatus': return <InvoiceStatus />;
      case 'ProductCategory': return <ProductCategory />;

default: return <div className="default-message-admin">Please select an option from the menu above to proceed.</div>;
    }
  };

  return (
    <div>
      {/* TOP MENU — IN THIS FILE ONLY */}
      <div className="admin-topmenu">
  <button
    className={selected === 'CreateUsers' ? 'active' : ''}
    onClick={() => setSelected('CreateUsers')}
  >
    Create Users
  </button>

  <div className="dropdown">
    <button className={`dropbtn ${selected === 'ManageUserFunnel' || selected === 'ManageCustomerData' ? 'active' : ''}`}>
      Manage Funnel
    </button>
    <div className="dropdown-content">
      <a
        className={selected === 'ManageUserFunnel' ? 'active' : ''}
        onClick={() => setSelected('ManageUserFunnel')}
      >
        Transfer Funnel User
      </a>
      <a
        className={selected === 'ManageCustomerData' ? 'active' : ''}
        onClick={() => setSelected('ManageCustomerData')}
      >
        Manage Customer Data
      </a>
    </div>
  </div>

  <button
    className={selected === 'PerformaInvoiceStatus' ? 'active' : ''}
    onClick={() => setSelected('PerformaInvoiceStatus')}
  >
    Proforma Invoice Management
  </button>

  <button
    className={selected === 'InvoiceStatus' ? 'active' : ''}
    onClick={() => setSelected('InvoiceStatus')}
  >
    Invoice Management
  </button>

  <button
    className={selected === 'ProductCategory' ? 'active' : ''}
    onClick={() => setSelected('ProductCategory')}
  >
    Product Category
  </button>
</div>


      {/* SCREEN BELOW */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
