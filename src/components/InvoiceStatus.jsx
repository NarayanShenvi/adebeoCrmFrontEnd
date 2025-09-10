import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoicesByCustomer,
  disableInvoice,
} from "../redux/slices/informationSlice";
import "./dashboard/Dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
// top of file
import { setPaymentStatus, upsertPayment } from '../redux/slices/customerPaymentSlice';

const InvoiceStatus = () => {
  const dispatch = useDispatch();  

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRows, setSelectedRows] = useState({});
  const [tableData, setTableData] = useState([]);
  const [popupRow, setPopupRow] = useState(null);
  const [disableOption, setDisableOption] = useState({}); // store radio selection per row
  const { loading, invoices, status, error } = useSelector(
    (state) => state.information
  );
  const [hasFetched, setHasFetched] = useState(false);
  const [disabledInvoiceInfo, setDisabledInvoiceInfo] = useState(null);

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
          : true, // ✅ default to true if nothing is provided
    };
  };

  // 🔎 Search API
  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await dispatch(fetchInvoicesByCustomer(term)).unwrap();

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
              name.toLowerCase().startsWith(term.toLowerCase())
            )
        )
      );

      const suggestions = names.map((name) => ({
        _id: name,
        customer_name: name,
      }));

      setSearchResults(suggestions);
    } catch (err) {
      console.error("Error searching customers:", err);
      setSearchResults([]);
    }
  };

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
      const result = await dispatch(
        fetchInvoicesByCustomer(cust.customer_name)
      ).unwrap();

      const raw = Array.isArray(result)
        ? result
        : Array.isArray(result?.payments)
        ? result.payments
        : [];

      const normalized = raw.map(normalizeInvoice);

      const filtered = normalized.filter((inv) =>
        (inv.customerName || "")
          .toLowerCase()
          .startsWith(cust.customer_name.toLowerCase())
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
    alert("⚠️ Please select an option before confirming!");
    return;
  }

  const invoiceId = getInvoiceId(invoice);

  // Remove from InvoiceStatus table only
const updated = tableData.filter((inv) => getInvoiceId(inv) !== invoiceId);

// 🔹 If no rows left, show card
if (updated.length === 0) {
  setDisabledInvoiceInfo({
    invoiceNumber: invoice.invoice_number,
    customerName: invoice.customer_name || invoice.customerName,
  });
} else {
  setDisabledInvoiceInfo(null);  // clear card when there are still invoices
}

  // 🔹 Update backend + CustomerPayment slice
  dispatch(
    disableInvoice({
      invoice_id: invoiceId,
      isEnableInvoicePurchase: selectedOption === "withPO",
      isEnabled: false,
    })
  )
      dispatch(
    disableInvoice({
      invoice_id: invoiceId,
      isEnableInvoicePurchase: selectedOption === "withPO",
      isEnabled: false,
    })
  )
    .then(() => {
      // mark it Cancelled in CustomerPayment (so it stays in that table)
      dispatch(
        setPaymentStatus({
          invoice_number: invoice.invoice_number,
          payment_status: "Cancelled",
        })
      );

      // ensure the payments list contains a minimal record for this invoice (so it won't disappear)
      dispatch(
        upsertPayment({
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name || invoice.customerName || '',
          total_amount: invoice.total_amount ?? invoice.amount ?? null,
          amount_due: invoice.amount_due ?? null,
          invoice_date: invoice.invoice_date ?? null,
          payment_status: "Cancelled",
          isEnableInvoicePurchase: false,
          // add other fields you want visible by default (pdf_link, base_url) or keep null
        })
      );

      alert(`✅ Invoice ${invoice.invoice_number} disabled successfully.`);
      setPopupRow(null);
    })
    .catch((err) => {
      console.error("Disable invoice failed", err);
      alert("❌ Failed to disable invoice. Try again.");
    });
  setTableData(updated);
};

  // 📄 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

   return (
    <div className="invoice-status">
      <h3>Invoice Management</h3>

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
          {loading ? (
            <p className="InvoiceStatusLoading">Loading...</p>
          ) : searchResults.length > 0 ? (
            <select
              onChange={handleSelectCustomer}
              value={selectedCustomer?._id || ""}
            >
              <option value="" disabled>
                Select a customer
              </option>
              {searchResults
  .filter(cust => cust.isEnabled !== false) // hide disabled customers
  .map((cust) => (
    <option key={cust._id} value={cust._id}>
      {cust.customer_name}
    </option>
))}

            </select>
          ) : (
            searchTerm && (
              <p className="NoInvoiceStatusFound">No customers found...</p>
            )
          )}
        </div>
      </div>
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
            fontSize: "15px",
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
                <th>Toggle</th>
              </tr>
            </thead>
            <tbody>
  {currentRows.map((invoice) => {
    const rowId = getInvoiceId(invoice);
    const isChecked = !!selectedRows[rowId];
    const items = Array.isArray(invoice.items) ? invoice.items : [];

    return items.map((item, idx) => (
      <tr
        key={`${rowId}-${idx}`}
        className={isChecked ? "editable" : ""}
      >
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
            <td rowSpan={items.length}>
              <button
                className={`toggle-btn ${
                  invoice.isEnabled ? "disable" : "enable"
                }`}
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
                    For <strong>{invoice.invoice_number}</strong> do you want to
                    disable:
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
