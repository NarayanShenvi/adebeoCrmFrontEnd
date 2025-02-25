import React from 'react';
import { MdOutlineCancel } from "react-icons/md";

const POInvoiceSlider = ({ customerId, onClose }) => {
  if (!customerId) return null; // Prevent rendering if no customer selected

  return (
    <div className="POinvoice-slider-overlay">
      <div className="POinvoice-slider-container">
        <button className="close-btn" onClick={onClose}>
          <MdOutlineCancel />
        </button>
        <h3>PO Invoice Details</h3>
        <p>Customer ID: {customerId}</p>
        {/* Add invoice details here */}
      </div>
    </div>
  );
};

export default POInvoiceSlider;