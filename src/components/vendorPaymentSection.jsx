// import React, { useState } from "react";

// const purchases = [
//   { id: 1, vendor: "Vendor A", amount: 5000 },
//   { id: 2, vendor: "Vendor A", amount: 3000 },
//   { id: 3, vendor: "Vendor A", amount: 2000 },
// ];

// export default function VXPaymentIdea1() {
//   const [selected, setSelected] = useState([]);
//   const total = selected.reduce((s, i) => s + i.amount, 0);

//   const toggle = (row) => {
//     setSelected((p) =>
//       p.find((i) => i.id === row.id)
//         ? p.filter((i) => i.id !== row.id)
//         : [...p, row]
//     );
//   };

//   return (
//     <div style={{ display: "flex", gap: 20 }}>
//       <table border="1" width="70%">
//         <thead>
//           <tr><th></th><th>Vendor</th><th>Amount</th></tr>
//         </thead>
//         <tbody>
//           {purchases.map((p) => (
//             <tr key={p.id}>
//               <td><input type="checkbox" onChange={() => toggle(p)} /></td>
//               <td>{p.vendor}</td>
//               <td>{p.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div style={{ border: "1px solid #ccc", padding: 10, width: "30%" }}>
//         <h4>Payment Summary</h4>
//         <p>Total: {total}</p>
//         <input placeholder="Paid Amount" />
//         <textarea placeholder="Comment" />
//         <button>Submit</button>
//       </div>
//     </div>
//   );
// }





// import React, { useState } from "react";

// const data = [
//   { id: 1, vendor: "Vendor A", amount: 4000 },
//   { id: 2, vendor: "Vendor A", amount: 6000 },
// ];

// export default function VXPaymentIdea2() {
//   const [selected, setSelected] = useState([]);
//   const total = selected.reduce((s, i) => s + i.amount, 0);

//   const toggle = (row) => {
//     setSelected((p) =>
//       p.find((i) => i.id === row.id)
//         ? p.filter((i) => i.id !== row.id)
//         : [...p, row]
//     );
//   };

//   return (
//     <div>
//       <table border="1" width="100%">
//         <thead>
//           <tr><th></th><th>Vendor</th><th>Amount</th></tr>
//         </thead>
//         <tbody>
//           {data.map((d) => (
//             <tr key={d.id}>
//               <td><input type="checkbox" onChange={() => toggle(d)} /></td>
//               <td>{d.vendor}</td>
//               <td>{d.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {selected.length > 0 && (
//         <div style={{ marginTop: 10, padding: 10, border: "1px solid blue" }}>
//           <b>Total Selected: {total}</b>
//           <input placeholder="Paid Amount" />
//           <input placeholder="Comment" />
//           <button>Submit</button>
//         </div>
//       )}
//     </div>
//   );
// }




// import React, { useState } from "react";

// const DATA = {
//   "Vendor A": [
//     { id: 1, po: "PO-21", amount: 5000 },
//     { id: 2, po: "PO-22", amount: 3000 }
//   ],
//   "Vendor B": [
//     { id: 3, po: "PO-31", amount: 4000 }
//   ]
// };

// export default function VXPaymentIdea5Full() {
//   const [open, setOpen] = useState(null);

//   return (
//     <div style={{ padding: 20, fontFamily: "Arial" }}>
//       <h2>VX Payment – Vendor Accordion</h2>

//       {Object.keys(DATA).map(v => (
//         <div key={v} style={{ border: "1px solid #ccc", marginBottom: 10 }}>
//           <div
//             style={{ padding: 10, background: "#eee", cursor: "pointer" }}
//             onClick={() => setOpen(open === v ? null : v)}
//           >
//             <b>{v}</b>
//           </div>

//           {open === v && (
//             <div style={{ padding: 10 }}>
//               {DATA[v].map(p => (
//                 <div key={p.id}>PO: {p.po} – {p.amount}</div>
//               ))}
//               <br />
//               <input placeholder="Paid Amount" />
//               <input placeholder="Comment" style={{ marginLeft: 10 }} />
//               <button style={{ marginLeft: 10 }}>Submit</button>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );

// import React, { useState, useMemo } from "react";

