import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerPaymentsAsync, processCustomerPaymentAsync } from '../redux/slices/customerPaymentSlice';  // Adjust the path as necessary

const CustomerPaymentSection = () => {
  const dispatch = useDispatch();
  const { payments, loading, error, currentPage = 1, totalPages = 1, totalCount = 0 } = useSelector((state) => state.customerPayment);

  const [editablePayments, setEditablePayments] = useState([]);  // Store payments with editable 'paid_amount' and comment

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

  // Guard to prevent showing errors during loading phase
  if (loading) {
    return <div>Loading...</div>;
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
      <table className="payments-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Total Amount</th>
            <th>Amount Due</th>
            <th>Invoice Date</th>
            <th>Status</th>
            <th>Paid Amount</th>
            <th>Comment</th> {/* New column for the comment */}
            <th>Actions</th>
            <th>Invoice PDF</th>
          </tr>
        </thead>
        <tbody>
          {editablePayments.length > 0 ? (
            editablePayments.map((payment, index) => (
              <tr key={payment.invoice_number}>
                <td>{payment.invoice_number}</td>
                <td>{payment.total_amount}</td>
                <td>{payment.amount_due}</td>
                <td>{new Date(payment.invoice_date).toLocaleDateString()}</td>
                <td>{payment.payment_status}</td>
                <td>
                  <input
                    type="number"
                    value={payment.paid_amount}
                    onChange={(e) => handlePaidAmountChange(index, e.target.value)}
                    disabled={payment.payment_status === 'Completed'}
                  />
                </td>
                <td>
                  <textarea
                    value={payment.comment}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    placeholder="Enter payment details (max 50 words)"
                    maxLength={250}  // Limit to 50 words (approx. 250 characters)
                    rows={3}
                    disabled={payment.payment_status === 'Completed'}
                  />
                </td>
                <td>
                  {payment.payment_status === 'Pending' && (
                    <button onClick={() => handleSubmit(index, payment)}>
                      Submit
                    </button>
                  )}
                </td>
                <td>
                  {payment.pdf_filename ? (
                    <a href={payment.pdf_filename} target="_blank" rel="noopener noreferrer">
                      View Invoice PDF
                    </a>
                  ) : (
                    'No PDF Available'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No payments found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerPaymentSection;
