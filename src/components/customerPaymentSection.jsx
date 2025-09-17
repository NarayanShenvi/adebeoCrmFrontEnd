import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerPaymentsAsync, processCustomerPaymentAsync } from '../redux/slices/customerPaymentSlice';  // Adjust the path as necessary
import { FaCheckCircle } from "react-icons/fa"; // changed---Import the check-circle icon 
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RiInformation2Fill } from "react-icons/ri";
import { generateInvoicePdfAsync } from '../redux/slices/customerPaymentSlice';
import { FaFileDownload, FaFilePdf } from 'react-icons/fa'; // added
import { CiFileOff } from "react-icons/ci"; // added
import { FaDownload } from "react-icons/fa6";// added
import { recreateInvoiceAsync } from '../redux/slices/customerPaymentSlice';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

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
      paid_amount: payment.paid_amount || 0,
      comment: payment.comment || '',
      canRegenerate: payment.payment_status === 'Cancelled' || payment.isEnableInvoicePurchase === false
    }));
    setEditablePayments(initializedPayments);
  } else {
    setEditablePayments([]);
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
<ToastContainer />

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
        <th>Action</th>
        <th><FaDownload className='header-down'/>
        </th>
        <th>Info</th> {/* New Info column */}
        <th>Reg-inv</th>
      </tr>
    </thead>
    <tbody>
      {editablePayments.map((payment, index) => (
       <tr
  key={payment.invoice_number}
  className={payment.payment_status === "Cancelled" ? "cancelled-row" : ""}
>

 <td>
<button 
  className={`cxpay ${payment.payment_status === "Cancelled" ? "is-disabled" : ""}`}
onClick={() => {
    if (payment.payment_status === "Cancelled") {
      toast.info("This invoice is cancelled. PDF cannot be generated.");
    } else {
      toast.info(`PDF for Invoice ${payment.invoice_number} is generated..`);
      handleGeneratePDF(payment.invoice_number);
    }
  }}
  disabled={payment.payment_status === "Cancelled"}
  title={payment.payment_status === "Cancelled" ? "Disabled" : "Generate PDF"}
>
  <FaFilePdf />
</button>


  </td>
  <td>{payment.invoice_number}</td>
  <td>{payment.customer_name}</td>
  <td>{payment.total_amount}</td>
  <td>{payment.amount_due}</td>
  <td>{new Date(payment.invoice_date).toLocaleDateString()}</td>
  <td>{payment.payment_status}</td>

 {/* Paid Amount */}
<td>
  <input
    type="number"
    value={payment.paid_amount || ""}
    onChange={(e) => {
      const value = e.target.value;
      if (value === "" || parseFloat(value) >= 0) {
        handlePaidAmountChange(index, value);
      }
    }}
    min="0"
    disabled={payment.payment_status !== "Pending"}
  />
</td>

{/* Comment */}
<td>
  <textarea
    value={payment.comment}
    onChange={(e) => handleCommentChange(index, e.target.value)}
    placeholder="Enter payment details (max 50 words)"
    maxLength={250}
    rows={3}
    disabled={payment.payment_status !== "Pending"}
  />
</td>


 {/* Action Submit */}
<td>
  {payment.payment_status === "Pending" ? (
    <FaCheckCircle
      title={
        payment.amount_due === 0
          ? "Payment complete — nothing to submit"
          : "Submit payment"
      }
      className={`submit-icon ${payment.amount_due === 0 ? "is-disabled" : ""}`}
      onClick={() => {
    if (payment.amount_due === 0) {
      toast.info(`Payment for ${payment.invoice_number}is  already completed. No submission required.`);
    } else {
      toast.info(`Submitting payment for Invoice ${payment.invoice_number}...`);
      handleSubmit(index, payment);
    }
  }}
    />
  ) : payment.payment_status === "Cancelled" ? (
    <FaCheckCircle
      title="Submission disabled — invoice cancelled"
      className="submit-icon is-disabled"
            onClick={() => toast.info(`For ${payment.invoice_number}, Submission disabled. Invoice is cancelled.`)}

    />
  ) : (
    <CiFileOff
      className="nopdf"
      title="Submission disabled — not pending"
            onClick={() => toast.info(`Payment for ${payment.invoice_number}is  already completed. No submission required.`)}
    />
  )}
</td>

{/* Download PDF */}
<td>
  {payment.payment_status === "Cancelled" ? (
    <FaFileDownload
      className="rowdown is-disabled"
      title="Download disabled — invoice cancelled"
      onClick={() => toast.info(`For ${payment.invoice_number}, Download disabled. Invoice is cancelled.`)}
    />
  ) : payment.pdf_link ? (
    <a
      href={`${payment.base_url}${payment.pdf_link}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => toast.info(`Downloading PDF for Invoice ${payment.invoice_number}`)}
    >
      <FaFileDownload className="rowdown" title="Download PDF" />
    </a>
  ) : (
    <CiFileOff className="nopdf" title="No PDF Available" 
        onClick={() => toast.info(`No PDF available for ${payment.invoice_number} invoice.`)}
/>
  )}
</td>


  <td>
  <RiInformation2Fill
    title={payment.payment_status === "Cancelled" ? "Disabled" : "Payment Information"}
    className={`action-icon-payment ${payment.payment_status === "Cancelled" ? "is-disabled" : ""}`}
  />
</td>


  {/* Regenerate Invoice */}
  <td>
    <button
  className={`regen-btn ${payment.canRegenerate ? "" : "is-disabled"}`}
  disabled={!payment.canRegenerate}
  onClick={() =>
     {
    if (!payment.canRegenerate) {
      toast.info(`Regeneration only allowed for cancelled invoices. ${payment.invoice_number} is not cancelled!!`);
    } else {
      toast.info(`Re-generating Invoice ${payment.invoice_number}...`);
       dispatch(recreateInvoiceAsync({ invoice_id: payment.invoice_id, old_invoice_id: payment.invoice_id }));} }}
  title={
    payment.canRegenerate
      ? "Re-generate Invoice"
      : "Regeneration only allowed for cancelled invoices"
  }
>
  ♻
</button>

  </td>
</tr>
     ))}
    </tbody>
  </table>
)}


      {/* Pagination controls */}      {/* Pagination controls */}

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