// const DATA = [
//   { id: 1, po: "PO-101", vendor: "Vendor A", amount: 5000 },
//   { id: 2, po: "PO-102", vendor: "Vendor A", amount: 3000 },
//   { id: 3, po: "PO-103", vendor: "Vendor B", amount: 4000 },
// ];

// export default function VXPaymentIdea6PopupFlow() {
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [paid, setPaid] = useState("");
//   const [comment, setComment] = useState("");
//   const [shake, setShake] = useState(false);

//   const selectedRows = DATA.filter(d => selectedIds.includes(d.id));
//   const total = useMemo(() => selectedRows.reduce((s, r) => s + r.amount, 0), [selectedRows]);

//   const paidNum = Number(paid) || 0;
//   const balance = Math.max(total - paidNum, 0);
//   const status = paidNum === 0 ? "Pending" : paidNum < total ? "Partial" : "Paid";

//   const toggleRow = (id) => {
//     if (showPopup) {
//       setShake(true);
//       setTimeout(() => setShake(false), 400);
//       return;
//     }
//     setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   };

//   return (
//     <div style={{ padding: 20, fontFamily: "Arial" }}>
//       <h2>VX Payment – Popup Flow</h2>

//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr style={{ background: "#f2f2f2" }}>
//             <th></th><th>PO No</th><th>Vendor</th><th>Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {DATA.map(r => (
//             <tr key={r.id}>
//               <td style={{ textAlign: "center" }}>
//                 <input
//                   type="checkbox"
//                   checked={selectedIds.includes(r.id)}
//                   onChange={() => toggleRow(r.id)}
//                 />
//               </td>
//               <td>{r.po}</td>
//               <td>{r.vendor}</td>
//               <td>{r.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <button
//         disabled={selectedIds.length === 0}
//         onClick={() => setShowPopup(true)}
//         style={{ marginTop: 15, padding: "8px 16px" }}
//       >
//         Proceed
//       </button>

//       {showPopup && (
//         <div
//           onClick={() => {
//             setShake(true);
//             setTimeout(() => setShake(false), 400);
//           }}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.4)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000
//           }}
//         >
//           <div
//             onClick={e => e.stopPropagation()}
//             style={{
//               width: 420,
//               background: "#fff",
//               padding: 20,
//               borderRadius: 6,
//               border: shake ? "2px solid red" : "2px solid #007bff",
//               animation: shake ? "shake 0.4s" : "none"
//             }}
//           >
//             <h4>Selected Purchases</h4>

//             <table style={{ width: "100%", marginBottom: 10 }}>
//               <tbody>
//                 {selectedRows.map(r => (
//                   <tr key={r.id}>
//                     <td>{r.po}</td>
//                     <td align="right">{r.amount}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <p><b>Total:</b> {total}</p>

//             <input
//               placeholder="Paid Amount"
//               value={paid}
//               onChange={e => setPaid(e.target.value)}
//               style={{ width: "100%", marginBottom: 8 }}
//             />

//             <textarea
//               placeholder="Comment"
//               value={comment}
//               onChange={e => setComment(e.target.value)}
//               style={{ width: "100%", height: 60 }}
//             />

//             <p style={{ marginTop: 10 }}>
//               <b>Status:</b> {status} <br />
//               <b>Balance:</b> {balance}
//             </p>

//             <button style={{ width: "100%", marginTop: 10 }}>
//               Submit Payment
//             </button>
//           </div>

//           <style>{`
//             @keyframes shake {
//               0% { transform: translateX(0); }
//               25% { transform: translateX(-6px); }
//               50% { transform: translateX(6px); }
//               75% { transform: translateX(-6px); }
//               100% { transform: translateX(0); }
//             }
//           `}</style>
//         </div>
//       )}
//     </div>
//   );
// }




// import React, { useState, useMemo } from "react";

// const DATA = [
//   { id: 1, po: "PO-101", vendor: "Vendor A", amount: 5000 },
//   { id: 2, po: "PO-102", vendor: "Vendor A", amount: 3000 },
//   { id: 3, po: "PO-103", vendor: "Vendor B", amount: 4000 },
// ];

// export default function VXPaymentPopupFullPage() {
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [paid, setPaid] = useState("");
//   const [comment, setComment] = useState("");
//   const [shake, setShake] = useState(false);

