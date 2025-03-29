import React, { useEffect, useState, useRef } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdebeoOrders } from '../redux/slices/informationSlice';

const InvoiceSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.information);
  const [activeTab, setActiveTab] = useState('');
  const sliderRef = useRef(null); // Reference for the slider 

  useEffect(() => {
    console.log('Slider opened with customerId:', customerId);

    if (customerId) {
      dispatch(fetchAdebeoOrders({ customer_ID: customerId }));
    }
  }, [customerId, dispatch]);

  // Close slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        onClose(); // Trigger close if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (status === 'loading') {
    return (
      <div className="invoice-slider show" ref={sliderRef}>
        <div className="loading-container-invoice">
          <div className="loading-spinner-invoice"></div>
          <div className="loading-message-invoice">Loading Orders...</div>
        </div>
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <div className="invoice-slider show" ref={sliderRef}>
        <div className="error-container-invoice">
          <div className="error-message-invoice">Error: {error}</div>
        </div>
      </div>
    );
  }
  

  const handleTabClick = (productName) => {
    setActiveTab(productName);
  };

  const formatDate = (dateString) => {
    if (dateString && dateString.$date) {
      dateString = dateString.$date;
    }
    const date = new Date(dateString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="invoice-slider show" ref={sliderRef}>
      <div className="invoice-slider-content" >
        <div className="invoice-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <h4>Account Overview of
            </h4>
            <p>Customer Name</p>
          </div>
          <MdOutlineCancel onClick={onClose} className="close-slider" title="Close" />
        </div>

        <div className="tabs dynamic-grid">
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

        {activeTab && orders[activeTab] && (
          <div className="tab-content">
            <h4>Order Details
            </h4>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  <th>Validity</th> 
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Download Invoice </th>
                </tr>
              </thead>
              <tbody>
                {orders[activeTab].map((order) => (
                  <tr key={order._id}>
                    <td>{order.order_number}</td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>{formatDate(order.validity)}</td>
                    <td>{order.quantity}</td>
                    <td>₹&nbsp;{order.purchase_price}</td>
                    <td>₹&nbsp;{order.total_amount}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.pdf_link ? (
                        <a href={`${order.base_url}${order.pdf_link}`} target="_blank" rel="noopener noreferrer">
                          View Invoice PDF
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
