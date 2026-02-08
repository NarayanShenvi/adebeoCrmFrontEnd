import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProformas, fetchPurchaseOrders, createPurchaseOrder, setSearchTerm } from '../redux/slices/purchaseOrderSlice';
import API from '../config/config';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiDocumentArrowDown } from "react-icons/hi2";
import { FaSpinner, FaFilePdf } from 'react-icons/fa';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify"; 
import Select from "react-select";

const CreatePurchaseOrder = () => {
  const dispatch = useDispatch();

  
  const { proformas = [], recentOrders = [], status, totalPages = 0, totalOrders = 0, isProformasFetched, orderStatus } = useSelector((state) => state.purchaseOrder || {});

  const [selectedProforma, setSelectedProforma] = useState('');
  const [items, setItems] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [taxAmount, setTaxAmount] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  
  // ✅ Added state
  const [isPOGenerated, setIsPOGenerated] = useState(false);

  // Fetch proformas and recent orders
 useEffect(() => {
  if (!isProformasFetched) {
    dispatch(fetchProformas());
  }

  dispatch(fetchPurchaseOrders({
    page: currentPage,
    rows_per_page: rowsPerPage,
    search: searchTerm,   // <-- include search term here
  }));
}, [dispatch, currentPage, rowsPerPage, searchTerm, isProformasFetched]);


  // Handle Proforma Selection
  const handleProformaSelect = useCallback((proformaId) => {
  setSelectedProforma(proformaId);
  setIsPOGenerated(false);

  const selected = proformas.find(
    (proforma) => proforma.proforma_id === proformaId
  );

  if (selected) {
    setItems(selected.items || []);
    setDiscounts(new Array(selected.items.length).fill(0));

    // ✅ CORRECT PLACE
    setSelectedRenewals(
      new Array(selected.items.length).fill([])
    );
  }
}, [proformas]);


  // Handle Discount Input Change
  const handleDiscountChange = useCallback((index, value) => {
    if (value < 0 || value > 2000) {
      toast.error('Discount value must be between 0 and 2000.');
      return;
    }

    const updatedDiscounts = [...discounts];
    updatedDiscounts[index] = value;
    setDiscounts(updatedDiscounts);
    setError('');
  }, [discounts]);

  // Handle Purchase Order Generation
const handleGeneratePurchaseOrder = async () => {
  if (!selectedProforma) {
    toast.error("Please select a Proforma!");
    return;
  }

  if (loading) return; // 🚫 prevent multiple clicks while processing

  setLoading(true);

  const itemsWithDiscount = items.map((item, index) => {
  const mode = selectedModes[index] || 'regular';
  const businessType = selectedTypes[index] || 'new';

  const purchaseCost = parseFloat(item.purchase_cost);
  const quantity = parseFloat(item.quantity);
  const discountAmount = discounts[index] || 0;

  const totalBeforeTax = (purchaseCost - discountAmount) * quantity;
  const taxAmount = Math.ceil(totalBeforeTax * 0.18);

  return {
    ...item,
    discount: discountAmount,
    mode,
    business_type: businessType,
    tax_amount: taxAmount,

    // 🔥 NEW KEY ONLY FOR RENEWAL
    selected_renewals:
      businessType === "renewal"
        ? selectedRenewals[index] || []
        : [],
  };
});

  try {
    // dispatch and wait for result
    const result = await dispatch(
      createPurchaseOrder({ proforma_id: selectedProforma, itemsWithDiscount })
    ).unwrap();

    // ✅ Trigger toast immediately
    toast.success(result?.message || "Purchase Order Created Successfully!");
        setIsPOGenerated(true); // ✅ lock after creation

    // refresh list
    dispatch(fetchPurchaseOrders({ page: currentPage, rows_per_page: rowsPerPage, search: searchTerm}));
    dispatch(fetchProformas());

  } catch (error) {
    toast.error(
      error?.message || error?.error || "Failed to create Purchase Order!! Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  // Handle Page Change for Recent Orders
  const handleRecentOrdersPageChange = (page) => {
  if (page < 1 || page > totalPages) return;

  setCurrentPage(page);
  dispatch(fetchPurchaseOrders({
    page,
    rows_per_page: rowsPerPage,
    search: searchTerm, // send current search
  }));
};


  // Handle Rows per Page Change for Recent Orders
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = e.target.value;
    setRowsPerPage(newRowsPerPage);
    dispatch(fetchPurchaseOrders({ page: currentPage, rows_per_page: newRowsPerPage, search: searchTerm }));
  };

  // Download PDF for the Purchase Order
  // const handleDownloadPDF = (orderId) => {
  //   // Assuming the API endpoint to generate/download PDF is `/download-pdf/{orderId}`
  //   window.open(`${API}/download-pdf/${orderId}`, '_blank');
  // };
  const handleDownloadPDF = (order) => {
    // Assuming `order` has `pdf_link` and `base_url`
    const pdfLink = order.pdf_link;  // This is the full path to the PDF
    const baseUrl = order.base_url;  // This is the base URL for the static files
  
    // Construct the full URL for the PDF using the base_url and pdf_link
    const downloadUrl = baseUrl ? `${baseUrl}${pdfLink}` : pdfLink;
  
    // Open the PDF in a new tab or trigger a download
    window.open(downloadUrl, '_blank');
  };

    // mode and type dropdowns

  const [selectedModes, setSelectedModes] = useState(
    items.map(() => 'regular') // Default mode to 'renewal' for all items
  );
  
  const [selectedTypes, setSelectedTypes] = useState(
    items.map(() => 'new') // Default type to 'new' for all items
  );
  
  const handleModeChange = (index, value) => {
    const updatedModes = [...selectedModes];
    updatedModes[index] = value;
    setSelectedModes(updatedModes);
  };
  
  const handleTypeChange = (index, value) => {
    const updatedTypes = [...selectedTypes];
    updatedTypes[index] = value;
    setSelectedTypes(updatedTypes);
  };
   
const handleSearchChange = (term) => {
  setSearchTerm(term);   // ✅ local state
  setCurrentPage(1);               // reset to page 1

  dispatch(fetchPurchaseOrders({
    page: 1,
    rows_per_page: rowsPerPage,
    search: term,
  }));
};

// 🔥 NEW: per item selected renewals
const [selectedRenewals, setSelectedRenewals] = useState([]);

const getRenewalOptions = (item) =>
  (item.renewalOpportunities || []).map(r => ({
    value: r.renewal_id,
    label: `${r.orderNumber}, Qty ${r.originalQuantity}`,
    orderNumber: r.orderNumber,
    originalQuantity: r.originalQuantity,
  }));

  return (
    <div className="purchase-order-container">
      {/* Top Section */}      
      <h3>Purchase Orders</h3>
<ToastContainer />

      <div className="top-section">
        <div className="select-proforma">
          <select
            value={selectedProforma}
            onChange={(e) => handleProformaSelect(e.target.value)}
          >
            <option value="">Select a Proforma</option>
            {proformas.length > 0 ? (
              proformas.map((proforma) => (
                <option key={proforma.proforma_id} value={proforma.proforma_id}>
                {proforma.proforma_id} - {proforma.proforma_tag} - {proforma.customer_name}
                </option>
              ))
            ) : (
              <option disabled>No proformas available</option>
            )}
          </select>
        </div>

      </div>

      {error && <div className="error-message-porder">{error}</div>}

      {/* Bottom Section: Review Items */}
      {selectedProforma && (
        <div className="bottom-section">
          {items.length === 0 ? (
            <p className='no-proforma'>No items available for this Proforma.</p>
          ) : (
            <table className="p-order-invoice-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Vendor Name</th>
                  <th>Vendor Address</th>
                  <th>Qty</th>
                  <th>Purchase Price</th>
                  <th>Discount</th>
                  <th>Mode</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Tax (18%)</th>
                  <th>Grand Total (with Tax)</th>
                </tr>
              </thead>
              <tbody>
              {items.map((item, index) => {
      const discountAmount = (discounts[index]);
      const total = (item.purchase_cost-discountAmount) * item.quantity;
      const taxAmount = Math.ceil(total * 0.18);
      const grandTotal = total + taxAmount;

                  return (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.company_name}</td>
                      <td>{item.address}</td>
                      <td>{item.quantity}</td>
                      <td>₹&nbsp;{item.purchase_cost}</td>
                      <td>
                        <input
                          type="number"
                          value={discounts[index] || 0}
                          onChange={(e) => handleDiscountChange(index, e.target.value)}
                          placeholder="Enter Discount"
                        />
                      </td>
                      {/* Mode Dropdown */}
                      <td>
  <select
    value={selectedModes[index] || 'regular'} // Default to 'renewal'
    onChange={(e) => handleModeChange(index, e.target.value)}
  >
    <option value="regular">Regular</option>
    <option value="lc">LC</option>
    <option value="regular_mkt">Marketing</option>
  </select>
</td>

<td>
  <select
    value={selectedTypes[index] || 'new'}
    onChange={(e) => handleTypeChange(index, e.target.value)}
  >
    <option value="new">New</option>
    <option value="renewal">Renewal</option>
  </select>

  {/* 🔥 Renewal multi-select */}
  {selectedTypes[index] === "renewal" &&
  item.renewalOpportunities?.length > 0 && (
    <Select
  className="renewal-react-select"
  classNamePrefix="renewalSelect"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 }),

    /* 1️⃣ Container must allow wrapping */
    valueContainer: (base) => ({
      ...base,
      flexWrap: "wrap",
      overflow: "visible",
    }),

    /* 2️⃣ Each selected pill */
    multiValue: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      maxWidth: "100%",
      overflow: "visible",
    }),

    /* 3️⃣ Text inside pill */
    multiValueLabel: (base) => ({
      ...base,
      whiteSpace: "nowrap",
      overflow: "visible",
      textOverflow: "clip",
    }),

    /* 4️⃣ Remove (✕) button */
    multiValueRemove: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      padding: "8px 8px",
      cursor: "pointer",
      ':hover': {
        backgroundColor: "#d32f2f",
        color: "#fff",
      },
    }),
  }}

  isMulti
  isClearable
  placeholder="Select renewals"
  options={getRenewalOptions(item)}
  value={(selectedRenewals[index] || []).map(r => ({
  value: r.renewal_id,
  label: `${r.orderNumber}, Qty ${r.originalQuantity}`, 
  orderNumber: r.orderNumber,
  originalQuantity: r.originalQuantity,
}))}

  formatOptionLabel={(option, { context }) => {
  // 🟢 DROPDOWN MENU
  if (context === "menu") {
    return (
      <div style={{ display: "flex", justifyContent: "space-between"}}>
        <span style={{ color: "#666", fontWeight: 700, fontSize: "13px" }}>{option.orderNumber}</span>
        <span style={{ color: "#666", fontWeight: 700, fontSize: "13px" }}>Qty {option.originalQuantity}</span>
      </div>
    );
  }

  // 🟢 SELECTED VALUE (chips)
  return option.label;
}}

  onChange={(selected) => {
    const updated = [...selectedRenewals];
    updated[index] = selected
  ? selected.map(s => ({
      renewal_id: s.value,
      label: s.label,                 // ✅ KEEP LABEL
      orderNumber: s.orderNumber,
      originalQuantity: s.originalQuantity,
    }))
  : [];

    setSelectedRenewals(updated);
  }}
/>

)}
</td>


                      <td>₹&nbsp;{total.toFixed(2)}</td>
                      <td>₹&nbsp;{taxAmount.toFixed(2)}</td>
                      <td>₹&nbsp;{grandTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
      )}
{selectedProforma && items.length > 0 && (
  <button onClick={handleGeneratePurchaseOrder} disabled={loading || isPOGenerated}   className="submit-button-p-order">

{loading ? (
                      <>
                        <FaSpinner className="spinner" size={20} title='Submitting...'/>
                      </>
                    )  : (
                      <>
                        <FaFilePdf  size={24} title={isPOGenerated ? 'PO already generated' : 'Save & Generate PDF'} className='New-p-order'/>
                      </>
                    )}
  </button>
)}  

      {/* Pagination for Recent Orders */}
     

      {/* Recent Purchase Orders Section */}
      <div className="recent-orders-section">
        <h5>Recent Purchase Orders</h5>

       {recentOrders && recentOrders.length > 0 && (
  <div className="pagination-and-search">
    <div className="pagination-section">
      {totalPages > 0 && (
        <div>
          <label>Rows per page:</label>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[10, 20, 30].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>

    <div className="search-section">
      <input
    type="text"
    placeholder="Search by PO Number..."
    value={searchTerm}
    onChange={(e) => handleSearchChange(e.target.value)}
    className="search-by-po-number"
  /> 
    </div>
  </div>
)}

      {/* Home button (top) */}
{recentOrders && recentOrders.length > 0 && currentPage > 1 && (
  <div className="pagination-home-porder">
    <button onClick={() => handleRecentOrdersPageChange(1)}>⏮ Home</button>
  </div>
)}

        {recentOrders && recentOrders.length > 0 ? (
    <table className="purchase-orders-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Customer Name</th>
                <th>Product Name</th>
                <th>Vendor Name</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Download PDF</th>
              </tr>
            </thead>
            <tbody>
  {recentOrders.map((order) => {
    const isCancelled = order.status === "Cancelled" || order.status === "Disabled";

    return (
      <tr
        key={order._id}
        className={isCancelled ? "cancelled-row-po" : ""}
       title={
          order.status === "Cancelled"
            ? "This PO is cancelled with the invoice"
            : order.status === "Disabled"
            ? "This PO is disabled"
            : ""
        }  
      >
        <td>{order.po_number}</td>
        <td>{order.customer_name}</td>
        <td>{order.product_name}</td>
        <td>{order.vendor}</td>
        <td>₹&nbsp;{order.total_amount.toFixed(2)}</td>
        <td>{order.status}</td>
        <td>
          {isCancelled ? (
            <span style={{ color: "#888" }}>PDF Disabled</span>
          ) : (
            <a
              href={`${order.base_url}${order.pdf_link}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

          </table>
        ) : (
          <p className="no-purchase-orders">No Recent Purchase Orders Found.</p>
        )}
      </div>
          {recentOrders && recentOrders.length > 0 && (
          <div className="pagination-controls">
                  <button
                    onClick={() => handleRecentOrdersPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft />
                  </button>
                  <span className='page-quote'>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handleRecentOrdersPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                  <FaChevronRight />
                  </button>
                </div>
                )}
    </div>
  );
};

export default CreatePurchaseOrder;