//   const selectedRows = DATA.filter(d => selectedIds.includes(d.id));
//   const total = useMemo(() => selectedRows.reduce((s, r) => s + r.amount, 0), [selectedRows]);

//   const paidNum = Number(paid) || 0;
//   const balance = Math.max(total - paidNum, 0);
//   const status = paidNum === 0 ? "Pending" : paidNum < total ? "Partial" : "Paid";

//   const toggleRow = (id) => {
//     if (showPopup) {
//       triggerShake();
//       return;
//     }
//     setSelectedIds(prev => prev.includes(id)
//       ? prev.filter(x => x !== id)
//       : [...prev, id]
//     );
//   };

//   const triggerShake = () => {
//     setShake(true);
//     setTimeout(() => setShake(false), 400);
//   };

//   return (
//     <div style={{ padding: 20, fontFamily: "Arial" }}>
//       <h2>VX Payment</h2>

//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr style={{ background: "#f2f2f2" }}>
//             <th style={th}></th>
//             <th style={th}>PO No</th>
//             <th style={th}>Vendor</th>
//             <th style={th}>Purchase Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {DATA.map(r => (
//             <tr key={r.id}>
//               <td style={td}>
//                 <input
//                   type="checkbox"
//                   checked={selectedIds.includes(r.id)}
//                   onChange={() => toggleRow(r.id)}
//                 />
//               </td>
//               <td style={td}>{r.po}</td>
//               <td style={td}>{r.vendor}</td>
//               <td style={td}>{r.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <button
//         disabled={selectedIds.length === 0}
//         onClick={() => setShowPopup(true)}
//         style={{ marginTop: 15, padding: "8px 18px" }}
//       >
//         Proceed
//       </button>

//       {showPopup && (
//         <div
//           onClick={triggerShake}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.4)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000
//           }}
//         >
//           <div
//             onClick={e => e.stopPropagation()}
//             style={{
//               width: 420,
//               background: "#fff",
//               padding: 20,
//               borderRadius: 6,
//               position: "relative",
//               border: shake ? "2px solid red" : "2px solid #007bff",
//               animation: shake ? "shake 0.4s" : "none"
//             }}
//           >
//             <button
//               onClick={() => setShowPopup(false)}
//               style={{
//                 position: "absolute",
//                 top: 8,
//                 right: 10,
//                 border: "none",
//                 background: "transparent",
//                 fontSize: 18,
//                 cursor: "pointer"
//               }}
//             >
//               ✕
//             </button>

//             <h4>Selected Purchases</h4>

//             <table style={{ width: "100%", marginBottom: 10 }}>
//               <tbody>
//                 {selectedRows.map(r => (
//                   <tr key={r.id}>
//                     <td>{r.po}</td>
//                     <td align="right">{r.amount}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <p><b>Total:</b> {total}</p>

//             <input
//               placeholder="Paid Amount"
//               value={paid}
//               onChange={e => setPaid(e.target.value)}
//               style={input}
//             />

//             <textarea
//               placeholder="Comment"
//               value={comment}
//               onChange={e => setComment(e.target.value)}
//               style={{ ...input, height: 60 }}
//             />

//             <p style={{ marginTop: 10 }}>
//               <b>Status:</b> {status}<br />
//               <b>Balance:</b> {balance}
//             </p>

//             <button style={{ width: "100%", padding: 8 }}>
//               Submit Payment
//             </button>
//           </div>

//           <style>{`
//             @keyframes shake {
//               0% { transform: translateX(0); }
//               25% { transform: translateX(-6px); }
//               50% { transform: translateX(6px); }
//               75% { transform: translateX(-6px); }
//               100% { transform: translateX(0); }
//             }
//           `}</style>
//         </div>
//       )}
//     </div>
//   );
// }

// const th = { border: "1px solid #ccc", padding: 8 };
// const td = { border: "1px solid #ccc", padding: 8, textAlign: "center" };
// const input = { width: "100%", marginBottom: 8, padding: 6 };




