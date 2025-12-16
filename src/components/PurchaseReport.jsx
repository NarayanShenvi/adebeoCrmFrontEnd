import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Form, Row, Col } from "react-bootstrap";
import { LuFileCheck2 } from "react-icons/lu";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchActivityReport } from "../redux/slices/reportSlice";
import { fetchUsers } from "../redux/slices/userSlice";
import { fetchCustomerAsync, clearCustomers } from "../redux/slices/customerSlice"; // adjust path/names if different
import { setProductToEdit, updateProductAsync, fetchProductsAsync, addProductAsync } from '../redux/slices/productSlice';
import Select from "react-select";

const SalesReport = () => {
  const dispatch = useDispatch();

  // Dates
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filters
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(null); // full object if you need
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductObj, setSelectedProductObj] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  // Search UI state - Customers
  const [searchQuery, setSearchQuery] = useState("");
  const [localSearchLoading, setLocalSearchLoading] = useState(false);
  const searchDebounceRef = useRef(null);

  // Products search state (single products only)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchValue, setSelectedSearchValue] = useState("");

  // Pagination & report
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [reportGenerated, setReportGenerated] = useState(false);

  // Redux slices
  const { activities = [], loading, totalPages = 1, error } = useSelector(
    (state) => state.report
  );
  const { users = [], loading: usersLoading } = useSelector((state) => state.users);
  const { customers = [], loading: customersLoading } = useSelector(
    (state) => state.customers || {}
  ); // adjust if customers slice key differs

  // Get current user & role if needed (keeps behavior similar to your ReportSection)
  const currentUser = useSelector((state) => state.user?.username);
  const isAdmin = useSelector((state) => state.user?.role === "admin");

  // Default user selection if not admin
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedUser && !isAdmin && currentUser) {
      setSelectedUser(currentUser);
    }
  }, [selectedUser, isAdmin, currentUser]);

  // --- Date handlers & validations ---
  const handleStartDateChange = (e) => {
    const selected = e.target.value;
    if (selected > today) {
      toast.warn("You cannot select a future date!");
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
      toast.warn("Please select Start Date first!");
      return;
    }
    const selected = e.target.value;
    if (selected > today) {
      toast.warn("You cannot select a future date!");
      return;
    }
    if (selected < startDate) {
      toast.warn("End Date cannot be before Start Date!");
      return;
    }
    setEndDate(selected);
    setReportGenerated(false);
  };

  // --- Fetch report ---
  const fetchReportData = (pageNum = 1) => {
    if (!startDate) {
      toast.warn("Please select Start Date before generating report.");
      return;
    }
    if (!endDate) {
      toast.warn("Please select End Date before generating report.");
      return;
    }

    setReportGenerated(true);
    dispatch(
      fetchActivityReport({
        startDate,
        endDate,
        customerId: selectedCustomerId || undefined,
        productId: selectedProductId || undefined,
        user: selectedUser || undefined,
        page: pageNum,
        perPage
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReportData(1);
  };

  // When any filter changes (customer/product/user) — auto refetch only if date range is present
  useEffect(() => {
    if (startDate && endDate && reportGenerated) {
      // when filters change after the initial generate, refresh results automatically
      setPage(1);
      fetchReportData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId, selectedProductId, selectedUser]);

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setPage(newPage);
    fetchReportData(newPage);
  };

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
    // Clear customers immediately so UI resets while typing
    dispatch(clearCustomers());
  };

  const handleCustomerSelect = (e) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    const cust = customers.find((c) => c._id === id) || null;
    setSelectedCustomerObj(cust);
    // If dates not selected, warn
    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date before applying customer filter.");
      // keep selection visually but do not fetch (auto fetch effect checks dates)
    }
  };

  // --- Load all customers initially ---
// --- Load all customers initially ---
useEffect(() => {
  // Fetch all customers once on mount
  const fetchAllCustomers = async () => {
    try {
      setLocalSearchLoading(true); // show spinner while loading
      await dispatch(fetchCustomerAsync("")); // empty string fetches all
    } catch (err) {
      console.error(err);
    } finally {
      setLocalSearchLoading(false);
    }
  };

  fetchAllCustomers();
}, [dispatch]);

// --- Prepare options ---
const customerOptions = customers.map(c => ({
  value: c._id,
  label: c.companyName || c.company_name || c.company
}));


  // -----------------------
// Product search (single products only) — USING REDUX ONLY
// -----------------------

const { products: allProducts = [], loading: productsLoading } = useSelector(
  (state) => state.products
);

