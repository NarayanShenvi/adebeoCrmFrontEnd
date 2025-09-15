import React, { useState, useEffect, useCallback } from "react"; // ✅ Added useEffect, useCallback for debounced search
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPOInvoicesByCustomer,
  updatePOInvoiceStatus,
} from "../redux/slices/proformaSlice";
import "./dashboard/Dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import { debounce } from "lodash"; // ✅ Added debounce for search
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify"; 
import { BiSolidMessageRoundedError } from "react-icons/bi";
import { IoIosWarning } from "react-icons/io";
import { BiSolidCommentCheck } from "react-icons/bi";

const PerformaInvoiceStatus = () => { 
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.proformaInvoice);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRows, setSelectedRows] = useState({});
  const [tableData, setTableData] = useState([]);
  const [popupRow, setPopupRow] = useState(null);
  const [disabledInvoiceInfo, setDisabledInvoiceInfo] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false); // ✅ Added for debounced search
const [selectedCustomerId, setSelectedCustomerId] = useState("");
const [hasFetched, setHasFetched] = useState(false);


  // ✅ Extract invoice ID safely
  const getInvoiceId = (inv) =>
    inv?.proforma_id ??
    inv?.id ??
    inv?.invoiceId ??
    inv?.proformaId ??
    inv?.proforma_no ??
    inv?.invoiceNo ??
    inv?.invoice_number ??
    inv?._id ??
    inv?.code;

  // ✅ Normalize invoice data
  const normalizeInvoice = (inv) => {
    const totalAmount = Array.isArray(inv?.items)
      ? inv.items.reduce((sum, item) => sum + (Number(item.sub_total) || 0), 0)
      : inv?.sub_total || inv?.amount || 0;

    return {
      ...inv,
      id: getInvoiceId(inv),
      customerName:
        inv?.customerName ?? inv?.customer_name ?? inv?.customer ?? "",
      amount: totalAmount,
      isEnabled:
        typeof inv?.isEnabled === "boolean"
          ? inv.isEnabled
          : typeof inv?.enabled === "boolean"
          ? inv.enabled
          : !!inv?.is_enabled,
    };
  };

  // ------------------- 🔎 DEBOUNCED SEARCH LOGIC START ----------------------
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);

      try {
        const result = await dispatch(fetchPOInvoicesByCustomer(term)).unwrap();

        const invoices = Array.isArray(result)
          ? result
          : Array.isArray(result?.invoices)
          ? result.invoices
          : [];

        const names = Array.from(
          new Set(
            invoices
              .map(
                (inv) =>
                  inv.customerName || inv.customer_name || inv.customer || ""
              )
              .filter((name) =>
                name.toLowerCase().startsWith(term.toLowerCase())
              )
          )
        );

        if (names.length === 0) {
          setSearchResults([]);
        } else {
          const suggestions = names.map((name) => ({
            _id: name,
            companyName: name,
            email: "",
          }));
          setSearchResults(suggestions);
        }
      } catch (err) {
        console.error("Error searching customers:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // ✅ Set loading immediately on typing
    if (term.trim()) {
      setSearchLoading(true);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
    }
  };
  // ------------------- 🔎 DEBOUNCED SEARCH LOGIC END ----------------------

  const handleSelectCustomer = async (e) => {
    const selectedId = e.target.value;
    const cust = searchResults.find((c) => c._id === selectedId);
    setSelectedCustomer(cust);
    setSelectedRows({});
    setTableData([]);
    // Clear disabled message when switching customer
    setDisabledInvoiceInfo(null);
      setHasFetched(false);  // reset before fetching


    if (cust) {
      try {
        const result = await dispatch(
          fetchPOInvoicesByCustomer(cust.companyName)
        ).unwrap();

        const raw = Array.isArray(result)
          ? result
          : Array.isArray(result?.invoices)
          ? result.invoices
          : [];

        const normalized = raw.map(normalizeInvoice);

        const filtered = normalized.filter((inv) =>
          (inv.customerName || "")
            .toLowerCase()
            .startsWith(cust.companyName.toLowerCase())
        );

        setTableData(filtered);
      } catch (err) {
        console.error("Error fetching invoices for customer:", err);
        setTableData([]);
      } finally {
      setHasFetched(true); // <-- MUST be here
    }
    }
  };

  const toggleCheckbox = (id) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 🔹 Show popup instead of immediate toggle
  const handleToggleClick = (invoice) => {
    setPopupRow(getInvoiceId(invoice));
  };

  // 🔹 Confirm disable
const confirmDisable = (invoice) => {
  const updatedStatus = false;
  const invoiceId = getInvoiceId(invoice);

  // 1. Remove the invoice row
  const updated = tableData.filter((inv) => getInvoiceId(inv) !== invoiceId);
  setTableData(updated);

  // 2. Only show card if NO invoices remain
  if (updated.length === 0) {
    setDisabledInvoiceInfo({
      invoiceNumber: invoiceId,
      customerName: invoice.customerName || invoice.customer_name,
    });
  } else {
    setDisabledInvoiceInfo(null);
  }

  // 3. Dispatch update with success + error handling
  dispatch(
    updatePOInvoiceStatus({
      invoiceId: invoiceId,
      isEnabled: updatedStatus,
    })
  )
    .unwrap() // ✅ this converts rejected promises into catch-able errors
    .then(() => {
      toast.success(`Proforma invoice ${invoiceId} disabled successfully.`, {
                                                          position: "top-right",
                                                          toastClassName: "toast-warn-zfix",
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
    })
    .catch((err) => {
      console.error("Disable failed", err);
      toast.error(`Failed to disable proforma invoice ${invoiceId}. Try again`, {
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
    });

  setPopupRow(null);
};

  const cancelDisable = () => {
    setPopupRow(null); // closes the popup
  };

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

useEffect(() => {
  setSelectedCustomerId(""); // reset dropdown whenever new search results arrive
}, [searchResults]);

  
  return (
    <div className="performa-invoice-status">
      <h3>Proforma Invoice Management</h3>
                  <ToastContainer />
      
      <div>
        <input
          className="search-field-poinvoice-status"
          type="text"
          placeholder="Search by Customer Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <div className="search-field1-poinvoicestatus">
          {searchLoading ? ( // ✅ Updated to use searchLoading
            <p className="PoinvoicestatusLoading">Loading...</p>
          ) : searchResults && searchResults.length > 0 ? (
            <select
  onChange={(e) => {
    const id = e.target.value;
    setSelectedCustomerId(id); // reset local value so React registers change
    handleSelectCustomer(e);    // call your existing handler
  }}
  value={selectedCustomerId}
>
  <option value="" disabled>
    Select a customer
  </option>
  {searchResults.map((cust) => (
    <option key={cust._id} value={cust._id}>
      {cust.companyName} ({cust.email})
    </option>
  ))}
</select>

          ) : (
            !searchLoading && searchTerm && ( // ✅ Only show "No customers found" after search completes
              <p className="NoPoinvoicestatusFound">No customers found...</p>
            )
          )}
        </div>
      </div>
      {disabledInvoiceInfo && (
  <div className="disabled-invoice-card">
    <h4> 👍Proforma Invoice Disabled</h4>
    <p>
      Proforma <span>#{disabledInvoiceInfo.invoiceNumber}</span> for customer <span>{disabledInvoiceInfo.customerName}</span> has been disabled.
   <p></p> Choose a customer from the list above to continue managing porforma invoices.</p>
  </div>
)}
{!selectedCustomer && (
  <p
    style={{
            fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: "19px",
            color: "#026875ff",
            textAlign: "center",
            marginTop: "10%",
          }}
  >
    Please select a customer from the search bar to view proforma invoices.
  </p>
)}

{selectedCustomer && tableData.length > 0 && (
        <>
          <table className="poinvoice-status-invoice-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>POInvoice ID</th>
                <th>Customer Name</th>
                <th>Company Name</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Disable</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((invoice) => {
                const rowId = getInvoiceId(invoice);
                const isChecked = !!selectedRows[rowId];
                const items = Array.isArray(invoice.items) ? invoice.items : [];
                const firstItem = items[0] || {};

                return items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr
                      key={`${rowId}-${idx}`}
                      className={isChecked ? "editable" : ""}
                    >
                      {idx === 0 && (
                        <>
                          <td rowSpan={items.length}>
                            <input
                              type="checkbox"
                              className="custom-checkbox-poinvoicestatus"
                              checked={isChecked}
                              onChange={() => toggleCheckbox(rowId)}
                            />
                          </td>

                          <td rowSpan={items.length}>{rowId}</td>
                          <td rowSpan={items.length}>
                            {invoice.customerName || invoice.customer_name}
                          </td>
                          <td rowSpan={items.length}>
                            {firstItem.company_name || ""}
                          </td>
                        </>
                      )}

                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit_price}</td>
                      <td>{item.sub_total}</td>

                      {idx === 0 && (
                        <>
                          <td rowSpan={items.length}>
                            <button
                              className="toggle-btn disable"
                              onClick={() => handleToggleClick(invoice)}
                              disabled={!isChecked}
                            >
                              Disable
                            </button>

                            {popupRow === rowId && (
                              <div className="disable-popup">
                                <div className="popup-icon">
                                  <FaExclamationTriangle />
                                </div>
                                <p>
                                  Are you sure you want to disable porforma invoice {" "}
                                  <strong>{rowId}</strong>?
                                </p>
                                <div className="popup-actions">
                                  <button
                                    onClick={() => confirmDisable(invoice)}
                                    className="popup-confirm-btn"
                                  >
                                    <FaCheck /> Confirm
                                  </button>
                                  <button
                                    onClick={cancelDisable}
                                    className="popup-cancel-btn"
                                  >
                                    <FaTimes /> Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr key={rowId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckbox(rowId)}
                      />
                    </td>
                    <td>{rowId}</td>
                    <td>{invoice.customerName || invoice.customer_name}</td>
                    <td>{invoice.company_name || ""}</td>
                    <td colSpan={4}>No items</td>
                    <td>
                      <button
                        className="toggle-btn disable"
                        onClick={() => handleToggleClick(invoice)}
                        disabled={!isChecked}
                      >
                        Disable
                      </button>
                      {popupRow === rowId && (
                        <div className="disable-popup">
                          <div className="popup-icon">
                            <FaExclamationTriangle />
                          </div>
                          <p>
                            Are you sure you want to disable{" "}
                            <strong>{rowId}</strong>?
                          </p>
                          <div className="popup-actions">
                            <button
                              onClick={() => confirmDisable(invoice)}
                              className="popup-confirm-btn"
                            >
                              <FaCheck /> Confirm
                            </button>
                            <button
                              onClick={cancelDisable}
                              className="popup-cancel-btn"
                            >
                              <FaTimes /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 🔹 Pagination Controls */}
          <div className="pagination-controls-poinvstatus">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <span className="page-poinvstatus">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </>
      )}
{selectedCustomer && hasFetched && tableData.length === 0 && (
        <p
          style={{
            fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: "15px",
            color: "#db6c03",
            textAlign: "center",
            marginTop: "10%",
          }}
        >
          No Proforma Invoices Available{" "}
          {selectedCustomer.companyName}.
        </p>
      )}
    </div>
  );
};

export default PerformaInvoiceStatus;
