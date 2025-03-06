import React, { useEffect, useState } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdebeoOrders } from '../redux/slices/informationSlice';  // Action to fetch orders

const InvoiceSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.information);  // Accessing Redux state for orders
  const [activeTab, setActiveTab] = useState('');  // State to manage which tab is active

  // Debugging log to check customerId when the slider is opened
  useEffect(() => {
    console.log('Slider opened with customerId:', customerId);

    if (customerId) {
      dispatch(fetchAdebeoOrders({ customer_ID: customerId }));  // Dispatch action to fetch orders
    }
  }, [customerId, dispatch]);  // Re-run the effect if customerId changes

  // Show loading or error message
  if (status === 'loading') {
    return <div>Loading orders...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  // Function to handle tab click
  const handleTabClick = (productName) => {
    setActiveTab(productName); // Set active tab to the clicked product name
  };

  const formatDate = (dateString) => {
    // Check if the input dateString is an object (MongoDB format)
    if (dateString && dateString.$date) {
      dateString = dateString.$date;  // Extract the ISO date string from the MongoDB object
    }
  
    // Now `dateString` should be a valid ISO date string, so convert it to a Date object
    const date = new Date(dateString);
  
    // If it's still invalid, return 'Invalid Date'
    if (isNaN(date)) {
      return 'Invalid Date';
    }
  
    // Return formatted date as 'day month year' (e.g., "6 Mar 2025")
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',   // Day of the month (e.g., "6")
      month: 'short',    // Abbreviated month name (e.g., "Mar")
      year: 'numeric',   // Full year (e.g., "2025")
    });
  };
  
  
    
  return (
    <div className="invoice-slider-overlay">
      <div className="invoice-slider-container">
        <button className="close-btn" onClick={onClose}>
          <MdOutlineCancel />
        </button>

        <h3>Information</h3>
        <p>Customer ID: {customerId}</p>

        {/* Tabs for each product */}
        <div className="tabs">
          {Object.keys(orders).map((productName) => (
            <button
              key={productName}
              className={`tab-button ${activeTab === productName ? 'active' : ''}`}
              onClick={() => handleTabClick(productName)}
            >
              {productName}
            </button>
          ))}
        </div>

        {/* Render the content for the active tab */}
        {activeTab && orders[activeTab] && (
          <div className="tab-content">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Invoice PDF</th>
                </tr>
              </thead>
              <tbody>
                {orders[activeTab].map((order) => (
                  <tr key={order._id}>
                    <td>{order.order_number}</td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>{order.quantity}</td>
                    <td>{order.purchase_price}</td>
                    <td>{order.total_amount}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.Invoice_PDF_link ? (
                        <a href={order.Invoice_PDF_link} target="_blank" rel="noopener noreferrer">
                          View Invoice
                        </a>
                      ) : (
                        'No Invoice Available'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceSlider;