useEffect(() => {
  dispatch(fetchProductsAsync()); // load once
}, [dispatch]);

useEffect(() => {
  if (searchTerm.length < 3) {
    setSearchResults([]);
    return;
  }

  // Filter single products only (no comboCode)
  const filtered = allProducts
    .filter((p) => !p.comboCode)
    .filter(
      (p) =>
        p.productName &&
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  setSearchResults(filtered);
}, [searchTerm, allProducts]);

const handleSelectProduct = (e) => {
  const value = e.target.value;
  setSelectedSearchValue(value);

  const prod = searchResults.find((p) => p._id === value) || null;
  setSelectedProductId(prod ? prod._id : "");
  setSelectedProductObj(prod);

  if (!startDate || !endDate) {
    toast.warn("Please select Start Date and End Date before applying product filter.");
  }
};

useEffect(() => {
  if (searchTerm.length < 3) {
    setSearchResults([]);
    setSearchLoading(false);
    return;
  }

  setSearchLoading(true);

  const debounceProd = setTimeout(() => {
    const filtered = allProducts
      .filter((p) => !p.comboCode)
      .filter(
        (p) =>
          p.productName &&
          p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    setSearchResults(filtered);
    setSearchLoading(false);
  }, 450); // same debounce delay as customer search

  return () => clearTimeout(debounceProd);
}, [searchTerm, allProducts]);


  // -----------------------
  // Derived username list for any UI needs
  // -----------------------

  const usernameList = useMemo(() => users.map((u) => u.username), [users]);
  
  const userOptions = users.map(u => ({ value: u.username, label: u.username }));

  // Client-side company name filter if needed later — kept for parity with ReportSection
  const [companyName, setCompanyName] = useState("");
  const filteredActivities = activities.filter((act) => {
    if (!companyName) return true;
    return act.company_name?.toLowerCase().includes(companyName.toLowerCase());
  });

  // Dynamic table headers logic:
  const hideCustomerColumn = !!selectedCustomerId; // if customer filter applied, hide customer column per your requirement
  const hideProductColumn = !!selectedProductId; // if product filter applied, hide product column
  const showUserColumn = true; // you told: if user filter applied include customer who purchased etc. We'll show user always unless you want otherwise

  return (
    <div className="report-section">
      <h3>Sales Report</h3>
      <ToastContainer />

      <Form onSubmit={handleSubmit} className="filter-form">
        {/* Date row */}
        <Row className="g-3 align-items-center">
          <Col xs="auto">
            <Form.Label className="required-label">Start Date:</Form.Label>
          </Col>
          <Col xs={3}>
            <Form.Control
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              required
              max={today}
              className="dates"
            />
          </Col>

          <Col xs="auto" className="datess">
            <Form.Label className="required-label">End Date:</Form.Label>
          </Col>
          <Col xs={3}>
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
        </Row>

        <Row className="g-4 mt-3">
          {/* Customer search */}
          {/* <Col md={4}>
            <Form.Group className="form-group">
              <Form.Label>Customer (search)</Form.Label>
              <input
                type="text"
                className="search-field-customer-status form-control"
                placeholder="Search by Company name"
                value={searchQuery}
                onChange={handleSearchChange}
              />

              <div className="search-field1-customer-status mt-1">
                {searchQuery.length >= 3 ? (
                  localSearchLoading || customersLoading ? (
                    <p className="CustomerStatusLoading">Loading...</p>
                  ) : customers.length > 0 ? (
                    <select
                      value={selectedCustomerId || ""}
                      onChange={handleCustomerSelect}
                      className="form-select"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.companyName || c.company_name || c.company}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="NoCustomerStatusFound">No customers found...</p>
                  )
                ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
                  <p className="TypeMoreCustData">Type at least 3 characters to search</p>
                ) : null}
              </div>
            </Form.Group>
          </Col> */}
          <Col md={4}>
  <Form.Group className="form-group">
    <Form.Label>Customer</Form.Label>
  <Select
  options={customerOptions}
  value={
    selectedCustomerId && selectedCustomerObj
      ? { value: selectedCustomerId, label: selectedCustomerObj.companyName || selectedCustomerObj.company_name || selectedCustomerObj.company }
      : null
  }
  onInputChange={(inputValue) => {
    setSearchQuery(inputValue);

    // Only search after 3+ characters
    if (inputValue.trim().length >= 3) {
      setLocalSearchLoading(true);
      dispatch(fetchCustomerAsync(inputValue.trim()))
        .finally(() => setLocalSearchLoading(false));
    } else {
      // If less than 3 chars, show all customers (already fetched)
      setLocalSearchLoading(false);
    }
  }}
  onChange={(selected) => {
    setSelectedCustomerId(selected?.value || "");
    const cust = customers.find(c => c._id === selected?.value) || null;
    setSelectedCustomerObj(cust);

    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date before applying customer filter.");
    }
  }}
  isClearable
  isSearchable
  placeholder="Select or search customer"
  isLoading={localSearchLoading} // only show spinner while searching
  noOptionsMessage={() =>
    searchQuery.length >= 3 ? "No customers found" : "Start typing to search"
  }
/>

  </Form.Group>
</Col>


         {/* Product search (single products only) */}
<Col md={4}>
  <Form.Group className="form-group">
    <Form.Label>Product (search)</Form.Label>
    <input
      className="search-field-prod form-control"
      type="text"
      placeholder="Search by Product Name"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setSelectedSearchValue("");
        setSelectedProductId("");
        setSelectedProductObj(null);
      }}
    />

    <div className="search-field1-prod mt-1">
      {searchTerm.length >= 3 ? (
        searchLoading ? (
          <p className="ProductsLoading">Loading...</p>
        ) : searchResults.length > 0 ? (
          <select
            onChange={handleSelectProduct}
            value={selectedSearchValue}
            className="form-select"
          >
            <option value="">Select a product</option>
            {searchResults.map((product) => (
              <option key={product._id} value={product._id}>
                {product.productName} (Code: {product.productCode})
              </option>
            ))}
          </select>
        ) : (
          <p className="NoProductsFound">No products found...</p>
        )
      ) : searchTerm.length > 0 && searchTerm.length < 3 ? (
        <p className="TypeMoreProd">Type at least 3 characters to search</p>
      ) : null}
    </div>
  </Form.Group>
