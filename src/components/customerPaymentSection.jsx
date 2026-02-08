import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerPaymentsAsync, processCustomerPaymentAsync, setSearchTerm } from '../redux/slices/customerPaymentSlice';  // Adjust the path as necessary
import { FaCheckCircle } from "react-icons/fa"; // changed---Import the check-circle icon 
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RiInformation2Fill } from "react-icons/ri";
import { generateInvoicePdfAsync } from '../redux/slices/customerPaymentSlice';
import { FaFileDownload, FaFilePdf } from 'react-icons/fa'; // added
import { CiFileOff } from "react-icons/ci"; // added
import { FaDownload } from "react-icons/fa6";// added
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { recreateInvoiceAsync } from '../redux/slices/customerPaymentSlice';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const CustomerPaymentSection = () => {
  const dispatch = useDispatch();
  const { payments, loading, pageLoading, error, pdfGenerating, pdfError, pdfFilePath , totalPages = 1, totalCount = 0 } = useSelector((state) => state.customerPayment);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const [editablePayments, setEditablePayments] = useState([]);  // Store payments with editable 'paid_amount' and comment
  const [currentPage, setCurrentPage] = useState(1); // local state
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
  if (currentPage > 0 && totalPages > 0) {
    dispatch(fetchCustomerPaymentsAsync({
      page: currentPage,
      per_page: 10,
      search: searchTerm,   // 🔥 add this
    }));
  }
}, [dispatch, currentPage, totalPages, searchTerm]);

  
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


useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300); // 300ms debounce

  return () => clearTimeout(handler);
}, [searchTerm]);

useEffect(() => {
  dispatch(fetchCustomerPaymentsAsync({ page: 1, per_page: 10, search: debouncedSearch }));
}, [dispatch, debouncedSearch]);

  // // Guard to prevent showing errors during loading phase ---- CHANGES MADE
  // if (pageLoading ) {
  //   return (
  //     <div className="loading-container-pinvoice">
  //       <div className="loading-spinner-pinvoice"></div>
  //       <p className="loading-message-pinvoice"> Please wait...</p>
  //     </div>
  //   );
  // }
  

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

  const handleSubmit = async (index, payment) => {
  const rawPaidAmount = editablePayments[index]?.paid_amount;
  const paidAmount =
    rawPaidAmount === "" || rawPaidAmount === undefined
      ? 0
      : Number(rawPaidAmount);

  const newComment = editablePayments[index]?.comment?.trim() || "";

  // ❌ Block if BOTH empty
  if (paidAmount <= 0 && !newComment) {
    toast.info("Please enter Paid Amount or Comment");
    return;
  }

  const remaining = payment.amount_due - paidAmount;

  const updatedPayment = {
    ...payment,
    paid_amount: paidAmount,
    comment: newComment,
    amount_due: remaining,
    payment_status: remaining <= 0 ? "Completed" : "Pending",
  };

  try {
    const res = await dispatch(
      processCustomerPaymentAsync(updatedPayment)
    ).unwrap(); // 🔥 important

    // ✅ SUCCESS toast ONLY here
    toast.success("Payment processed successfully");

    // reset inputs
    const updatedPayments = [...editablePayments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      paid_amount: "",
      comment: "",
    };
    setEditablePayments(updatedPayments);

  } catch (err) {
  // unwrap() gives the rejectWithValue payload
  const errorMessage = err || "Failed to process payment";
  toast.error(errorMessage); // now shows exact backend message
}
};

  // Define handlePageChange for pagination
const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};

  return (
    <div className="customer-payment-section">
      <h2>Customer Payments</h2>
      
  <div className="search-section">
      <input
  type="text"
  placeholder="Search by Invoice Number..."
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to page 1
  }}
  className="search-by-invoice-number"
/>
</div>

       {/* Go to First Page button (Top) */}
{currentPage > 1 && (
  <div className="pagination-home-cx">
    <button onClick={() => handlePageChange(1)}>⏮ Home</button>
  </div>
)}


