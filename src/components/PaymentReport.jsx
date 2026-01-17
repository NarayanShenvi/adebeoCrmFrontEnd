  import React, { useState, useEffect, useRef, useMemo } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import axios from "axios";
  import { Form, Row, Col } from "react-bootstrap";
  import { LuFileCheck2 } from "react-icons/lu";
  import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

  import { fetchPaymentReport, resetPaymentReport } from "../redux/slices/reportSlice";
  import { fetchCustomerAsync, clearCustomers } from "../redux/slices/customerSlice"; // adjust path/names if different
  import Select from "react-select";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { ToastContainer } from "react-toastify"; 
  import { BiSolidMessageRoundedError } from "react-icons/bi";
  import { IoIosWarning } from "react-icons/io";
  import { BiSolidCommentCheck } from "react-icons/bi";

  const PaymentReport = () => {
    const dispatch = useDispatch();

    // Dates
    const today = new Date().toISOString().split("T")[0];
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Filters
    const [selectedCustomerId, setSelectedCustomerId] = useState([]);
    const [selectedCustomerObj, setSelectedCustomerObj] = useState([]); // full object if you need
    
    // Search UI state - Customers
    const [searchQuery, setSearchQuery] = useState("");
    const [localSearchLoading, setLocalSearchLoading] = useState(false);
    const searchDebounceRef = useRef(null);

    // Pagination & report
    const [page, setPage] = useState(1);
    const [reportGenerated, setReportGenerated] = useState(false);

    // Redux slices
  const {
    paymentReports = [],
    paymentLoading,
  } = useSelector((state) => state.report);

    const { customers = [], loading: customersLoading } = useSelector(
      (state) => state.customers || {}
    ); // adjust if customers slice key differs

    const [useReportFilters, setUseReportFilters] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
    customerId: [],
    customerObj: [],
  });


    // --- Date handlers & validations ---
    const handleStartDateChange = (e) => {
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
      // Clear end date whenever start date changes (as you requested earlier)
      setEndDate("");
      // Also clear previous generated report flag
      setReportGenerated(false);

      // Also clear filters selection visual state? keep filters as is
    };

    const handleEndDateChange = (e) => {
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
    };

    // --- Fetch report ---
    const fetchReportData = (pageNum = 1) => {
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
  fetchPaymentReport({
    startDate,
    endDate,
    page: pageNum,
    perPage,
    customerId: selectedCustomerId || undefined,
  })
);


  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    // ✅ ALWAYS RESET TO PAGE 1
    setPage(1);

    // ✅ APPLY FILTERS
    setAppliedFilters({
      customerId: selectedCustomerId,
      customerObj: selectedCustomerObj,
    });

    setReportGenerated(true);

    // ✅ FETCH PAGE 1
    fetchReportData(1);
  };
  useEffect(() => {
    setPage(1);
  }, [useReportFilters]);
  
    // Pagination handler
    const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > frontendTotalPages) return;
      setPage(newPage);
    };
     useEffect(() => {
      setPage(1);
    }, [appliedFilters]);

    // -----------------------
    // Customer search debounce (uses Redux slice fetchCustomerAsync & clearCustomers)
    // -----------------------
    useEffect(() => {
      const trimmedQuery = searchQuery.trim();

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }

      if (trimmedQuery.length < 3) {
        dispatch(clearCustomers());
        setLocalSearchLoading(false);
        return;
      }

      setLocalSearchLoading(true);
      searchDebounceRef.current = setTimeout(async () => {
        try {
          await dispatch(fetchCustomerAsync(trimmedQuery));
        } catch (err) {
          // swallow - slice should handle
        } finally {
          setLocalSearchLoading(false);
        }
      }, 450);

      return () => {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
          searchDebounceRef.current = null;
        }
      };
    }, [searchQuery, dispatch]);

    const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    // 🔴 IF USER CLEARS / BACKSPACES SEARCH
    if (val.trim() === "") {
      setSelectedCustomerId("");
      setSelectedCustomerObj(null);
      dispatch(clearCustomers()); // optional but good
    } else {
      dispatch(clearCustomers());
    }
  };


    const handleCustomerSelect = (e) => {
    const id = e.target.value;

    // ⛔ No dates → warn & CLEAR selection
    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date before applying Customer filter.", {
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

      setSelectedCustomerId("");
      setSelectedCustomerObj(null);
      setSearchQuery("");
      dispatch(clearCustomers());

      return;
    }

    // ✅ Dates exist → allow selection
    setSelectedCustomerId(id);
    const cust = customers.find((c) => c._id === id) || null;
    setSelectedCustomerObj(cust);
  };

  const filteredPaymentReports = useMemo(() => {
    let data = [...paymentReports];

    // ✅ CUSTOMER FILTER (multi-select)
if (appliedFilters.customerObj && appliedFilters.customerObj.length > 0) {
  const customerNames = appliedFilters.customerObj.map(c =>
    (c.companyName || c.company_name || c.company || "").toLowerCase()
  );

  data = data.filter(row =>
    row["Customer Name"] &&
    customerNames.some(name =>
      row["Customer Name"].toLowerCase().includes(name)
    )
  );
}

    return data;
  }, [paymentReports, appliedFilters]);

