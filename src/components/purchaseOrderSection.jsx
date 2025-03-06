import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProformas, fetchPurchaseOrders, createPurchaseOrder } from '../redux/slices/purchaseOrderSlice';
import API from '../config/config';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiDocumentArrowDown } from "react-icons/hi2";
import { FaSpinner, FaFilePdf } from 'react-icons/fa';


const CreatePurchaseOrder = () => {
  const dispatch = useDispatch();

  const { proformas = [], recentOrders = [], status, currentPage = 1, totalPages = 0, totalOrders = 0, isProformasFetched, orderStatus } = useSelector((state) => state.purchaseOrder || {});

  const [selectedProforma, setSelectedProforma] = useState('');
  const [items, setItems] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState('');

  // Fetch proformas and recent orders
  useEffect(() => {
    if (!isProformasFetched) {
      dispatch(fetchProformas());
    }

    dispatch(fetchPurchaseOrders({ page: currentPage, rows_per_page: rowsPerPage }));
  }, [dispatch, currentPage, rowsPerPage, isProformasFetched]);

  // Handle Proforma Selection
  const handleProformaSelect = useCallback((proformaId) => {
    setSelectedProforma(proformaId);
    const selected = proformas.find(proforma => proforma.proforma_id === proformaId);
    if (selected) {
      setItems(selected.items || []);
      setDiscounts(new Array(selected.items.length).fill(0));
    }
  }, [proformas]);

  // Handle Discount Input Change
  const handleDiscountChange = useCallback((index, value) => {
    if (value < 0 || value > 100) {
      setError('Discount value must be between 0 and 100.');
      return;
    }

    const updatedDiscounts = [...discounts];
    updatedDiscounts[index] = value;
    setDiscounts(updatedDiscounts);
    setError('');
  }, [discounts]);

  // Handle Purchase Order Generation
  const handleGeneratePurchaseOrder = async () => {
    if (!selectedProforma) {
      setError('Please select a Proforma!');
      return;
    }

    setLoading(true);
    const itemsWithDiscount = items.map((item, index) => ({
      ...item,
      discount: discounts[index],
    }));

    try {
      // Dispatch createPurchaseOrder action to handle order creation via Redux
      await dispatch(createPurchaseOrder({ proforma_id: selectedProforma, itemsWithDiscount }));
      if (orderStatus === 'success') {
        alert('Purchase Order Created Successfully!');
      }
    } catch (error) {
      setError('Failed to create Purchase Order. Please try again.');
      console.error('Error creating purchase order:', error);
    }
    setLoading(false);
  };

  // Handle Page Change for Recent Orders
  const handleRecentOrdersPageChange = (page) => {
    dispatch(fetchPurchaseOrders({ page, rows_per_page: rowsPerPage }));
  };

  // Handle Rows per Page Change for Recent Orders
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = e.target.value;
    setRowsPerPage(newRowsPerPage);
    dispatch(fetchPurchaseOrders({ page: currentPage, rows_per_page: newRowsPerPage }));
  };

  // Download PDF for the Purchase Order
  const handleDownloadPDF = (orderId) => {
    // Assuming the API endpoint to generate/download PDF is `/download-pdf/{orderId}`
    window.open(`${API}/download-pdf/${orderId}`, '_blank');
  };


    // mode and type dropdowns

  const [selectedModes, setSelectedModes] = useState(
    items.map(() => 'regular') // Default mode to 'renewal' for all items
  );
  
  const [selectedTypes, setSelectedTypes] = useState(
    items.map(() => 'new') // Default type to 'new' for all items
  );
  
  const handleModeChange = (index, value) => {
    const updatedModes = [...selectedModes];
    updatedModes[index] = value;
    setSelectedModes(updatedModes);
  };
  
  const handleTypeChange = (index, value) => {
    const updatedTypes = [...selectedTypes];
    updatedTypes[index] = value;
    setSelectedTypes(updatedTypes);
  };
  

  return (
    <div className="purchase-order-container">
      {/* Top Section */}      
      <h3>Purchase Orders</h3>

      <div className="top-section">
        <div className="select-proforma">
          <select
            value={selectedProforma}
            onChange={(e) => handleProformaSelect(e.target.value)}
          >
            <option value="">Select a Proforma</option>
            {proformas.length > 0 ? (
              proformas.map((proforma) => (
                <option key={proforma.proforma_id} value={proforma.proforma_id}>
                  {proforma.proforma_tag} - {proforma.customer_name}
                </option>
              ))
            ) : (
              <option disabled>No proformas available</option>
            )}
          </select>
        </div>

      </div>

      {error && <div className="error-message-porder">{error}</div>}

      {/* Bottom Section: Review Items */}
      {selectedProforma && (
        <div className="bottom-section">
          {items.length === 0 ? (
            <p className='no-proforma'>No items available for this Proforma.</p>
          ) : (
            <table className="p-order-invoice-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Vendor Name</th>
                  <th>Vendor Address</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Discount</th>
                  <th>Mode</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Tax (18%)</th>
                  <th>Grand Total (with Tax)</th>
                </tr>
              </thead>
              <tbody>
              {items.map((item, index) => {
      const discountAmount = (discounts[index] / 100) * item.purchase_cost;
      const total = item.purchase_cost * item.quantity - discountAmount;
      const taxAmount = total * 0.18;
      const grandTotal = total + taxAmount;

                  return (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.company_name}</td>
                      <td>{item.address}</td>
                      <td>{item.quantity}</td>
                      <td>₹&nbsp;{item.purchase_cost}</td>
                      <td>
                        <input
                          type="number"
                          value={discounts[index] || 0}
                          onChange={(e) => handleDiscountChange(index, e.target.value)}
                          placeholder="Enter Discount"
                        />
                      </td>
                      {/* Mode Dropdown */}
                      <td>
  <select
    value={selectedModes[index] || 'regular'} // Default to 'renewal'
    onChange={(e) => handleModeChange(index, e.target.value)}
  >
    <option value="regular">Regular</option>
    <option value="lc">LC</option>
  </select>
</td>

<td>
  <select
    value={selectedTypes[index] || 'new'} // Default to 'new'
    onChange={(e) => handleTypeChange(index, e.target.value)}
  >
    <option value="new">New</option>
    <option value="renewal">Renewal</option>
  </select>
</td>

                      <td>₹&nbsp;{total.toFixed(2)}</td>
                      <td>₹&nbsp;{taxAmount.toFixed(2)}</td>
                      <td>₹&nbsp;{grandTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
      )}
{selectedProforma && items.length > 0 && (
  <button onClick={handleGeneratePurchaseOrder} disabled={loading}   className="submit-button-p-order">

{loading ? (
                      <>
                        <FaSpinner className="spinner" size={20} title='Submitting...'/>
                      </>
                    )  : (
                      <>
                        <FaFilePdf  size={24} title='Save & Generate PDF' className='New-p-order'/>
                      </>
                    )}
  </button>
)}

      {/* Pagination for Recent Orders */}
     

      {/* Recent Purchase Orders Section */}
      <div className="recent-orders-section">
        <h5>Recent Purchase Orders</h5>
        {recentOrders && recentOrders.length > 0 && (

        <div className="pagination-section">
        {totalPages > 0 && (
          <div>
            <label>Rows per page:</label>
            <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
              {[10, 20, 30].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            
          </div>
        )}
      </div>
      )}
        {recentOrders && recentOrders.length > 0 ? (
    <table className="purchase-orders-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Customer Name</th>
                <th>Product Name</th>
                <th>Vendor Name</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Download PDF</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.po_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.product_name}</td>
                  <td>{order.vendor}</td>
                  <td> ₹&nbsp;{order.total_amount.toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td>
                    <button onClick={() => handleDownloadPDF(order._id)} title='Download PDF'>
                    <HiDocumentArrowDown  />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-purchase-orders">No Recent Purchase Orders Found.</p>
        )}
      </div>
      {recentOrders && recentOrders.length > 0 && (
      <div className="pagination-controls">
              <button
                onClick={() => handleRecentOrdersPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              <span className='page-quote'>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handleRecentOrdersPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
               <FaChevronRight />
              </button>
            </div>
             )}
    </div>
  );
};

export default CreatePurchaseOrder;
