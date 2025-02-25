import React from 'react';
import { MdOutlineCancel } from "react-icons/md";

const InvoiceSlider = ({ customerId, onClose }) => {
  if (!customerId) return null; // Prevent rendering if no customer selected

  return (
    <div className="invoice-slider-overlay">
      <div className="invoice-slider-container">
        <button className="close-btn" onClick={onClose}>
          <MdOutlineCancel />
        </button>
        <h3>Invoice Details </h3>
        <p>Customer ID: {customerId}</p>
        {/* Add invoice details here */}
      </div>
    </div>
  );
};

export default InvoiceSlider;
