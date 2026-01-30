import React, { useState, useEffect, useCallback } from "react"; // ✅ Added useEffect, useCallback for debounced search
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoicesByCustomer,
  disableInvoice,
} from "../redux/slices/informationSlice";
import "./dashboard/Dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import { setPaymentStatus, upsertPayment } from '../redux/slices/customerPaymentSlice';
import { debounce } from "lodash"; // ✅ Added debounce for search
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify"; 
import { BiSolidMessageRoundedError } from "react-icons/bi";
import { IoIosWarning } from "react-icons/io";
import { BiSolidCommentCheck } from "react-icons/bi";

const InvoiceStatus = () => {
  const dispatch = useDispatch();  

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRows, setSelectedRows] = useState({});
  const [tableData, setTableData] = useState([]);
  const [popupRow, setPopupRow] = useState(null);
  const [disableOption, setDisableOption] = useState({}); 
  const { loading, invoices, status, error } = useSelector(
    (state) => state.information
  );
  const [hasFetched, setHasFetched] = useState(false);
  const [disabledInvoiceInfo, setDisabledInvoiceInfo] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false); 
 const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const getInvoiceId = (inv) =>
    inv?.invoice_id ?? inv?.id ?? inv?.invoice_number ?? inv?._id ?? inv?.code;

  const normalizeInvoice = (inv) => {
    const totalAmount = Array.isArray(inv?.items)
      ? inv.items.reduce((sum, item) => sum + (Number(item.sub_total) || 0), 0)
      : inv?.sub_total || inv?.amount || 0;

    return {
      ...inv,
      id: getInvoiceId(inv),
      customerName: inv?.customerName ?? inv?.customer_name ?? inv?.customer ?? "",
      amount: totalAmount,
      isEnabled:
        typeof inv?.isEnabled === "boolean"
          ? inv.isEnabled
          : typeof inv?.enabled === "boolean"
          ? inv.enabled
          : typeof inv?.is_enabled === "boolean"
          ? inv.is_enabled
          : true,
    };
  };

  // ------------------- 🔎 DEBOUNCED SEARCH LOGIC START ----------------------
  function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);

      try {
const safeTerm = escapeRegex(term);
const result = await dispatch(fetchInvoicesByCustomer(safeTerm)).unwrap();

        const invoices = Array.isArray(result)
          ? result
          : Array.isArray(result?.payments)
          ? result.payments
          : [];

        const names = Array.from(
          new Set(
            invoices
              .map((inv) => inv.customer_name || inv.customer || "")
              .filter((name) =>
                name.toLowerCase().includes(term.toLowerCase())
              )
          )
        );

        if (names.length === 0) {
          setSearchResults([]);
        } else {
          const suggestions = names.map((name) => ({
            _id: name,
            customer_name: name,
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
  if (searchTerm.length >= 2) {
    debouncedSearch(searchTerm);
  } else {
    // prevent debouncedSearch for short input
    debouncedSearch.cancel(); // stop any pending debounce
  }
}, [searchTerm, debouncedSearch]);


  const handleSearchChange = (e) => {
  const term = e.target.value;
  setSearchTerm(term);

  if (!term.trim() || term.length < 2) {
    // If empty or less than 2 letters, clear results and stop loading
    setSearchResults([]);
    setSearchLoading(false);
  } else {
    // Only trigger loading for 2 or more letters
    setSearchLoading(true);
  }
};


  // ------------------- 🔎 DEBOUNCED SEARCH LOGIC END ----------------------

  const handleSelectCustomer = async (e) => {
    const selectedId = e.target.value;
    const cust = searchResults.find((c) => c._id === selectedId);

    setSelectedCustomer(cust);
    setSelectedRows({});
    setTableData([]);
    setHasFetched(false);
    setDisabledInvoiceInfo(null);

    if (cust) {
      try {
        const safeName = escapeRegex(cust.customer_name);
const result = await dispatch(fetchInvoicesByCustomer(safeName)).unwrap();


        const raw = Array.isArray(result)
          ? result
          : Array.isArray(result?.payments)
          ? result.payments
          : [];

        const normalized = raw.map(normalizeInvoice);

        const filtered = normalized.filter((inv) =>
          (inv.customerName || "")
            .toLowerCase()
            .includes(cust.customer_name.toLowerCase())
        );

        setTableData(filtered);
      } catch (err) {
        console.error("Error fetching invoices for customer:", err);
        setTableData([]);
      } finally {
        setHasFetched(true);
      }
    }
  };

  const toggleCheckbox = (id) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleStatus = (invoice) => {
    if (invoice.isEnabled) {
      setPopupRow(getInvoiceId(invoice));
    } else {
      setTableData((prev) =>
        prev.map((inv) =>
          getInvoiceId(inv) === getInvoiceId(invoice)
            ? { ...inv, isEnabled: true }
            : inv
        )
      );
      dispatch(
        disableInvoice({
          invoice_id: getInvoiceId(invoice),
          isEnableInvoicePurchase: false,
        })
      );
    }
  };

  const confirmDisable = (invoice) => {
    const selectedOption = disableOption[getInvoiceId(invoice)];
    if (!selectedOption) {
      toast.warn("Please select an option before confirming!", {
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

    const invoiceId = getInvoiceId(invoice);
    const updated = tableData.filter((inv) => getInvoiceId(inv) !== invoiceId);

    if (updated.length === 0) {
      setDisabledInvoiceInfo({
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name || invoice.customerName,
      });
    } else {
      setDisabledInvoiceInfo(null);
    }

    dispatch(
      disableInvoice({
        invoice_id: invoiceId,
        isEnableInvoicePurchase: selectedOption === "withPO",
        isEnabled: false,
      })
    )
      .then(() => {
        dispatch(
          setPaymentStatus({
            invoice_number: invoice.invoice_number,
            payment_status: "Cancelled",
          })
        );

        dispatch(
          upsertPayment({
            invoice_number: invoice.invoice_number,
            customer_name: invoice.customer_name || invoice.customerName || '',
            total_amount: invoice.total_amount ?? invoice.amount ?? null,
            amount_due: invoice.amount_due ?? null,
            invoice_date: invoice.invoice_date ?? null,
            payment_status: "Cancelled",
            isEnableInvoicePurchase: false,
          })
        );

        toast.success(`Invoice ${invoice.invoice_number} disabled successfully.`, {
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
        setPopupRow(null);
      })
      .catch((err) => {
        console.error("Disable invoice failed", err);
        toast.error(`Failed to disable invoice ${invoice.invoice_number}. Try again`, {
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

    setTableData(updated);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 1;
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
  setSelectedCustomerId(""); // reset dropdown when new search results arrive
}, [searchResults]);

  return (
    <div className="invoice-status">
      <h3>Invoice Management</h3>
<ToastContainer />
      {/* Top Section */}
      <div>
        <input
          type="text"
          placeholder="Search by Customer Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-field-invoice-status"
        />
       <div className="search-field1-invoice-status">
  {searchLoading ? (
    <p className="InvoiceStatusLoading">Loading...</p>
  ) : searchTerm && searchTerm.length < 2 ? (
    <p className="InvoiceStatusWarning">Please type 2 or more letters...</p>
  ) : searchResults.length > 0 ? (
    <select
      onChange={(e) => {
        const id = e.target.value;
        setSelectedCustomerId(id);
        handleSelectCustomer(e);
      }}
      value={selectedCustomerId}
    >
      <option value="" disabled>
        Select a customer
      </option>
      {searchResults.map((cust) => (
        <option key={cust._id} value={cust._id}>
          {cust.customer_name}
        </option>
      ))}
    </select>
  ) : (
    searchTerm && <p className="NoInvoiceStatusFound">No customers found...</p>
  )}
</div>
      </div>

      {/* Disabled invoice info */}
      {disabledInvoiceInfo && (
        <div className="disabled-invoice-card-invoicests">
          <h4> 👍 Invoice Disabled</h4>
          <p>
            Invoice <span>#{disabledInvoiceInfo.invoiceNumber}</span> for customer{" "}
            <span>{disabledInvoiceInfo.customerName}</span> has been disabled.
          </p>
          <p>Choose a customer from the list above to continue managing invoices.</p>
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
          Please select a customer from the search bar to view invoices.
        </p>
      )}

      {/* Bottom Section: Table */}
      {selectedCustomer && tableData.length > 0 && (
        <>
        {currentPage > 1 && (
      <div className="pagination-home-invstatus">
        <button onClick={() => setCurrentPage(1)}>
          ⏮ Home
        </button>
      </div>
    )}
          <table className="invoice-status-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Invoice ID</th>
                <th>Customer Name</th>
                <th>Invoice Date</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Sub Total</th>
                <th>Total Amount</th>
                <th>Amount Due</th>
                <th>Status</th>
                <th>Disable</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((invoice) => {
                const rowId = getInvoiceId(invoice);
                const isChecked = !!selectedRows[rowId];
                const items = Array.isArray(invoice.items) ? invoice.items : [];

                return items.map((item, idx) => (
                  <tr key={`${rowId}-${idx}`} className={isChecked ? "editable" : ""}>
                    {idx === 0 && (
                      <>
                        <td rowSpan={items.length}>
                          <input
                            type="checkbox"
                            className="custom-checkbox-invoice-status"
                            checked={isChecked}
                            onChange={() => toggleCheckbox(rowId)}
                          />
                        </td>
                        <td rowSpan={items.length}>{invoice.invoice_number}</td>
                        <td rowSpan={items.length}>{invoice.customer_name}</td>
                        <td rowSpan={items.length}>{invoice.invoice_date}</td>
                      </>
                    )}
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit_price}</td>
                    <td>{item.sub_total}</td>

                    {idx === 0 && (
                      <>
                        <td rowSpan={items.length}>{invoice.total_amount}</td>
                        <td rowSpan={items.length}>{invoice.amount_due}</td>
                        <td rowSpan={items.length}>{invoice.payment_status}</td>
                        <td rowSpan={items.length}>
                          <button
                            className={`toggle-btn ${invoice.isEnabled ? "disable" : "enable"}`}
                            onClick={() => handleToggleStatus(invoice)}
                            disabled={!isChecked}
                          >
                            {invoice.isEnabled ? "Disable" : "Enable"}
                          </button>

                          {popupRow === rowId && (
                            <div className="disable-popup">
                              <div className="popup-icon">
                                <FaExclamationTriangle />
                              </div>
                              <p>
                                For invoice <strong>{invoice.invoice_number}</strong> do you want to disable:
                              </p>

                              <label>
                                <input
                                  type="radio"
                                  name={`disable-${rowId}`}
                                  value="onlyInvoice"
                                  onChange={() =>
                                    setDisableOption((prev) => ({
                                      ...prev,
                                      [rowId]: "onlyInvoice",
                                    }))
                                  }
                                  checked={disableOption[rowId] === "onlyInvoice"}
                                />
                                Invoice only
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name={`disable-${rowId}`}
                                  value="withPO"
                                  onChange={() =>
                                    setDisableOption((prev) => ({
                                      ...prev,
                                      [rowId]: "withPO",
                                    }))
                                  }
                                  checked={disableOption[rowId] === "withPO"}
                                />
                                Invoice with Purchase Order
                              </label>

                              <div className="popup-actions">
                                <button
                                  onClick={() => confirmDisable(invoice)}
                                  className="popup-confirm-btn"
                                >
                                  <FaCheck /> Confirm
                                </button>
                                <button
                                  onClick={() => setPopupRow(null)}
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
                ));
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-controls-invstatus">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <span className="page-invstatus">
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
          No Invoices Available for{" "}
          {selectedCustomer.customerName || selectedCustomer.customer_name}.
        </p>
      )}
    </div>
  );
};

export default InvoiceStatus;
