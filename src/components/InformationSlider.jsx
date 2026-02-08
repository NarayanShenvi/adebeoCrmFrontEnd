import React, { useEffect, useState, useRef } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdebeoOrders } from '../redux/slices/informationSlice';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const InvoiceSlider = ({ customerId, companyName, onClose }) => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.information);
  const [activeTab, setActiveTab] = useState('');
  const sliderRef = useRef(null); // Reference for the slider 
  const allOrders = activeTab && orders[activeTab] ? orders[activeTab] : [];
const [currentPage, setCurrentPage] = useState(1);

const itemsPerPage = 5; // adjust as needed
const totalPages = Math.ceil(allOrders.length / itemsPerPage);
const currentOrders = allOrders.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};


  useEffect(() => {
    console.log('Slider opened with customerId:', customerId);

    if (customerId) {
      dispatch(fetchAdebeoOrders({ customer_ID: customerId }));
    }
  }, [customerId, dispatch]);
// Inside your component


  // Reset page on tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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

  // Pagination logic
  
  return (
    <div className="invoice-slider show" ref={sliderRef}>
      <div className="invoice-slider-content" >
        <div className="invoice-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div className="invoice-header">
            <h4>Account Overview of:
            </h4>
              <span className="invcompany-name">{companyName || "Customer"}</span>
</div>

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



<div className="invoice-table-wrapper">

  {/* Invoice Header with Home button */}
<div className="information-header">
  <h4>Orders</h4>

  {currentPage > 1 && (
    <div className="pagination-home-information-slider">
      <button onClick={() => handlePageChange(1)}>
        ⏮ Home
      </button>
    </div>
  )}
</div>

       {currentOrders.length > 0 && (
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
        <th>Download Invoice</th>
      </tr>
    </thead>
    <tbody>
      {currentOrders.map((order) => (
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
              <a
                href={`${order.base_url}${order.pdf_link}`}
                target="_blank"
                rel="noopener noreferrer"
              >
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
  
)}        

{/* Pagination controls */}
            {totalPages > 1 && currentOrders.length > 0 && (
              <div className="pagination-controls-inv">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <FaChevronLeft />
                </button>

                <span className="page-quote">
                  Page {currentPage} of {totalPages}
                </span>

                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  <FaChevronRight />
                </button>
              </div>
            )}
      </div></div>
    </div>
  );
};

export default InvoiceSlider;
