import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { FaCheckCircle } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md"; 
import { IoIosWarning } from "react-icons/io";
import { LuFileCheck2 } from "react-icons/lu";
import { BiSolidMessageRoundedError } from "react-icons/bi";
import { BiSolidCommentCheck } from "react-icons/bi";
import {
  fetchVendorPurchaseOrders,  updateVendorPayment 
} from "../redux/slices/vendorPaymentSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Row, Col, Form } from "react-bootstrap";
import Select from "react-select";
import { useMemo } from "react";

const VendorPaymentSection = () => {
  const dispatch = useDispatch();
  const [selectedVendor, setSelectedVendor] = useState([]);
  const vendorToastRef = useRef(false);
  const [isShaking, setIsShaking] = useState(false);
  const [amountError, setAmountError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [comment, setComment] = useState("");
  const [paymentDate, setPaymentDate] = useState(
  new Date().toISOString().split("T")[0]
);

  const popupRef = useRef(null);
  
  const {
  recentOrders = [],
  loading,
  error,
  currentPage,
  totalPages,
} = useSelector((state) => state.vendorPayment || {});

  const [rowsPerPage, setRowsPerPage] = useState(1000);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

   dispatch(fetchVendorPurchaseOrders({
    page: page,
    rows_per_page: rowsPerPage,
    startDate,
    endDate,
    vendors: selectedVendor
  }));
  };
  
const reportVendorOptions = useMemo(() => {
  const map = new Map();

  recentOrders.forEach((order) => {
    const name = order.vendor_name;
    if (name) {
      map.set(name, { value: name, label: name });
    }
  });

  return Array.from(map.values());
}, [recentOrders]);

useEffect(() => {
  if (!reportGenerated) return;

  dispatch(
    fetchVendorPurchaseOrders({
      page: currentPage,
      rows_per_page: rowsPerPage,
      startDate,
      endDate,
      vendors: selectedVendor,
    })
  );
}, [dispatch, currentPage, rowsPerPage, reportGenerated]);

const toggleOrderSelection = (order) => {
  setSelectedOrders((prev) => {
    const exists = prev.some(o => o._id === order._id);

    // ✅ If already selected → just remove it (NO vendor check, NO toast)
    if (exists) {
      return prev.filter(o => o._id !== order._id);
    }

    // ✅ If first selection → allow
    if (prev.length === 0) {
      return [order];
    }

    // ❌ If different vendor → show toast ONLY for new selections
    if (prev[0].vendor_name !== order.vendor_name) {
      toast.error(
        "Purchase orders from different Vendors cannot be paid together... Please select orders from the same Vendor.",
        { toastId: "vendor-mismatch" } // prevents duplicate toasts
      );
      return prev;
    }

    // ✅ Same vendor → allow
    return [...prev, order];
  });
};


const totalSelectedAmount = selectedOrders.reduce(
  (sum, o) => sum + Number(o.total_amount || 0),
  0
);

const balanceAmount =
  paidAmount === "" ? totalSelectedAmount :
  totalSelectedAmount - Number(paidAmount || 0);

  const resetPaymentPopup = () => {
  setShowPaymentPopup(false);
  setPaidAmount("");
  setComment("");
  setAmountError("");
  setPaymentDate(new Date().toISOString().split("T")[0]);
};


  // const isAmountEntered = paidAmount !== "";
  // const note = comment.trim();

  // const isButtonDisabled =
  //   (!isAmountEntered && note === "");

const isButtonDisabled =
  paidAmount === "" && comment.trim() === "";

const audioRef = useRef(null);

useEffect(() => {
  audioRef.current = new Audio(
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  );
}, []);

useEffect(() => {
  return () => {
    dispatch({ type: "vendorPayment/resetVendorPayments" });
  };
}, [dispatch]);

 const filteredOrders = useMemo(() => {
  if (!selectedVendor || selectedVendor.length === 0) {
    return recentOrders;
  }

  return recentOrders.filter(order =>
    selectedVendor.some(v =>
      order.vendor_name?.toLowerCase().includes(v.toLowerCase())
    )
  );
}, [recentOrders, selectedVendor]);

return (
    <div className="vxpayment-container">
      <ToastContainer style={{ zIndex: 99999 }}/>

      <h3>Vendor Payments</h3>

{/* {loading && (
  <div className="loading-container-vxpay">
    <div className="loading-spinner-vxpay"></div>
    <p className="loading-message-vxpay">
      Loading Vendor Purchase Orders for Payment...
    </p>
  </div>
)} */}

{!loading && error && recentOrders.length  === 0 && (
  <div className="vxpay-error-box">
    <div className="vxpay-error-accent"></div>

    <div className="vxpay-error-content">
      <BiSolidMessageRoundedError className="vxpay-error-icon" />

      <div className="vxpay-error-text">
        <h6>Something went wrong</h6>
        <p> We couldn’t load the vendor purchase orders. Please refresh or try again later. </p>
      </div>
    </div>
  </div>
)}

{loading ? (
  <div className="loading-container-vxpay">
    <div className="loading-spinner-vxpay"></div>
    <p className="loading-message-vxpay">
      Loading Vendor Purchase Orders for Payment...
    </p>
  </div>
) : (
  <>
<Row  className="g-4 mt-3 date-row-vxpay justify-content-center">

  {/* Start Date */}
  <Col md={3}  className="date-col">
    <Form.Group className="form-group">
      <Form.Label className="required-label">Start Date</Form.Label>
      <Form.Control
        required
        className="dates-vxpay"
        type="date"
        value={startDate}
        max={today}
        onChange={(e) => {
          const selected = e.target.value;

          if (selected > today) {
            toast.warn("You cannot select a future Date!!", {
                                                                position: "top-right",
                                                                toastClassName: "toast-warn-zfix",
                                                                autoClose: 4000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "colored", // "light", "dark", or "colored"
                                                                 style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                                                  fontSize: "14px",       // ✅ Change font size
                                                                  fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                                  fontWeight: "bold",    // ✅ Make text bold
                                                                 },
                                                                 icon: <IoIosWarning  
                                                                 style={{ fontSize: '25px', color: 'white' }} />
                                                            });
            return;
          }

          setStartDate(selected);
          setEndDate("");
          setReportGenerated(false);
        }}
      />
    </Form.Group>
  </Col>

  {/* End Date */}
  <Col md={3}  className="date-col">
    <Form.Group className="form-group">
      <Form.Label className="required-label">End Date</Form.Label>
      <Form.Control
      required
      className="dates-vxpay"
        type="date"
        value={endDate}
        max={today}
        min={startDate || ""}
        onChange={(e) => {
          if (!startDate) {
            toast.warn("Please select Start Date first!", {
                                                                position: "top-right",
                                                                toastClassName: "toast-warn-zfix",
                                                                autoClose: 4000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "colored", // "light", "dark", or "colored"
                                                                 style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                                                  fontSize: "14px",       // ✅ Change font size
                                                                  fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                                  fontWeight: "bold",    // ✅ Make text bold
                                                                 },
                                                                 icon: <IoIosWarning  
                                                                 style={{ fontSize: '25px', color: 'white' }} />
                                                            });
            return;
          }

          const selected = e.target.value;

          if (selected > today) {
            toast.warn("You cannot select a future Date!!", {
                                                                position: "top-right",
                                                                toastClassName: "toast-warn-zfix",
                                                                autoClose: 4000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "colored", // "light", "dark", or "colored"
                                                                 style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                                                  fontSize: "14px",       // ✅ Change font size
                                                                  fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                                  fontWeight: "bold",    // ✅ Make text bold
                                                                 },
                                                                 icon: <IoIosWarning  
                                                                 style={{ fontSize: '25px', color: 'white' }} />
                                                            });
            return;
          }

          if (selected < startDate) {
            toast.warn("End Date cannot be before Start Date!", {
                                                                position: "top-right",
                                                                toastClassName: "toast-warn-zfix",
                                                                autoClose: 4000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "colored", // "light", "dark", or "colored"
                                                                 style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                                                  fontSize: "14px",       // ✅ Change font size
                                                                  fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                                  fontWeight: "bold",    // ✅ Make text bold
                                                                 },
                                                                 icon: <IoIosWarning  
                                                                 style={{ fontSize: '25px', color: 'white' }} />
                                                            });
            return;
          }

          setEndDate(selected);
          setReportGenerated(false);
        }}
      />
    </Form.Group>
  </Col>

   <Col md="auto" className="date-btn-col">
        <Form.Group className="form-group">
            <Form.Label className="invisible">&nbsp;</Form.Label>
    <button
     type="submit" 
     className="report-button-vxpay" 
     title="Generate Payment Report"
     onClick={() => {
        if (!startDate || !endDate) {
          toast.warn("Please select Start Date and End Date", {
                                                              position: "top-right",
                                                              toastClassName: "toast-warn-zfix",
                                                              autoClose: 4000,
                                                              hideProgressBar: false,
                                                              closeOnClick: true,
                                                              pauseOnHover: true,
                                                              draggable: true,
                                                              progress: undefined,
                                                              theme: "colored", // "light", "dark", or "colored"
                                                               style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                                                fontSize: "14px",       // ✅ Change font size
                                                                fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                                fontWeight: "bold",    // ✅ Make text bold
                                                               },
                                                               icon: <IoIosWarning  
                                                               style={{ fontSize: '25px', color: 'white' }} />
                                                          });
          return;
        }

        setReportGenerated(true);

        dispatch(
          fetchVendorPurchaseOrders({
            page: 1,
            rows_per_page: rowsPerPage,
            startDate,
            endDate,
            vendors: selectedVendor,
          })
        );
      }}
    >
      <LuFileCheck2 className="filecheck" />
    </button>

  </Form.Group>
 </Col>