<ToastContainer />

      {/* Display the payment records in a table */}
      {/* Show "No payments found" outside the table if there are no payments */}
 {pageLoading ? (
  <div className="inline-page-spinner">
    <div className="spinner"></div>
    <p>Loading payments...</p>
  </div>
) :
editablePayments.length === 0 ? (
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
        <th>TDS Gen</th>
        <th>Info</th> {/* New Info column */}
        <th>Reg-inv</th>
      </tr>
    </thead>
    <tbody>
        {editablePayments.map((payment, index) => (
        <tr
    key={payment.invoice_number}
  className={
      payment.payment_status === "Cancelled"
        ? "cancelled-row"
        : payment.payment_status === "Regenerated"
        ? "regenerated-row"
        : payment.payment_status === "Disabled"
        ? "cancelled-row"
        : ""}
  >

  <td>
  <button
    className={`cxpay ${
    payment.payment_status === "Cancelled" ||
    payment.payment_status === "Regenerated" ||
    payment.payment_status === "Disabled"
      ? "is-disabled"
      : ""
    }`}
    onClick={() => {
      if (payment.payment_status === "Cancelled") {
        toast.info(`This invoice  ${payment.invoice_number} is cancelled. PDF cannot be generated.`);
      } else if (payment.payment_status === "Regenerated") {
        toast.info(`This invoice ${payment.invoice_number} is regenerated. Please generate PDF from there`);
      } else if (payment.payment_status === "Disabled") {
      toast.info(`This invoice ${payment.invoice_number} is disabled. PDF generation is not allowed.`);
    } else {
        toast.info(`PDF for Invoice ${payment.invoice_number} is generated..`);
        handleGeneratePDF(payment.invoice_number);
      }
    }}
    disabled={payment.payment_status === "Cancelled" || payment.payment_status === "Regenerated" ||
    payment.payment_status === "Disabled"}
  title={
    payment.payment_status === "Cancelled"
      ? "Cancelled – PDF cannot be generated"
      : payment.payment_status === "Regenerated"
      ? "Regenerated – Generate PDF from new invoice"
      : payment.payment_status === "Disabled"
      ? "Disabled – PDF generation not allowed"
      : "Generate PDF"
  }
  >
    <FaFilePdf />
  </button>


    </td>
    <td>{payment.invoice_number}</td>
    <td>{payment.customer_name}</td>
    <td>₹&nbsp;{payment.total_amount}</td>
    <td>₹&nbsp;{payment.amount_due}</td>
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
  disabled={
    payment.amount_due <= 0 ||
    payment.payment_status === "Cancelled" ||
    payment.payment_status === "Regenerated" ||
    payment.payment_status === "Disabled"
  }

    />
  </td>

  {/* Comment */}
  <td>
    <textarea
    value={editablePayments[index]?.comment || ""}
    onChange={(e) => handleCommentChange(index, e.target.value)}
    placeholder="Enter payment details.."
    rows={3}
    disabled={
    payment.amount_due <= 0 ||
    payment.payment_status === "Cancelled" ||
    payment.payment_status === "Regenerated" ||
    payment.payment_status === "Disabled"
  }

  />

  </td>


  {/* Action Submit */}
  <td>
    {payment.payment_status === "Pending" || payment.payment_status === "Inprog" ? (
      <FaCheckCircle
        title={
          payment.amount_due === 0
            ? "Payment complete — nothing to submit"
            : "Submit payment"
        }
        className={`submit-icon ${payment.amount_due === 0 ? "is-disabled" : ""}`}
        onClick={() => {
          if (payment.amount_due === 0) {
            toast.info(
              `Payment for ${payment.invoice_number} is already completed. No submission required.`
            );
          } else {
            handleSubmit(index, payment);
          }
        }}
      />
    ) : payment.payment_status === "Cancelled" ? (
      <FaCheckCircle
        title="Submission disabled — invoice cancelled"
        className="submit-icon is-disabled"
        onClick={() =>
          toast.info(
            `For ${payment.invoice_number}, Submission disabled. Invoice is cancelled.`
          )
        }
      />
    ) : payment.payment_status === "Regenerated" ? (
      <FaCheckCircle
        title="Submission disabled — invoice regenerated"
        className="submit-icon is-disabled"
        onClick={() =>
          toast.info(
            `For ${payment.invoice_number}, invoice is already regenerated. Try submission from there.`
          )
        }
      />
    ) : (
      <FaCheckCircle
        className="submit-icon is-disabled"
        title="Submission disabled"
        onClick={() =>
          toast.info(`Payment for ${payment.invoice_number} is Disabled.`)
        }
      />
    )}
  </td>


  {/* Download PDF */}
  <td>
    {payment.payment_status === "Cancelled" ? (
      <FaFileDownload
        className="rowdown is-disabled"
        title="Download disabled — invoice cancelled"
        onClick={() =>
          toast.info(
            `For ${payment.invoice_number}, Download disabled. Invoice is cancelled.`
          )
        }
      />
    ) : payment.payment_status === "Regenerated" ? (
      <FaFileDownload
        className="rowdown is-disabled"
        title="Download disabled — invoice regenerated"
        onClick={() =>
          toast.info(
            `For ${payment.invoice_number}, Download disabled. Invoice already regenerated. Please download from there.`
          )
        }
      />
    ) : payment.payment_status === "Disabled" ? (
      <FaFileDownload
        title="Download disabled — invoice disabled"
        className="rowdown is-disabled"
        onClick={() =>
          toast.info(
            `For ${payment.invoice_number}, submission disabled. Invoice is disabled.`
          )
        }
      />
    ): payment.pdf_link ? (
      <a
        href={`${payment.base_url}${payment.pdf_link}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          toast.info(
            `Downloading PDF for Invoice ${payment.invoice_number}`
          )
        }
      >
        <FaFileDownload className="rowdown" title="Download PDF" />
      </a>
    ) : (
      <CiFileOff
        className="nopdf"
        title="No PDF Available"
        onClick={() =>
          toast.info(
            `No PDF available for ${payment.invoice_number} invoice.`
          )
        }
      />
    )}
  </td>


  <td>
    <FaFileInvoiceDollar 
      title={
        payment.payment_status === "Cancelled"
          ? "TDS Generation Disabled — invoice cancelled"
          : payment.payment_status === "Regenerated"
          ? "TDS Generation Disabled — invoice regenerated"
          : payment.payment_status === "Disabled"
          ? "TDS Generation Disabled — invoice disabled"
          : "Generate TDS"
      }
      className={`action-icon-payment ${
        payment.payment_status === "Cancelled" ||
        payment.payment_status === "Regenerated" ||
        payment.payment_status === "Disabled"
          ? "is-disabled"
          : ""
      }`}
    />
  </td>

    <td>
    <RiInformation2Fill
      title={
        payment.payment_status === "Cancelled"
          ? "Disabled — invoice cancelled"
          : payment.payment_status === "Regenerated"
          ? "Disabled — invoice regenerated"
          : payment.payment_status === "Disabled"
          ? "Disabled — invoice disabled"
          : "Payment Information"
      }
      className={`action-icon-payment ${
        payment.payment_status === "Cancelled" ||
        payment.payment_status === "Regenerated" ||
        payment.payment_status === "Disabled"
          ? "is-disabled"
          : ""
      }`}
    />
  </td>



    {/* Regenerate Invoice  */}
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
        dispatch(recreateInvoiceAsync(payment.invoice_id?._id || payment.invoice_id));} }}
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