import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProformas, fetchPurchaseOrders, createPurchaseOrder } from '../redux/slices/purchaseOrderSlice';
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { FaSpinner, FaFilePdf } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatePurchaseOrder = () => {
  const dispatch = useDispatch();
  const popupRef = useRef(null);

  const {
    proformas = [],
    recentOrders = [],
    totalPages = 0,
    isProformasFetched
  } = useSelector((state) => state.purchaseOrder || {});

  const [selectedProforma, setSelectedProforma] = useState('');
  const [items, setItems] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [isPOGenerated, setIsPOGenerated] = useState(false);

  /* ---------------- NEW STATES ---------------- */
  const [showRenewalPopup, setShowRenewalPopup] = useState(false);
  const [popupWarning, setPopupWarning] = useState(false);
  const [selectedRenewals, setSelectedRenewals] = useState([]);

  /* -------- HARD-CODED RENEWAL DATA -------- */
  const renewalItems = [
    {
      id: 1,
      product: "11111",
      
      qty: 5,
     
    },
    {
      id: 2,
      product: "22222",
      
      qty: 1,
    }
  ];

  /* ------------------------------------------ */

  useEffect(() => {
    if (!isProformasFetched) dispatch(fetchProformas());

    dispatch(fetchPurchaseOrders({
      page: currentPage,
      rows_per_page: rowsPerPage,
      search: searchTerm
    }));
  }, [dispatch, currentPage, rowsPerPage, searchTerm, isProformasFetched]);

  const handleProformaSelect = (proformaId) => {
    setSelectedProforma(proformaId);
    setIsPOGenerated(false);

    const selected = proformas.find(p => p.proforma_id === proformaId);
    if (selected) {
      setItems(selected.items || []);
      setDiscounts(new Array(selected.items.length).fill(0));
    }
  };

  const handleDiscountChange = (index, value) => {
    const updated = [...discounts];
    updated[index] = value;
    setDiscounts(updated);
  };

  /* ---------- TYPE CHANGE (NEW / RENEWAL) ---------- */
  const handleTypeChange = (index, value) => {
    const updated = [...selectedTypes];
    updated[index] = value;
    setSelectedTypes(updated);

    if (value === "renewal") {
      setShowRenewalPopup(true);
    }
  };

  /* ---------- POPUP OUTSIDE CLICK WARNING ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (showRenewalPopup && popupRef.current && !popupRef.current.contains(e.target)) {
        setPopupWarning(true);
        setTimeout(() => setPopupWarning(false), 600);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showRenewalPopup]);

  const toggleRenewalSelect = (item) => {
    setSelectedRenewals(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  };

  /* ---------------- DROPDOWNS ---------------- */
  const [selectedModes, setSelectedModes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  /* ================== JSX ================== */
  return (
    <div className="purchase-order-container" style={{ padding: 20 }}>
      <h3>Purchase Orders</h3>
      <ToastContainer />

      <select value={selectedProforma} onChange={(e) => handleProformaSelect(e.target.value)}>
        <option value="">Select Proforma</option>
        {proformas.map(p => (
          <option key={p.proforma_id} value={p.proforma_id}>
            {p.proforma_id} - {p.customer_name}
          </option>
        ))}
      </select>

      {selectedProforma && (
        <table border="1" width="100%" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>{item.purchase_cost}</td>
                <td>
                  <input
                    type="number"
                    value={discounts[i] || 0}
                    onChange={(e) => handleDiscountChange(i, e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={selectedTypes[i] || "new"}
                    onChange={(e) => handleTypeChange(i, e.target.value)}
                  >
                    <option value="new" disabled={selectedTypes[i] === "renewal"}>
                      New
                    </option>
                    <option value="renewal">Renewal</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= POPUP ================= */}
      {showRenewalPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999
          }}
        >
          <div
            ref={popupRef}
            style={{
              width: "20%",
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              border: popupWarning ? "3px solid red" : "2px solid #333",
              animation: popupWarning ? "shake 0.3s" : "none"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Select Renewal Items</h4>
              <FaTimes
                style={{ cursor: "pointer" }}
                onClick={() => setShowRenewalPopup(false)}
              />
            </div>

            <table border="1" width="100%">
              <thead>
                <tr>
                  <th>po number</th>
                  
                  <th>Qty</th>
                  
                </tr>
              </thead>
              <tbody>
                {renewalItems.map(item => (
                  <tr key={item.id}>
                   
                    <td>{item.product}</td>
                    
                    <td>{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}

      <style>
        {`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        `}
      </style>
    </div>
  );
};

export default CreatePurchaseOrder;