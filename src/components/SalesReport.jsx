  import React, { useState, useEffect, useRef, useMemo } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import axios from "axios";
  import { Form, Row, Col } from "react-bootstrap";
  import { LuFileCheck2 } from "react-icons/lu";
  import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

  import { fetchSalesReport, resetSalesReport } from "../redux/slices/reportSlice";
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
  const {
    salesReports = [],
    salesLoading,
    salesError,
    salesTotalPages = 1,
  } = useSelector((state) => state.report);

    const { users = [], loading: usersLoading } = useSelector((state) => state.users);
    const { customers = [], loading: customersLoading } = useSelector(
      (state) => state.customers || {}
    ); // adjust if customers slice key differs

    // Get current user & role if needed (keeps behavior similar to your ReportSection)
    const currentUser = useSelector((state) => state.user?.username);
    const isAdmin = useSelector((state) => state.user?.role === "admin");

    const [useReportFilters, setUseReportFilters] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
    customerId: "",
    customerObj: null,
    productId: "",
    productObj: null,
    user: "",
  });

  
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
    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date");
      return;
    }

    setReportGenerated(true);

    dispatch(
    fetchSalesReport({
      startDate,
      endDate,
      page: pageNum,
      perPage,
      customerId: selectedCustomerId || undefined,
      productId: selectedProductId || undefined,
      user: selectedUser || undefined,
    })
  );

  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date");
      return;
    }

    // ✅ ALWAYS RESET TO PAGE 1
    setPage(1);

    // ✅ APPLY FILTERS
    setAppliedFilters({
      customerId: selectedCustomerId,
      customerObj: selectedCustomerObj,
      productId: selectedProductId,
      productObj: selectedProductObj,
      user: selectedUser,
    });

    setReportGenerated(true);

    // ✅ FETCH PAGE 1
    fetchReportData(1);
  };
  useEffect(() => {
    setPage(1);
  }, [useReportFilters]);

    // When any filter changes (customer/product/user) — auto refetch only if date range is present
  
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
      toast.warn("Please select Start Date and End Date before applying customer filter.");

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


  //   // --- Load all customers initially ---
  // // --- Load all customers initially ---
  // useEffect(() => {
  //   // Fetch all customers once on mount
  //   const fetchAllCustomers = async () => {
  //     try {
  //       setLocalSearchLoading(true); // show spinner while loading
  //       await dispatch(fetchCustomerAsync("")); // empty string fetches all
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLocalSearchLoading(false);
  //     }
  //   };

  //   fetchAllCustomers();
  // }, [dispatch]);

  // // --- Prepare options ---
  // const customerOptions = customers.map(c => ({
  //   value: c._id,
  //   label: c.companyName || c.company_name || c.company
  // }));


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
    const prod = searchResults.find((p) => p._id === value) || null;

    // ⛔ No dates → warn & CLEAR selection
    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date before applying product filter.");

      setSelectedSearchValue("");
      setSelectedProductId("");
      setSelectedProductObj(null);
      setSearchTerm("");

      return;
    }

    // ✅ Dates exist → allow selection
    setSelectedSearchValue(value);
    setSelectedProductId(prod ? prod._id : "");
    setSelectedProductObj(prod);
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

    // Dynamic table headers logic:
    // const hideCustomerColumn = !!selectedCustomerId; // hide only when customer filter applied
    // const hideProductColumn = !!selectedProductId;   // hide only when product filter applied


  const filteredSalesReports = useMemo(() => {
    let data = [...salesReports];

    // ✅ CUSTOMER FILTER (APPLIED ONLY)
    if (appliedFilters.customerId && appliedFilters.customerObj) {
      const name = (
        appliedFilters.customerObj.companyName ||
        appliedFilters.customerObj.company_name ||
        appliedFilters.customerObj.company ||
        ""
      ).toLowerCase();

      data = data.filter(
        row =>
          row["Customer Name"] &&
          row["Customer Name"].toLowerCase().includes(name)
      );
    }

    // ✅ PRODUCT FILTER
    if (appliedFilters.productId && appliedFilters.productObj) {
      const productName = appliedFilters.productObj.productName?.toLowerCase();

      data = data.filter(
        row =>
          row["Description"] &&
          row["Description"].toLowerCase().includes(productName)
      );
    }

    // ✅ USER FILTER
    if (appliedFilters.user) {
      data = data.filter(
        row =>
          row["User"] &&
          row["User"].toLowerCase() === appliedFilters.user.toLowerCase()
      );
    }

    return data;
  }, [salesReports, appliedFilters]);


  const paginatedSalesReports = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredSalesReports.slice(start, end);
  }, [filteredSalesReports, page]);

 useEffect(() => {
  return () => {
    dispatch(resetSalesReport()); // cleanup on unmount
  };
}, []);


  const reportCustomerOptions = useMemo(() => {
    const map = new Map();

    salesReports.forEach((row) => {
      const name = row["Customer Name"];
      if (name) {
        map.set(name, { value: name, label: name });
      }
    });

    return Array.from(map.values());
  }, [salesReports]);

  const reportProductOptions = useMemo(() => {
    const map = new Map();

    salesReports.forEach((row) => {
      const name = row["Description"];
      if (name) {
        map.set(name, { value: name, label: name });
      }
    });

    return Array.from(map.values());
  }, [salesReports]);

  const reportUserOptions = useMemo(() => {
    const map = new Map();

    salesReports.forEach((row) => {
      const user = row["User"];
      if (user) {
        map.set(user, { value: user, label: user });
      }
    });

    return Array.from(map.values());
  }, [salesReports]);

  useEffect(() => {
    setSelectedCustomerId("");
    setSelectedCustomerObj(null);
    setSelectedProductId("");
    setSelectedProductObj(null);
    setSelectedUser("");
    setSearchQuery("");
    setSearchTerm("");
  }, [useReportFilters]);

  const totalAmountBilled = useMemo(() => {
  if (!salesReports || salesReports.length === 0) return 0;

  return salesReports.reduce((sum, row) => {
    const amount = Number(
      String(row["Amount Billed (INR)"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
}, [salesReports]);

const formattedTotalAmount = useMemo(() => {
  return totalAmountBilled.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}, [totalAmountBilled]);


    return (
      <div className="SalesReport-section">
        <h3>Sales Report</h3>
        <ToastContainer />

        <Form onSubmit={handleSubmit} className="filter-form-sales">
          {/* Date row */}
<Row className="g-4 mt-3 sales-filter-row">
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
  <Col md={3}>
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
  <Col md={3}>
    <Form.Check
      type="checkbox"
      label="Filter from generated report"
      checked={useReportFilters}
      onChange={(e) => setUseReportFilters(e.target.checked)}
      disabled={!reportGenerated}
      className="custom-checkbox-sales"
    />
    </Col>

<Col md={3}>
    {reportGenerated && (
      <div className="total-amount-text">
        <span>Total Amount:</span>
        <strong >{formattedTotalAmount}</strong>
      </div>
    )}
  </Col>
</Row>


          <Row className="g-4 mt-3">
            {/* Customer search */}
            {<Col md={4}>
              <Form.Group className="form-group">
    <Form.Label>
      Customer {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ DROPDOWN FROM GENERATED REPORT DATA
      <Select
        options={reportCustomerOptions}
        value={
          selectedCustomerId
            ? { value: selectedCustomerId, label: selectedCustomerId }
            : null
        }
        onChange={(selected) => {
          setSelectedCustomerId(selected?.value || "");
          setSelectedCustomerObj(
            selected ? { companyName: selected.value } : null
          );
        }}
        isClearable
        placeholder="Select customer from report"
      />
    ) : (
      // 🔴 EXISTING SEARCH UI — UNCHANGED
      <>
        <input
          type="text"
          className="search-field-customer-name form-control"
          placeholder="Search by Company name"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="search-field1-customer-name mt-1">
          {searchQuery.length >= 3 ? (
            localSearchLoading || customersLoading ? (
              <p className="CustomerNameLoading">Loading...</p>
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
              <p className="NoCustomerNameFound">No customers found...</p>
            )
          ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
            <p className="TypeMoreCustData">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>
            </Col> }
            {/* <Col md={4}>
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
  </Col> */}


          {/* Product search (single products only) */}
  <Col md={4}>
    <Form.Group className="form-group">
    <Form.Label>
      Product {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ PRODUCT DROPDOWN FROM REPORT DATA
      <Select
        options={reportProductOptions}
        value={
          selectedProductId
            ? { value: selectedProductId, label: selectedProductId }
            : null
        }
        onChange={(selected) => {
          setSelectedProductId(selected?.value || "");
          setSelectedProductObj(
            selected ? { productName: selected.value } : null
          );
        }}
        isClearable
        placeholder="Select product from report"
      />
    ) : (
      // 🔴 EXISTING PRODUCT SEARCH UI — UNCHANGED
      <>
        <input
          className="search-field-product-name form-control"
          type="text"
          placeholder="Search by Product Name"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);

            // 🔴 CLEAR PRODUCT FILTER WHEN INPUT CLEARED
            if (value.trim() === "") {
              setSelectedSearchValue("");
              setSelectedProductId("");
              setSelectedProductObj(null);
            }
          }}
        />

        <div className="search-field1-product-name mt-1">
          {searchTerm.length >= 3 ? (
            searchLoading ? (
              <p className="ProductNameLoading">Loading...</p>
            ) : searchResults.length > 0 ? (
              <select
                onChange={handleSelectProduct}
                value={selectedSearchValue}
              >
                <option value="">Select a product</option>
                {searchResults.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.productName} (Code: {product.productCode})
                  </option>
                ))}
              </select>
            ) : (
              <p className="NoProductNameFound">No products found...</p>
            )
          ) : searchTerm.length > 0 && searchTerm.length < 3 ? (
            <p className="TypeMoreProd">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>

  </Col>

            {/* User select */}
          <Col md={3}>
  <Form.Group className="form-group">
    <Form.Label>User</Form.Label>

    <Select
  className="SalesReport-select"
  classNamePrefix="SalesReport"
  options={useReportFilters ? reportUserOptions : userOptions}
  value={selectedUser ? { value: selectedUser, label: selectedUser } : null}
  onChange={(selected) => {
    if (!selected) {
      setSelectedUser("");
      return;
    }

    if (!useReportFilters && (!startDate || !endDate)) {
      toast.warn("Please select Start Date and End Date before applying user filter.");
      return;
    }

    setSelectedUser(selected.value);
  }}
  isClearable
  isSearchable
  placeholder={
    useReportFilters
      ? "Select user from report"
      : "Select or search user"
  }
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
      {salesLoading && (
    <div className="loading-container-report">
      <div className="loading-spinner-report"></div>
      <p className="loading-message-report">Loading sales report...</p>
    </div>
  )}

  {salesError && (
    <div className="error-container-report">
      <p className="error-message-report">{salesError}</p>
    </div>
  )}

        {/* Report Table */}
      <div className="report-table">
    {filteredSalesReports.length > 0 ? (
      <table className="table table-striped">
        <thead>
          <tr>
            {/* {!hideCustomerColumn && <th>Customer Name</th>}
            {!hideProductColumn && <th>Product Name</th>} */}
            <th>Customer Name</th>
            <th>PO Number</th>
            <th>Product Name</th>
            <th>Product  Qty</th>
            <th>Invoice Number</th>
            <th>Invoice Date</th>
            <th>Amount Billed (INR)</th>
          </tr>
        </thead>

        <tbody>
          {filteredSalesReports.map((row, idx) => (
            <tr key={idx}>
              {/* {!hideCustomerColumn && (
                <td>{row["Customer Name"] || "-"}</td>
              )}

              {!hideProductColumn && (
                <td>{row["Description"] || "-"}</td>
              )} */}
              <td>{row["Customer Name"] || "-"}</td>
              <td>{row["PO Number"] || "-"}</td>
              <td>{row["Description"] || "-"}</td>
              <td>{row["Qty"] || "-"}</td>

              <td>{row["Invoice #"] || "-"}</td>
              <td>{row["Invoice Date"] || "-"}</td>
              <td>{row["Amount Billed (INR)"] || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      reportGenerated &&
      !salesLoading && (
        <p className="no-activity-message">NO SALES FOUND...</p>
      )
    )}

    {/* Pagination */}
    {filteredSalesReports.length > 0 && salesTotalPages > 1 && (
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <FaChevronLeft />
        </button>

        <span className="page-quote">
          {page} of {salesTotalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === salesTotalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    )}
  </div>

      </div>
    );
  };

  export default SalesReport;