</Col>

          {/* User select */}
         <Col md={3}>
<Form.Group className="form-group">
    <Form.Label>User</Form.Label>
    <Select
      options={userOptions}
      value={selectedUser ? { value: selectedUser, label: selectedUser } : null}
      onChange={(selected) => {
        if (!startDate || !endDate) {
          toast.warn("Please select Start Date and End Date before applying user filter.");
          setSelectedUser(selected?.value || "");
          return;
        }
        setSelectedUser(selected?.value || "");
      }}
      isClearable
      isSearchable
      placeholder="Select or search user"
    />
  </Form.Group>
</Col>

          {/* Submit button */}
          <Col md={1}>
            <Form.Group className="form-group">
              <Form.Label className="invisible">&nbsp;</Form.Label>
              <button type="submit" className="report-button" title="Generate Report">
                <LuFileCheck2 className="filecheck" />
              </button>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <br />

      {/* Loading & Error */}
      {loading && (
        <div className="loading-container-report">
          <div className="loading-spinner-report"></div>
          <p className="loading-message-report">Loading report...</p>
        </div>
      )}
      {error && (
        <div className="error-container-report">
          <i className="bi bi-exclamation-triangle-fill error-icon-report"></i>
          <p className="error-message-report">Error: {error}</p>
        </div>
      )}

      {/* Report Table */}
      <div className="report-table">
        {filteredActivities.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                {!hideCustomerColumn && <th>Customer</th>}
                {!hideProductColumn && <th>Product</th>}
                {showUserColumn && <th>Salesperson</th>}
                <th>Quotation</th>
                <th>PO</th>
                <th>Invoice</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((row, idx) => (
                <tr key={idx}>
                  {!hideCustomerColumn && <td>{row.company_name || row.customerName}</td>}
                  {!hideProductColumn && <td>{row.productName}</td>}
                  {showUserColumn && <td>{row.insertBy || row.salespersonName}</td>}
                  <td>{row.quotation || row.quotation_no || "-"}</td>
                  <td>{row.purchaseOrder || row.po_no || "-"}</td>
                  <td>{row.invoice || row.invoice_no || "-"}</td>
                  <td>
                    {String(row.details || row.description || "")
                      .split(",")
                      .map((d, i) => (
                        <span key={i}>
                          {d}
                          <br />
                        </span>
                      ))}
                  </td>
                  <td>
                    {row.insertDate ? new Date(row.insertDate).toLocaleString() : row.date || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          reportGenerated &&
          !loading && <p className="no-activity-message">NO ACTIVITIES FOUND...</p>
        )}

        {/* Pagination */}
        {filteredActivities.length > 0 && totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              <FaChevronLeft />
            </button>
            <span className="page-quote">
              {page} of {totalPages}
            </span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
