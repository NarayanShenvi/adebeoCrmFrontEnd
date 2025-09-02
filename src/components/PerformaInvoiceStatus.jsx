import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPOInvoicesByCustomer,
  updatePOInvoiceStatus,
} from "../redux/slices/proformaSlice";
import "./dashboard/Dashboard.css";

const PerformaInvoiceStatus = () => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.proformaInvoice);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRows, setSelectedRows] = useState({});
  const [tableData, setTableData] = useState([]);

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

  // ✅ Search customers (always filter, no "all list")
  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

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
            ) // ✅ match only typed prefix
        )
      );

      const suggestions = names.map((name) => ({
        _id: name,
        companyName: name,
        email: "",
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

        // ✅ filter again for safety
        const filtered = normalized.filter((inv) =>
          (inv.customerName || "")
            .toLowerCase()
            .startsWith(cust.companyName.toLowerCase())
        );

        setTableData(filtered);
      } catch (err) {
        console.error("Error fetching invoices for customer:", err);
        setTableData([]);
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
    const updatedStatus = !invoice.isEnabled;

    setTableData((prev) =>
      prev.map((inv) =>
        getInvoiceId(inv) === getInvoiceId(invoice)
          ? { ...inv, isEnabled: updatedStatus }
          : inv
      )
    );

    dispatch(
      updatePOInvoiceStatus({
        invoiceId: getInvoiceId(invoice),
        isEnabled: updatedStatus,
      })
    );
  };

  const handleSubmit = () => {
    const selected = tableData.filter((inv) => selectedRows[getInvoiceId(inv)]);
    if (selected.length === 0) {
      alert("⚠️ No rows selected!");
      return;
    }

    selected.forEach((inv) => {
      dispatch(
        updatePOInvoiceStatus({
          invoiceId: getInvoiceId(inv),
          isEnabled: inv.isEnabled,
        })
      );

      alert(`✅ Proforma ${inv.proforma_id} updated successfully.`);
    });

    // Reset ONLY checkboxes after submit
    setSelectedRows({});
  };

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="performa-invoice-status">
      <h2>Performa Invoice Management</h2>

      <input
        className="search-field-prod"
        type="text"
        placeholder="Search by Customer Name"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="search-field1-prod">
        {loading ? (
          <p className="ProductsLoading">Loading...</p>
        ) : searchResults.length > 0 ? (
          <select
            onChange={handleSelectCustomer}
            value={selectedCustomer?._id || ""}
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
          searchTerm && <p className="NoProductsFound">No customers found...</p>
        )}
      </div>

      {loading && <p>Loading invoices...</p>}
      {error && <p className="error">{error}</p>}

      {selectedCustomer && tableData.length > 0 && (
        <>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Invoice ID</th>
                <th>Customer Name</th>
                <th>Company Name</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Status</th>
                <th>Toggle</th>
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
                            {invoice.isEnabled ? "Enabled" : "Disabled"}
                          </td>
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
                    <td>{invoice.isEnabled ? "Enabled" : "Disabled"}</td>
                    <td>
                      <button
                        className={`toggle-btn ${
                          invoice.isEnabled ? "disable" : "enable"
                        }`}
                        onClick={() => handleToggleStatus(invoice)}
                        disabled={!isChecked}
                      >
                        {invoice.isEnabled ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 🔹 Pagination Controls */}
          <div className="pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {selectedCustomer && tableData.length > 0 && (
        <div className="submit-section">
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default PerformaInvoiceStatus;
