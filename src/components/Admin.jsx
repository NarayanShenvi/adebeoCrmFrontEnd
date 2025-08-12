import React, { useState } from 'react';
import CreateUsers from './CreateUsers';
import ManageCustomerFunnel from './ManageCustomerFunnel';
import ManageUserFunnel from './ManageUserFunnel';
import ManageCustomerData from './ManageCustomerData';
import PerformaInvoiceStatus from './PerformaInvoiceStatus';
import InvoiceStatus from './InvoiceStatus';
import PurchaseOrderStatus from './PurchaseOrderStatus';
import PurchaseReport from './PurchaseReport';
import SalesReport from './SalesReport';
import ProductCategory from './ProductCategory';

import './dashboard/Dashboard.css'; // Import the CSS fil


const Admin = () => {
  const [selected, setSelected] = useState('');
  const renderContent = () => {
    switch (selected) {
      case 'CreateUsers': return <CreateUsers />;
      case 'ManageCustomerFunnel': return <ManageCustomerFunnel />;
      case 'ManageUserFunnel': return <ManageUserFunnel />;
      case 'ManageCustomerData': return <ManageCustomerData />;
      case 'PerformaInvoiceStatus': return <PerformaInvoiceStatus />;
      case 'InvoiceStatus': return <InvoiceStatus />;
      case 'PurchaseOrderStatus': return <PurchaseOrderStatus />;
      case 'PurchaseReport': return <PurchaseReport />;
      case 'SalesReport': return <SalesReport />;
      case 'ProductCategory': return <ProductCategory />;

default: return <div className="default-message-admin">Please select an option from the menu above to proceed.</div>;
    }
  };

  return (
    <div>
      {/* TOP MENU — IN THIS FILE ONLY */}
      <div className="admin-topmenu">
        <button onClick={() => setSelected('CreateUsers')}>Create Users</button>

        <div className="dropdown">
          <button className="dropbtn">Manage Funnel</button>
          <div className="dropdown-content">
            <a onClick={() => setSelected('ManageUserFunnel')}>Transfer Funnel User</a>
            <a onClick={() => setSelected('ManageCustomerData')}>Manage Customer Data</a>
          </div>
        </div>

        <button onClick={() => setSelected('PerformaInvoiceStatus')}>Performa Invoice Management</button>
        <button onClick={() => setSelected('InvoiceStatus')}>Invoice Management</button>
        <button onClick={() => setSelected('PurchaseOrderStatus')}>PO Management</button>
        

        <div className="dropdown">
          <button className="dropbtn">Admin Report</button>
          <div className="dropdown-content">
            <a onClick={() => setSelected('PurchaseReport')}>Purchase Report</a>
            <a onClick={() => setSelected('SalesReport')}>Sales Report</a>
          </div>
        </div>

         <button onClick={() => setSelected('ProductCategory')}>Product  Category</button>
      </div>

      {/* SCREEN BELOW */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
