import React, { useState } from 'react';
import CreateUsers from './CreateUsers';
import ManageUserFunnel from './ManageUserFunnel';
import ManageCustomerData from './ManageCustomerData';
import PerformaInvoiceStatus from './PerformaInvoiceStatus';
import InvoiceStatus from './InvoiceStatus';
import ProductCategory from './ProductCategory';
import SalesReport from './SalesReport';
import PurchaseReport from './PurchaseReport';
import BusinessReport from './BusinessReport';
import PaymentReport from './PaymentReport';
import EnquiriesLostReport from './EnquiriesLostReport';
import EnquiriesWonReport from './EnquiriesWonReport';

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
      case 'SalesReport': return <SalesReport />;
      case 'PurchaseReport': return <PurchaseReport />;
      case 'BusinessReport': return <BusinessReport />;
      case 'PaymentReport': return <PaymentReport />;
      case 'EnquiriesLostReport': return <EnquiriesLostReport />;
      case 'EnquiriesWonReport': return <EnquiriesWonReport />;


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
        Transfer User Funnel
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

  <div className="dropdown">
  <button
    className={`dropbtn ${
      selected === 'SalesReport' ||
      selected === 'PurchaseReport' ||
      selected === 'BusinessReport' ||
      selected === 'EnquiriesLostReport' ||
      selected === 'EnquiriesWonReport'
        ? 'active'
        : ''
    }`}
  >
    Reports
  </button>
  <div className="dropdown-content">
    <a
      className={selected === 'SalesReport' ? 'active' : ''}
      onClick={() => setSelected('SalesReport')}
    >
      Sales Report
    </a>
    <a
      className={selected === 'PurchaseReport' ? 'active' : ''}
      onClick={() => setSelected('PurchaseReport')}
    >
      Purchase Report
    </a>
    <a
      className={selected === 'BusinessReport' ? 'active' : ''}
      onClick={() => setSelected('BusinessReport')}
    >
      Business Report
    </a>
    <a
      className={selected === 'PaymentReport' ? 'active' : ''}
      onClick={() => setSelected('PaymentReport')}
    >
      Payment Report
    </a>
    <a
      className={selected === 'EnquiriesLostReport' ? 'active' : ''}
      onClick={() => setSelected('EnquiriesLostReport')}
    >
      Enquiries Lost Report
    </a>
    <a
      className={selected === 'EnquiriesWonReport' ? 'active' : ''}
      onClick={() => setSelected('EnquiriesWonReport')}
    >
      Enquiries Won Report
    </a>
  </div>
  </div>

      </div>

      {/* SCREEN BELOW */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