</Row>

{/* Home button + Vendor filter */}
{!loading && !error && (
  <>
  {reportGenerated && (
<Row className="g-4 mt-3 align-items-end">

  
<Col md={3}>
    <Form.Group className="form-group">
      <Select
        className="VXPayment-select"
        classNamePrefix="VXPayment"
        menuPortalTarget={document.body}
        menuPosition="fixed"
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 })
        }}
        options={reportVendorOptions}
        isMulti
        value={selectedVendor.map(v => ({ value: v, label: v }))}
       onChange={(selectedOptions) => {

          if (!startDate || !endDate) {
            toast.warn("Please select Start Date and End Date before applying Vendor filter.", {
                                                                position: "top-right",
                                                                toastClassName: "toast-warn-zfix",
                                                                autoClose: 4000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "colored", // "light", "dark", or "colored"
                                                                 style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                                                  fontSize: "14px",       // ✅ Change font size
                                                                  fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                                  fontWeight: "bold",    // ✅ Make text bold
                                                                 },
                                                                 icon: <IoIosWarning  
                                                                 style={{ fontSize: '25px', color: 'white' }} />
                                                            });
            return;
          }

          const vendors =
            selectedOptions ? selectedOptions.map(opt => opt.value) : [];

          setSelectedVendor(vendors);
        }}
        
        isClearable
        placeholder="Select Vendor(s)"
      />
    </Form.Group>
  </Col>
  
  {/* Home button on RIGHT */}
  {recentOrders && recentOrders.length > 0 && currentPage > 1 && (
    <Col md="auto" className="ms-auto">
      <div className="pagination-home-vxpayment">
        <button onClick={() => handlePageChange(1)}>⏮ Home</button>
      </div>
    </Col>
  )}
