import React from 'react';
import { MdOutlineCancel } from "react-icons/md";

const CustomerInformationSlider = ({ customerId, onClose }) => {
  if (!customerId) return null; // Prevent rendering if no customer selected

  return (
    <div className="customerinformation-slider-overlay">
      <div className="customerinformation-slider-container">
        <button className="close-btn" onClick={onClose}>
          <MdOutlineCancel />
        </button>
        <h3>Customer Information</h3>
        <p>Customer ID: {customerId}</p>
        {/* Add invoice details here */}
      </div>
    </div>
  );
};

export default CustomerInformationSlider;