import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerPaymentsAsync, processCustomerPaymentAsync } from '../redux/slices/customerPaymentSlice';  // Adjust the path as necessary
import { FaCheckCircle } from "react-icons/fa"; // changed---Import the check-circle icon 
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RiInformation2Fill } from "react-icons/ri";
import { generateInvoicePdfAsync } from '../redux/slices/customerPaymentSlice';

const CustomerPaymentSection = () => {
  const dispatch = useDispatch();
  const { payments, loading, error, pdfGenerating, pdfError, pdfFilePath ,currentPage = 1, totalPages = 1, totalCount = 0 } = useSelector((state) => state.customerPayment);

  const [editablePayments, setEditablePayments] = useState([]);  // Store payments with editable 'paid_amount' and comment
  
  const handleGeneratePDF = (invoiceNumber) => {
    dispatch(generateInvoicePdfAsync(invoiceNumber));
  };
  
  // useEffect(() => {
  //   if (error) {
  //     console.error('Error fetching payments:', error);  // Log the error to the console
  //   }
  // }, [error]);
  // Dispatch action to fetch payments only when currentPage and totalPages are valid
  useEffect(() => {
    console.log('Dispatching fetchCustomerPaymentsAsync with page:', currentPage);

    // Ensure page number is valid before dispatching
    if (currentPage > 0 && totalPages > 0) {
      dispatch(fetchCustomerPaymentsAsync({ page: currentPage, per_page: 10 }));
    }
  }, [dispatch, currentPage, totalPages]);

  // Initialize editablePayments when payments are updated
  useEffect(() => {
    if (payments && payments.length > 0) {
      const initializedPayments = payments.map(payment => ({
        ...payment,
        paid_amount: payment.paid_amount || 0,  // Default paid_amount to 0 if undefined
        comment: payment.comment || ''  // Initialize comment field
      }));
      console.debug('Initialized editable payments:', initializedPayments);
      setEditablePayments(initializedPayments);
    }
  }, [payments]);

  // Guard to prevent showing errors during loading phase ---- CHANGES MADE
  if (loading) {
    return (
      <div className="loading-container-pinvoice">
        <div className="loading-spinner-pinvoice"></div>
        <p className="loading-message-pinvoice"> Please wait...</p>
      </div>
    );
  }
  

  // Handle errors gracefully only if there's no valid payment data
  if (error && payments.length === 0 && !loading) {
    return <div className="error">An error occurred while fetching payment data. Please try again later.</div>;
  }

  // Handle Paid Amount change
  const handlePaidAmountChange = (index, value) => {
    const updatedPayments = [...editablePayments];
    updatedPayments[index].paid_amount = parseFloat(value) || 0;  // Ensure it's a valid number
    setEditablePayments(updatedPayments);
  };

  // Handle Comment change
  const handleCommentChange = (index, value) => {
    const updatedPayments = [...editablePayments];
    updatedPayments[index].comment = value;  // Update the comment field
    setEditablePayments(updatedPayments);
  };

  // Handle submit button click for processing payment
  const handleSubmit = (index, payment) => {
    if (payment.payment_status === 'Pending') {
      const updatedPayment = {
        ...payment,
        paid_amount: editablePayments[index].paid_amount, // Updated paid amount
        comment: editablePayments[index].comment, // Include the comment field
        payment_status: (payment.amount_due <= editablePayments[index].paid_amount) ? 'Completed' : 'Pending',
        amount_due: payment.amount_due - editablePayments[index].paid_amount,
      };
      dispatch(processCustomerPaymentAsync(updatedPayment)).then(() => {
        // After payment is processed, update the editablePayments state
        const updatedPayments = [...editablePayments];
        updatedPayments[index] = updatedPayment;  // Update the specific payment in the state
        setEditablePayments(updatedPayments);  // Re-render with the updated value
      });
    }
  };

  // Define handlePageChange for pagination
  const handlePageChange = (newPage) => {
    // Guard clause for invalid page changes
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(fetchCustomerPaymentsAsync({ page: newPage, per_page: 10 }));
    }
  };

  return (
    <div className="customer-payment-section">
      <h2>Customer Payments</h2>

      {/* Display the payment records in a table */}
      {/* Show "No payments found" outside the table if there are no payments */}
{editablePayments.length === 0 ? (
  <div className="no-payments-message">No Payments Found.</div>
) : (
  <table className="payments-table">
    <thead>
      <tr>
        <th>PDF Gen</th> {/* New Info column */}
        <th>Invoice Number</th>
        <th>Client</th>
        <th>Total Amount</th>
        <th>Amount Due</th>
        <th>Invoice Date</th>
        <th>Status</th>
        <th>Paid Amount</th>
        <th>Comment</th>
        <th>Actions</th>
        <th>Download PDF</th>
        <th>Info</th> {/* New Info column */}
      </tr>
    </thead>
    <tbody>
      {editablePayments.map((payment, index) => (
        <tr key={payment.invoice_number}>
           <td>
          <button 
            className="pdf-gen-button" 
            onClick={() => handleGeneratePDF(payment.invoice_number)} // Function to handle PDF generation
          >
            Generate PDF
          </button>
        </td>
          <td>{payment.invoice_number}</td>
          <td>{payment.customer_name}</td>
          <td>{payment.total_amount}</td>
          <td>{payment.amount_due}</td>
          <td>{new Date(payment.invoice_date).toLocaleDateString()}</td>
          <td>{payment.payment_status}</td>
          <td>
            <input
              type="number"
              value={payment.paid_amount}
              onChange={(e) => handlePaidAmountChange(index, e.target.value)}
              disabled={payment.payment_status === "Completed"}
            />
          </td>
          <td>
            <textarea
              value={payment.comment}
              onChange={(e) => handleCommentChange(index, e.target.value)}
              placeholder="Enter payment details (max 50 words)"
              maxLength={250}
              rows={3}
              disabled={payment.payment_status === "Completed"}
            />
          </td>
          <td>
            {payment.payment_status === "Pending" && (
              <FaCheckCircle
                title="Submit"
                className={`submit-icon ${payment.amount_due === 0 ? "disabled" : ""}`}
                onClick={() => {
                  if (payment.amount_due === 0) {
                    alert("Payment already completed. No submission required.");
                  } else {
                    handleSubmit(index, payment);
                  }
                }}
              />
            )}
          </td>
          <td>
              {payment.pdf_link ? (
                <a href={`${payment.base_url}${payment.pdf_link}`} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              ) : (
                "No PDF Available"
              )}
            </td>
          <td>
             <RiInformation2Fill   title=" Payment Information" className="action-icon-payment"   // Pass customer ID
               />
          </td>
       </tr>
      ))}
    </tbody>
  </table>
)}


      {/* Pagination controls */}
      {/* Show Pagination only if there are payments */}
      {totalPages > 1 && editablePayments.length > 0 && (
          <div className="pagination-controls">
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
    </div>
  );
};

export default CustomerPaymentSection;