</Row>
  )}
  
      {recentOrders && recentOrders.length > 0 ? (
        <table className="vxpayment-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>PO Number</th>
              <th>Customer Name</th>
              <th>Product Name</th>
              <th>Vendor Name</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Purchase Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const isCancelled =
                            order.status === "Cancelled" ||
                            order.status === "Disabled";
              const isPaid = order.status === "Paid";           
              return (
                <tr
                  key={order._id}
                  className={
                            order.status === "Paid"
                              ? "paid-row-vx"
                              : isCancelled
                              ? "cancelled-row-vx"
                              : ""
                          }
                  title={
                    order.status === "Cancelled"
                      ? "This PO is cancelled with the invoice"
                      : order.status === "Disabled"
                      ? "This PO is disabled"
                      : ""
                  }
                > 
                <td>
  <input
    type="checkbox"
    className="custom-checkbox-vxpay"
    disabled={isCancelled  || isPaid}
    checked={selectedOrders.some(o => o._id === order._id)}
    onChange={() => toggleOrderSelection(order)}
  />
</td>
                  <td>{order.po_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.product_name}</td>
                  <td>{order.vendor_name}</td>
                  <td>₹ {Number(order.total_amount || 0).toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td>{order.purchase_date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
  reportGenerated && (
    <p className="no-vxpayment">
      No Purchase Orders Found For Selected Date Range.
    </p>
  )
)}

      {recentOrders && recentOrders.length > 0 && (
        <div className="pagination-controls-vxpay">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>

          <span className="page-quote">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      )}

{reportGenerated && (
<div className="vx-proceed-wrapper">
  <button
    className={`vx-proceed-btn ${
      selectedOrders.length === 0 ? "disabled" : ""
    }`}
    disabled={selectedOrders.length === 0}
    title={
      selectedOrders.length === 0
        ? "Please select purchase orders to proceed with Vendor Payment."
        : "Proceed with Vendor Payment."
    }
    onClick={() => setShowPaymentPopup(true)}
  >
    <FaCheckCircle />
    Proceed
  </button>
</div>
)}

{showPaymentPopup && (
  <>
    {/* Overlay */}
    <div
  className="vx-popup-overlay"
  onClick={() => {
    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);
    }, 400);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }}
></div>
    
    {/* Popup */}
    <div
      className={`vx-payment-popup ${isShaking ? "shake-border" : ""}`}
      ref={popupRef}
      onClick={(e) => e.stopPropagation()}
    >

      {/* Header */}
      <div className="vx-popup-header">
        <h5>Vendor Payment Summary</h5>
        <MdOutlineCancel
          className="vx-popup-close"
          onClick={resetPaymentPopup}
        />
      </div>

      {/* Selected Orders Table */}
      <div className="vx-popup-body">
      <table className="vx-popup-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Product</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {selectedOrders.map(order => (
            <tr key={order._id}>
              <td>{order.vendor_name}</td>
              <td>{order.product_name}</td>
              <td>₹&nbsp;{Number(order.total_amount || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="vx-popup-total">
        <strong>Total: &nbsp; ₹ {totalSelectedAmount.toFixed(2)}</strong>
      </div>

      {/* Payment Row */}
      <div className="vx-payment-row">

        {/* Paid Amount */}
        <Form.Group className="vx-paid-group vx-paid-relative">
          <Form.Label>Paid Amount</Form.Label>
          <Form.Control
            type="number"
            value={paidAmount}
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
            const value = e.target.value;
            setPaidAmount(value);

            if (value !== "" && Number(value) > totalSelectedAmount) {
              setAmountError(
                `Paid amount cannot exceed total payable amount (₹${totalSelectedAmount.toFixed(2)})`
              );
            } else {
              setAmountError("");
            }
          }}
            placeholder="Enter amount"
          />
          {amountError && (
          <div className="vx-inline-error-modern">
            <BiSolidMessageRoundedError />
            <span>{amountError}</span>
          </div>
        )}
        </Form.Group>

        {/* Balance */}
        <div className="vx-balance-box">
          <span>Balance Amount</span>
          <strong>₹ {balanceAmount.toFixed(2)}</strong>
        </div>

      </div>

      <Row className="mt-2 gx-3">
  {/* Comment on left */}
  <Col md={8}>
    <Form.Group>
      <Form.Label>Comment</Form.Label>
      <Form.Control
        as="textarea"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add payment note..."
      />
    </Form.Group>
  </Col>

  {/* Payment Date on right */}
  <Col md={4}>
    <Form.Group>
      <Form.Label>Payment Date</Form.Label>
      <Form.Control
        style={{ color:"rgb(41, 41, 41)", fontWeight:600 }}
        type="date"
        required
        value={paymentDate}
        max={new Date().toISOString().split("T")[0]} // prevent future dates
        onChange={(e) => setPaymentDate(e.target.value)}
      />
    </Form.Group>
  </Col>
</Row>

      {/* Submit */}
      <div className="vx-submit-wrapper">
      <button
  disabled={isButtonDisabled}
  className="vx-submit-btn"
  title={
    isButtonDisabled
      ? "Please enter Paid Amount or Comment to enable Submission."
      : "Submit Vendor Payment"
  }
  onClick={() => {
    const isAmountEntered = paidAmount !== "";
    const amount = Number(paidAmount);
    const note = comment.trim() === "" ? null : comment.trim();
    // ❌ Rule 0: Inline amount error exists
    if (amountError) {
      return;
    }
    // ❌ Rule 1: Amount entered but <= 0 (ALWAYS error)
    if (isAmountEntered && amount <= 0) {
      toast.error("Paid amount must be greater than Zero (0).", {
                                                  position: "top-right",
                                                  autoClose: 4000,
                                                  hideProgressBar: false,
                                                  closeOnClick: true,
                                                  pauseOnHover: true,
                                                  draggable: true,
                                                  progress: undefined,
                                                  theme: "colored", // "light", "dark", or "colored"
                                                  style: { background: "rgba(252, 61, 61, 0.88)", color: "white", 
                                                    fontSize: "14px",       // ✅ Change font size
                                                    fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                    fontWeight: "bold",    // ✅ Make text bold
                                                   },
                                                   icon: <BiSolidMessageRoundedError  
                                                   style={{ fontSize: '20px', color: 'white' }} />
                                              });
      return;
    }

    // ❌ Rule 2: Both empty
    if (!isAmountEntered && note === null) {
      toast.error("Either Paid Amount or Comment must be provided", {
                                                  position: "top-right",
                                                  autoClose: 4000,
                                                  hideProgressBar: false,
                                                  closeOnClick: true,
                                                  pauseOnHover: true,
                                                  draggable: true,
                                                  progress: undefined,
                                                  theme: "colored", // "light", "dark", or "colored"
                                                  style: { background: "rgba(252, 61, 61, 0.88)", color: "white", 
                                                    fontSize: "14px",       // ✅ Change font size
                                                    fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                    fontWeight: "bold",    // ✅ Make text bold
                                                   },
                                                   icon: <BiSolidMessageRoundedError  
                                                   style={{ fontSize: '20px', color: 'white' }} />
                                              });
      return;
    }

    // ✅ Rule 3 & 4: valid cases
    const payload = {
    order_number: selectedOrders.map(o => o.po_number),
    payment_amount: isAmountEntered ? amount : 0,
    payment_date: paymentDate,
    comment: note
  };

    dispatch(updateVendorPayment(payload))
    .unwrap()
    .then((res) => {

      toast.success("Vendor Payment Submitted Successfully!", {
                                                  position: "top-right",
                                                  autoClose: 4000,
                                                  hideProgressBar: false,
                                                  closeOnClick: true,
                                                  pauseOnHover: true,
                                                  draggable: true,
                                                  progress: undefined,
                                                  theme: "colored", // "light", "dark", or "colored"
                                                  style: { background: "rgba(74, 163, 66, 1)", color: "white", 
                                                    fontSize: "14px",       // ✅ Change font size
                                                    fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                    fontWeight: "bold",    // ✅ Make text bold
                                                   },
                                                   icon: <BiSolidCommentCheck  
                                                   style={{ fontSize: '20px', color: 'white' }} />
                                              });

      // reset
      setSelectedOrders([]);
      resetPaymentPopup();

      // reload table
      dispatch(fetchVendorPurchaseOrders({
      page: currentPage,
      rows_per_page: rowsPerPage,
      startDate,
      endDate,
      vendors: selectedVendor
    }));

    })
    .catch((err) => {

      toast.error(err || "Vendor payment failed",{
                                                  position: "top-right",
                                                  autoClose: 4000,
                                                  hideProgressBar: false,
                                                  closeOnClick: true,
                                                  pauseOnHover: true,
                                                  draggable: true,
                                                  progress: undefined,
                                                  theme: "colored", // "light", "dark", or "colored"
                                                  style: { background: "rgba(252, 61, 61, 0.88)", color: "white", 
                                                    fontSize: "14px",       // ✅ Change font size
                                                    fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                                    fontWeight: "bold",    // ✅ Make text bold
                                                   },
                                                   icon: <BiSolidMessageRoundedError  
                                                   style={{ fontSize: '20px', color: 'white' }} />
                                              });

    });
  }}
>
  Submit Payment
</button>
</div> 
</div>
    </div>
  </>
)}
  </>

)} 

  </>
)}
    </div>

  );
};

export default VendorPaymentSection;