const perPage = 1000; // max rows per page
const frontendTotalPages = Math.ceil(filteredPaymentReports.length / perPage);

  const paginatedPaymentReports = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredPaymentReports.slice(start, end);
  }, [filteredPaymentReports, page]);

 useEffect(() => {
  return () => {
    dispatch(resetPaymentReport()); // cleanup on unmount
  };
}, []);


  const reportCustomerOptions = useMemo(() => {
    const map = new Map();

    paymentReports.forEach((row) => {
      const name = row["Customer Name"];
      if (name) {
        map.set(name, { value: name, label: name });
      }
    });

    return Array.from(map.values());
  }, [paymentReports]);

  useEffect(() => {
    setSelectedCustomerId([]);
    setSelectedCustomerObj([]);
    setSearchQuery("");
  }, [useReportFilters]);

const { paymentError } = useSelector((state) => state.report);

useEffect(() => {
  if (!paymentError) return;

  // 🌐 Network error
 if (
       paymentError  === "Failed to fetch business report" || "Rejected" ||
       paymentError.toLowerCase().includes("network") || paymentError.toLowerCase().includes("Token has expired")
     ) {
       toast.error(
       paymentError.toLowerCase().includes("Token has expired")
         ? "Session expired!! Please log in again."
         : "Rejected!! Network error. Please check your internet connection.",  {
                                                autoClose: 4000,
                                                toastClassName: "toast-warn-zfix",
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
  }
  // ❌ Auth / backend / validation error
  else {
toast.error(paymentError, {
  autoClose: 4000,
  toastClassName: "toast-warn-zfix",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  style: {
    background: "rgba(252, 61, 61, 0.88)",
    color: "white",
    fontSize: "14px",
    fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
    fontWeight: "bold",
  },
  icon: (
    <BiSolidMessageRoundedError
      style={{ fontSize: "20px", color: "white" }}
    />
  ),
});  }
}, [paymentError]);

// Total based on filtered rows (so it updates when filters change)
const totalAmount = useMemo(() => {
  return filteredPaymentReports.reduce((sum, row) => {
    const val = Number(
      String(row["Total Amount (INR)"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
}, [filteredPaymentReports]);

const totalPaid = useMemo(() => {
  return filteredPaymentReports.reduce((sum, row) => {
    const val = Number(
      String(row["Total Paid (INR)"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
}, [filteredPaymentReports]);

const totalRemaining = useMemo(() => {
  return filteredPaymentReports.reduce((sum, row) => {
    const val = Number(
      String(row["Remaining Amount (INR)"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
}, [filteredPaymentReports]);

const formattedTotalAmount = useMemo(() => {
  return totalAmount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}, [totalAmount]);

const formattedTotalPaid = useMemo(() => {
  return totalPaid.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}, [totalPaid]);

const formattedTotalRemaining = useMemo(() => {
  return totalRemaining.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}, [totalRemaining]);


return (
      <div className="PaymentReport-section">
        <h3>Payment Report</h3>
        <ToastContainer />

        <Form onSubmit={handleSubmit} className="filter-form-payment">
          {/* Date row */}
<Row className="g-4 mt-3">
  {/* Start Date */}
  <Col md={3}>
    <Form.Label className="required-label">Start Date:</Form.Label>
    <Form.Control
      type="date"
      value={startDate}
      onChange={handleStartDateChange}
      required
      max={today}
      className="dates"
    />
  </Col>

  {/* End Date */}
  <Col md={3} style={{ marginLeft: "-17px" }}>
    <Form.Label className="required-label">End Date:</Form.Label>
    <Form.Control
      type="date"
      value={endDate}
      onChange={handleEndDateChange}
      required
      max={today}
      min={startDate || ""}
      className="dates"
    />
  </Col>

  {/* Checkbox + Amount */}
  <Col md={2}>
    <Form.Check
      type="checkbox"
      label="Filter from generated report"
      checked={useReportFilters}
      onChange={(e) => setUseReportFilters(e.target.checked)}
      disabled={!reportGenerated}
      className="custom-checkbox-payment"
    />
    </Col>
  {/* Customer search */}
            {<Col md={3}>
              <Form.Group className="form-group">
    <Form.Label>
      Customer {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ DROPDOWN FROM GENERATED REPORT DATA
      <Select
  className="PaymentReport-select"
  classNamePrefix="PaymentReport"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
  options={reportCustomerOptions}
  value={selectedCustomerObj.map(c => ({ value: c.companyName, label: c.companyName }))}
  onChange={selected => {
    setSelectedCustomerObj(selected ? selected.map(s => ({ companyName: s.value })) : []);
    setSelectedCustomerId(selected ? selected.map(s => s.value) : []);
  }}
  isMulti
  isClearable
  placeholder="Select customer"
/>
    ) : (
      // 🔴 EXISTING SEARCH UI — UNCHANGED
      <>
        <input
          type="text"
          className="search-field-customer-name-payment form-control"
          placeholder="Search by Company Name"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="search-field1-customer-name-payment mt-1">
          {searchQuery.length >= 3 ? (
            localSearchLoading || customersLoading ? (
              <p className="CustomerNameLoadingPayment">Loading...</p>
            ) : customers.length > 0 ? (
              <select
                value={selectedCustomerId || ""}
                onChange={handleCustomerSelect}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName || c.company_name || c.company}
                  </option>
                ))}
              </select>
            ) : (
              <p className="NoCustomerNameFoundPayment">No customers found...</p>
            )
          ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
            <p className="TypeMoreCustDataPayment">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>
            </Col> }

             {/* Submit button */}
            <Col md={1}>
              <Form.Group className="form-group">
                <Form.Label className="invisible">&nbsp;</Form.Label>
                <button type="submit" className="report-button-payment" title="Generate Payment Report">
                  <LuFileCheck2 className="filecheck" />
                </button>
              </Form.Group>
            </Col>

</Row>


          <Row className="g-4 mt-3  payment-filter-row">

           <Col md={3}>
  {reportGenerated && (
    <div className="total-amount-text-payment">
      <span>Total Amount:</span>
      <strong className="wrap-amount">{formattedTotalAmount}</strong>
    </div>
  )}
</Col>

<Col md={3}>
  {reportGenerated && (
    <div className="total-amount-text-payment">
      <span>Total Paid:</span>
      <strong className="wrap-amount">{formattedTotalPaid}</strong>
    </div>
  )}
</Col>

<Col md={3}>
  {reportGenerated && (
    <div className="total-amount-text-payment">
      <span>Amount Due:</span>
      <strong className="wrap-amount">{formattedTotalRemaining}</strong>
    </div>
  )}
</Col>
          </Row>

        </Form>

        <br />

        {/* Loading & Error */}
      {paymentLoading && (
    <div className="loading-container-report-payment">
      <div className="loading-spinner-report-payment"></div>
      <p className="loading-message-report-payment">Loading payment report...</p>
    </div>
  )}

  {paymentError && paymentError !== "Rejected" && (
  <div className="error-container-report-payment">
    <p className="error-message-report-payment">{paymentError}</p>
  </div>
)}

{/* Report Table */}
      <div className="PaymentReport-table">
    {paginatedPaymentReports.length > 0 ? (
      <table>
        <thead>
  <tr>
    <th>Customer Name</th>
    <th>Invoice #</th>
    <th>Invoice Date</th>
    
    <th>Payments</th>

    <th>Total Amount (INR)</th>
    <th>Total Paid (INR)</th>
    <th>Remaining Amount (INR)</th>
    <th>Payment Status</th>
  </tr>
</thead>


        <tbody>
  {paginatedPaymentReports.map((row, idx) => (
    <tr key={idx}>
      {/* Customer Name */}
      <td>{row["Customer Name"] || "-"}</td>

      {/* Invoice # */}
      <td>{row["Invoice #"] || "-"}</td>

      {/* Invoice Date */}
      <td>{row["Invoice Date"] || "-"}</td>


      {/* Payments Array */}
      <td>
        {row["Payments"] && row["Payments"].length > 0 ? (
          <table className="inner-payment-table">
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Paid Amount</th>
                <th>Payment Status</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {row["Payments"].map((pay, pIdx) => (
                <tr key={pIdx}>
                  <td>{pay.payment_date || "-"}</td>
                  <td>₹ {pay.paid_amount || 0}</td>
                  <td><span
    className={`status-text ${
      pay.payment_status === "Completed" ? "status-green" : ""
    }`}
  >{pay.payment_status || "-"}</span></td>
                  <td>{pay.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span>-</span>
        )}
      </td>


      {/* Total Amount (INR) */}
      <td>₹ {row["Total Amount (INR)"] || 0}</td>

      {/* Total Paid (INR) */}
      <td>₹ {row["Total Paid (INR)"] || 0}</td>

      {/* Remaining Amount (INR) */}
      <td>₹ {row["Remaining Amount (INR)"] || 0}</td>

      {/* Payment Status */}
      <td><span
    className={`status-text  ${
      row["Payment Status"] === "Paid"
        ? "status-green"
        : row["Payment Status"] === "Unpaid"
        ? "status-red"
        : ""
    }`}
  >{row["Payment Status"] || "-"} </span></td>
    </tr>
  ))}
</tbody>

      </table>
    ) : (
      reportGenerated &&
      !paymentLoading && (
        <p className="no-payment-message">NO PAYMENT FOUND...</p>
      )
    )}
    
    {/* Pagination */}
    {filteredPaymentReports.length > perPage && frontendTotalPages > 1 && (
      <div className="pagination-controls-paymentreport">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <FaChevronLeft />
        </button>

        <span className="page-paymentreport">
          {page} of {frontendTotalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === frontendTotalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    )}

  </div>

      </div>
    );
  };

  export default PaymentReport;
