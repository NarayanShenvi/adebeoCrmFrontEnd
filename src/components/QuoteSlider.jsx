import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineCancel } from "react-icons/md"; // Correct import changes made
import { fetchProductsAsync, fetchComboProductsAsync } from "../redux/slices/productSlice";
import { createQuote, fetchQuotesAsync } from '../redux/slices/quoteSlice';  // Import the createQuote and fetchQuotesAsync actions
import { MdAddBox, MdDelete  } from "react-icons/md";
import { FaSpinner, FaFilePdf, FaHackerNewsSquare } from 'react-icons/fa';
import {  FaChevronLeft, FaChevronRight } from "react-icons/fa"; //import statements are changed and some new imports are added
import { createPortal } from "react-dom";

const QuoteSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products); // List of products from Redux
  const quoteState = useSelector((state) => state.quote); // Getting entire quote state
  const { loading, quotes, error, currentPage, totalPages,quoteCreationResponse } = quoteState || {}; // Safe destructuring

const sliderRef = useRef(null); // Reference for the slider container changes made
const wrapperRef = useRef(null);
const triggerRefs = useRef({}); // per-line trigger elements
const [portalPos, setPortalPos] = useState({ top: 0, left: 0 });
const portalRefs = useRef({}); // store per-line portal refs

// Local UI state
const [selectionType, setSelectionType] = useState("single"); // "single" | "combo"
const [dropdownOpen, setDropdownOpen] = useState(false);

// Hover / click control
const [hoveredCatId, setHoveredCatId] = useState(null); // category currently hovered
const [activeCatId, setActiveCatId] = useState(null); // category clicked/tapped (persist)
const hideTimerRef = useRef(null);

const [selectedProduct, setSelectedProduct] = useState(null);
const [selectedCombo, setSelectedCombo] = useState("");

// Redux state (safe selectors)
const combos = useSelector((s) => s.products?.comboProducts || []);

const [quoteLines, setQuoteLines] = useState([{
  productCode:'',
  productId: '',
  description:'',
  quantity: 0,
  discount: 0,
  subtotal: 0,
  unitPrice: 0,
  drStatus: '',
  selectionType: 'single',  // add per line
  selectedProduct: null,    // add per line
  selectedCombo: '',        // add per line
}]);
const quoteLinesRef = useRef(quoteLines);
// keep the ref updated whenever quoteLines changes
useEffect(() => {
  quoteLinesRef.current = quoteLines;
}, [quoteLines]);

  const [total, setTotal] = useState(0);
  //changes
  const [overallDiscount, setOverallDiscount] = useState(0); // New state for overall discount
  const [finalTotal, setFinalTotal] = useState(0); // New state for final total
  const [taxAmount, setTaxAmount] = useState(0); // <-- ADD THIS to fix the issue

  // Pagination state for lower section
  const [currentPageState, setCurrentPageState] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page

  useEffect(() => {
  dispatch(fetchProductsAsync());
  dispatch(fetchComboProductsAsync());
}, [dispatch]);
const clearHideTimer = () => {
  if (hideTimerRef.current) {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }
};
const startHideTimer = (delay = 250) => {
  clearHideTimer();
  hideTimerRef.current = setTimeout(() => {
    setHoveredCatId(null);
    hideTimerRef.current = null;
  }, delay);
};
const onCategoryMouseEnter = (catId) => { clearHideTimer(); setHoveredCatId(catId); };
const onCategoryMouseLeave = () => startHideTimer(200);
const onSubmenuMouseEnter = (catId) => { clearHideTimer(); setHoveredCatId(catId); };
const onSubmenuMouseLeave = () => startHideTimer(200);
const onCategoryClick = (catId) => { setActiveCatId(prev => (prev === catId ? null : catId)); setDropdownOpen(true); };
const pickProduct = (prod) => {
  setSelectedProduct(prod);
  setDropdownOpen(false);
  setHoveredCatId(null);
  setActiveCatId(null);
  clearHideTimer();
};
const categories = useMemo(() => {
  const map = {};
  const unc = { _id: "uncat", categoryName: "Uncategorized", products: [] };

  products.forEach((p) => {
    const code = p.categoryCode && String(p.categoryCode).trim() !== "" ? String(p.categoryCode) : null;
    const name = p.categoryName || p.category || code || "Uncategorized";

    if (code) {
      if (!map[code]) map[code] = { _id: code, categoryName: name, products: [] };
      map[code].products.push(p);
    } else {
      unc.products.push(p);
    }
  });

  const arr = Object.values(map);
  if (unc.products.length) arr.push(unc);
  return arr;
}, [products]);

const currentCatId = hoveredCatId ?? activeCatId ?? null;

const currentProducts = useMemo(() => {
  const cat = categories.find((c) => c._id === currentCatId);
  return cat?.products || [];
}, [categories, currentCatId]);


  useEffect(() => {
    if (quoteCreationResponse && quoteCreationResponse.message) {
      const timer = setTimeout(() => {
        dispatch({ type: 'quote/clearSuccessMessage' }); // Dispatch an action to reset the success message if you want
      }, 5000);  // Hide after 5 seconds
      return () => clearTimeout(timer);  // Cleanup timer if component unmounts
    }
  }, [quoteCreationResponse, dispatch]);  // This will trigger when quoteCreationResponse updates
  
  useEffect(() => {
    // Fetch products from the backend when the component mounts
    dispatch(fetchProductsAsync());
  
    // Fetch quotes for the specific customer with the current page
    if (customerId) {  // Make sure the customerId is provided
      dispatch(fetchQuotesAsync({ page: currentPageState, customer_id: customerId }));
    }
  }, [dispatch, currentPageState, customerId]);

  useEffect(() => {
    console.log("Updated quote creation response:", quoteCreationResponse); // Add this log
    if (quoteCreationResponse) {
      alert(`Quote created successfully! PDF link: ${quoteCreationResponse.pdf_link}`);
       // Refetch the quotes after creating the new quote
       dispatch(fetchQuotesAsync({ page: 1, customer_id: customerId }));
      }
  }, [quoteCreationResponse]); // This will trigger when quoteCreationResponse updates
  
const handleSelectionTypeChange = (index, value) => {
  const newLines = [...quoteLines];
  newLines[index].selectionType = value;
  newLines[index].selectedProduct = null;
  newLines[index].selectedCombo = '';
  setQuoteLines(newLines);
};

 //changes made from here 
const handleLineChange = (index, field, value) => {
  const newQuoteLines = [...quoteLines];
  newQuoteLines[index][field] = value;
  const line = newQuoteLines[index];

  console.log('Quantity before processing:', line.quantity);

  // 1) Discount edits: validate + alert for ALL (single + combo)
  if (field === 'discount') {
    let product = null;
    let maxDiscount = 100;

    if (line.selectionType === 'single') {
      product = products.find(p => p._id === line.productId);
      if (!product) {
        alert("💡 Please select a product first, before entering a discount!");
        setQuoteLines(newQuoteLines);
        line.discount = 0;
        return;
      }
      maxDiscount = parseFloat(product.maxDiscount) || 100;
    } 
    else if (line.selectionType === 'combo') {
      const combo =
        combos.find(c => c.comboCode === line.productId) ||
        combos.find(c => c.comboCode === line.selectedCombo);
      if (!combo) {
        alert("💡 Please select a combo first, before entering a discount!");
        setQuoteLines(newQuoteLines);
        line.discount = 0;
        return;
      }
      maxDiscount = parseFloat(combo.maxDiscount) || 100; // ✅ enforce combo maxDiscount too
    }

    let discount = parseFloat(value) || 0;

    if (discount < 0) {
      alert("⛔ Discount cannot be negative!");
      discount = 0;
    } else if (discount > maxDiscount) {
      alert(`🚫 Maximum discount allowed is ${maxDiscount}₹!`);
      discount = maxDiscount;
    }
    line.discount = discount;
  }

  // 2) Recalculate on quantity or discount
  if (field === 'quantity' || field === 'discount') {
    if (line.selectionType === 'single') {
      const product = products.find(p => p._id === line.productId);
      if (product) {
        const quantity = parseInt(line.quantity, 10) || 1;
        let discount = parseFloat(line.discount) || 0;
        const maxDiscount = parseFloat(product.maxDiscount) || 100;

        // ✅ Clamp silently for single
        if (discount < 0) discount = 0;
        if (discount > maxDiscount) discount = maxDiscount;
        line.discount = discount;

        const unitPrice = parseFloat(product.salesCost) || 0;
        const subtotal = (unitPrice - discount) * quantity;

        line.unitPrice = unitPrice;
        line.subtotal = subtotal;
        line.description = product.ProductDisplay || '';
        line.productCode = product.productCode;
        line.salesCode = product.salesCode;
      }
    } else if (line.selectionType === 'combo') {
      const combo =
        combos.find(c => c.comboCode === line.productId) ||
        combos.find(c => c.comboCode === line.selectedCombo);

      if (combo) {
        const quantity = parseInt(line.quantity, 10) || 1;
        let discount = parseFloat(line.discount) || 0;
        const maxDiscount = parseFloat(combo.maxDiscount) || 100;

        // ✅ Clamp silently for combo too
        if (discount < 0) discount = 0;
        if (discount > maxDiscount) discount = maxDiscount;
        line.discount = discount;

        const unitPrice = parseFloat(combo.salesCost) || 0;
        const subtotal = (unitPrice - discount) * quantity;

        line.unitPrice = unitPrice;
        line.subtotal = subtotal;
        line.description = combo.comboDisplayName || '';
        line.productCode = combo.comboCode;
        line.salesCode = '';
      }
    }
  }

  setQuoteLines(newQuoteLines);
  updateTotal(newQuoteLines);
};

const handleAddProductRow = () => {
  setQuoteLines([
    ...quoteLines,
    {
     productCode: '',
      productId: '',
      description: '',
      quantity: 0,
      discount: 0,
      subtotal: 0,
      unitPrice: 0,
      drStatus: '',
      selectionType: 'single',   // 👈 ensure default is single
      selectedProduct: null,     // 👈 required for product dropdown
      selectedCombo: null        // 👈 keep null for combo
    },
  ]);
};

const handleProductSelect = (index, productId) => {
  const newQuoteLines = [...quoteLines];
  const line = newQuoteLines[index];
  line.productId = productId;

  if (line.selectionType === "single") {
    const product = products.find(p => p._id === productId);
    if (product) {
      const quantity = parseInt(line.quantity, 10) || 1;
      const discount = Math.min(parseFloat(line.discount) || 0, parseFloat(product.maxDiscount) || 100);
      const unitPrice = parseFloat(product.salesCost) || 0;
      const subtotal = (unitPrice - discount) * quantity;

      line.unitPrice = unitPrice;
      line.subtotal = subtotal;
      line.description = product.ProductDisplay || '';
      line.productCode = product.productCode;
      line.salesCode = product.salesCode;
      line.discount = discount;
    }
  }

  if (line.selectionType === "combo") {
    const combo = combos.find(c => c.comboCode === productId);
    if (combo) {
      const quantity = parseInt(line.quantity, 10) || 1;
      const unitPrice = parseFloat(combo.salesCost) || 0;
      const subtotal = unitPrice * quantity;

      line.unitPrice = unitPrice;
      line.subtotal = subtotal;
      line.description = combo.comboDisplayName;
      line.productCode = combo.comboCode;
      line.salesCode = '';
      line.discount = 0; // optional, combos may not allow individual discounts
    }
  }

  setQuoteLines(newQuoteLines);
  updateTotal(newQuoteLines);
};

//changes made

const updateTotal = (lines) => {
const totalCost = lines.reduce((acc, line) => acc + line.subtotal, 0);
setTotal(totalCost);
calculateFinalTotal(totalCost, overallDiscount);
};

const handleOverallDiscountChange = (e) => {
let discountValue = parseFloat(e.target.value) || 0;
const maxOverallDiscount = 100; // Maximum allowed discount

// Check if at least one product is selected
const hasProductOrCombo = quoteLines.some(
  (line) => line.productId || line.selectedCombo
);

if (!hasProductOrCombo) {  
  alert("💡 Please select a product or combo first, before entering an overall discount!");
  return;
}

if (discountValue < 0) {
  alert("⛔ Overall Discount cannot be negative!");
  discountValue = 0;
} else if (discountValue > maxOverallDiscount) {
  alert(`🚫 Maximum allowed Overall Discount is ${maxOverallDiscount}₹!`);
  discountValue = maxOverallDiscount;
}

setOverallDiscount(discountValue);
calculateFinalTotal(total, discountValue);
};
//to here -- bugs free


const calculateFinalTotal = (totalAmount, discount) => {
  const discountedTotal = Math.max(0, totalAmount - discount); // Ensure it doesn't go negative
  const tax = Math.round(discountedTotal * 0.18); // 18% Tax, rounded to nearest integer
  setTaxAmount(tax);
  setFinalTotal(discountedTotal + tax);
};

  const handleDeleteProductRow = (index) => {
    const newQuoteLines = quoteLines.filter((_, i) => i !== index); // Remove the product row by index
    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines); // Recalculate total after removal
  };
  //const indexOfLastQuote = currentPageState * itemsPerPage;
  //console.log("current indexOfLastQuote",indexOfLastQuote )
  //const indexOfFirstQuote = indexOfLastQuote - itemsPerPage;
  // console.log("current indexOfFirstQuote",indexOfFirstQuote )
  //const currentQuotes = Array.isArray(quotes) ? quotes.slice(indexOfFirstQuote, indexOfLastQuote) : [];
  const currentQuotes = quotes;
  const handlePageChange = (pageNumber) => {
    setCurrentPageState(pageNumber);
    dispatch(fetchQuotesAsync({ page: pageNumber, customer_id: customerId }));
  };
  console.log("current quotes",currentQuotes )
//changes made to disable button
  const handleSubmitQuote = () => {
  console.log("🔹 handleSubmitQuote function triggered!");

  // ✅ Validation 1: Customer must be selected
  if (!customerId) {
    alert("⚠️ Please select a customer before submitting the quote!");
    return;
  }

  // ✅ Validation 2: At least one product line required
  if (quoteLines.length === 0) {
    alert("⚠️ Please add at least one product before submitting!");
    return;
  }

  // ✅ Validation 3: Product ID must be present
  if (quoteLines.some(line => !line.productId)) {
    alert("⚠️ One or more lines are missing a product!");
    return;
  }

  // ✅ Validation 4: Quantity must be > 0
  if (quoteLines.some(line => line.quantity <= 0)) {
    alert("⚠️ Quantity must be greater than 0 for all products!");
    return;
  }

  console.log("✅ All validations passed, submitting the quote...");

  const quoteData = {
    customer_id: customerId,
    quoteTag: `${quoteLines.map(line => `${line.productCode}(${line.quantity})`).join('-')}`,
    items: quoteLines.map(line => {
      // Detect if this is a combo
      const combo = combos.find(c => c.comboCode === line.productId);
      let description = line.description;
      let unitPrice = line.unitPrice;
      let subtotal = line.subtotal;

      if (combo) {
        description = combo.comboDisplayName;
        unitPrice = parseFloat(combo.salesCost) || 0;
        subtotal = unitPrice * (parseInt(line.quantity, 10) || 1);
      }

      return {
        description,
        prodcutCode: line.productCode,
        salesCode: line.salesCode,
        quantity: line.quantity,
        discount: line.discount,
        unit_price: unitPrice,
        sub_total: subtotal,
        dr_status: line.drStatus,
        product_id: line.productId
      };
    }),
    gross_total: finalTotal,
    overall_discount: overallDiscount,
    tax_amount: taxAmount,
  };

  console.log("📝 Dispatching createQuote action:", quoteData);
  dispatch(createQuote(quoteData));

  alert("✅ Quote submitted successfully!");

  // ✅ Reset the form fields after submission
  setQuoteLines([{
    productCode: '',
    productId: '',
    description: '',
    quantity: 0,
    discount: 0,
    subtotal: 0,
    unitPrice: 0,
    drStatus: '',
  }]);

  setTotal(0);
  setFinalTotal(0);
  setOverallDiscount(0);
  setTaxAmount(0);

  console.log("🔄 Form reset successfully!");
};

useEffect(() => {
  function handleClick(e) {
    let clickedInsideSlider = wrapperRef.current?.contains(e.target);

    quoteLinesRef.current.forEach((line, i) => {
      const triggerEl = triggerRefs.current[i];
      const portalEl = portalRefs.current[i];

      const clickedInsideDropdown =
        triggerEl?.contains(e.target) || portalEl?.contains(e.target);

      // Close dropdown if click outside trigger + portal
      if (line.dropdownOpen && !clickedInsideDropdown) {
        const newLines = [...quoteLinesRef.current];
        newLines[i].dropdownOpen = false;
        setQuoteLines(newLines);
      }

      // Prevent slider from closing if click inside dropdown
      if (clickedInsideDropdown) {
        clickedInsideSlider = true;
      }
    });

    // Close slider if clicked completely outside wrapper + portal
    if (!clickedInsideSlider) {
      onClose();
    }
  }

  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, [onClose]);

  return (

<div ref={wrapperRef}  className="quote-slider show">
      <div className="quote-slider-content">
        <div className="quote-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
  <h4 >Create a New Quote For</h4> 
  <p >Customer Name </p>
</div>
          <MdOutlineCancel onClick={onClose} className="close-slider" title="Close" />
        </div>

        {/* Quote Creation Section */}
        <div className="quote-create-section">
          {quoteLines.map((line, index) => (
            <div key={index} className="quote-line">

              {/* SELECTION TYPE */}
        <div className="selection-type">
          <select
            value={line.selectionType}
            onChange={(e) => {
              const val = e.target.value;
              const newLines = [...quoteLines];
              newLines[index].selectionType = val;
              newLines[index].selectedProduct = null;
              newLines[index].selectedCombo = "";
              setQuoteLines(newLines);
            }}
            className="select-product-type"
          >
            <option value="" disabled>
              Select Product Type
            </option>
            <option value="single">Single Product</option>
            <option value="combo">Combo Product</option>
          </select>
        </div>
             <div className="quote-wrapper">

{/* SINGLE PRODUCT DROPDOWN */}
{line.selectionType === "single" && (
  <div className="single-product-container">
    {/* Trigger box */}
    <div
      ref={(el) => (triggerRefs.current[index] = el)}
      onClick={(e) => {
        e.stopPropagation(); // Prevent slider closure
        const newLines = [...quoteLines];
        const nextOpen = !newLines[index].dropdownOpen;
        newLines[index].dropdownOpen = nextOpen;
        setQuoteLines(newLines);

        // Position the portal under the trigger
        const el = triggerRefs.current[index];
        if (nextOpen && el) {
          const r = el.getBoundingClientRect();
          setPortalPos({
            top: r.bottom + window.scrollY,
            left: r.left + window.scrollX,
          });
        }
      }}
      className="single-product-trigger"
    >
      {line.selectedProduct
        ? `${line.selectedProduct.productName} (${line.selectedProduct.productCode})`
        : "Select Category"}
    </div>

    {/* Render dropdown into body */}
    {line.dropdownOpen &&
      createPortal(
        <div
          ref={(el) => (portalRefs.current[index] = el)}
          style={{
            position: "absolute",
            top: portalPos.top,
            left: portalPos.left,
            zIndex: 10000,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent slider closure
        >
          <div className="product-dropdown">
            {/* Left panel: Categories */}
            <div className="product-categories">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  onMouseEnter={() => setHoveredCatId(cat._id)}
                  onClick={() => setActiveCatId(cat._id)}
                  className={`category-item ${
                    hoveredCatId === cat._id ? "hovered" : ""
                  }`}
                >
                  {cat.categoryName} ({cat.products.length})
                </div>
              ))}
            </div>

            {/* Right panel: Products */}
            <div className="product-list">
              {currentCatId &&
                categories
                  .find((c) => c._id === currentCatId)
                  ?.products.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => {
                        const newLines = [...quoteLines];
                        newLines[index].selectedProduct = p;
                        newLines[index].productId = p._id;
                        newLines[index].dropdownOpen = false; // 👈 close dropdown after selection
                        setQuoteLines(newLines);
                        handleProductSelect(index, p._id);
                      }}
                      className={`product-item ${
                        line.selectedProduct?._id === p._id ? "selected" : ""
                      }`}
                    >
                      {p.productName} ({p.ProductDisplay || ""}) — Code: {p.productCode}
                    </div>
                  ))}
            </div>
          </div>
        </div>,
        document.body
      )}
  </div>
)}
        {/* COMBO PRODUCT DROPDOWN */}
        {line.selectionType === "combo" && (
          <div className="combo-container">
            {loading ? (
              <div className="loading">Loading combos...</div>
            ) : combos.length === 0 ? (
              <div className="no-combos">No combos available</div>
            ) : (
              <div>
                <select
                  value={line.selectedCombo || ""}
                  onChange={(e) => {
                    const selectedComboCode = e.target.value;
                    const newLines = [...quoteLines];
                    newLines[index].selectedCombo = selectedComboCode;
                    newLines[index].productId = selectedComboCode;
                    setQuoteLines(newLines);

                    const combo = combos.find(
                      (c) => c.comboCode === selectedComboCode
                    );
                    if (combo) {
                      const quantity =
                        parseInt(newLines[index].quantity, 10) || 1;
                      const unitPrice = parseFloat(combo.salesCost) || 0;
                      const subtotal = unitPrice * quantity;

                      newLines[index].unitPrice = unitPrice;
                      newLines[index].subtotal = subtotal;
                      newLines[index].description = combo.comboDisplayName;
                      newLines[index].productCode = combo.comboCode;
                      newLines[index].salesCode = "";
                      newLines[index].discount = 0;

                      setQuoteLines(newLines);
                      updateTotal(newLines);
                    }
                  }}
                  className="combo-select-quote"
                >
                  <option value="">Select Combo</option>
                  {combos.map((c) => (
                    <option key={c.comboCode} value={c.comboCode}>
                      {c.comboDisplayName} (Code: {c.comboCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

             <input
  type="number"
  className="quote-quantity-input"
  value={line.quantity || ""} // Allows placeholder to show when empty
  onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
  placeholder={`Quantity`} // Dynamic placeholder
  min="1"
  required
/>

<input
  type="number"
  className="quote-discount-input"
  value={line.discount || ""}  // Shows placeholder when empty
  onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
  min="0"
  max={products.find(product => product._id === line.productId)?.maxDiscount || 100}
  placeholder={`Discount`}
  required
/>

              <select
                  className="quote-select"
                  value={line.drStatus}
  onChange={(e) => handleLineChange(index, 'drStatus', e.target.value)}
  required
>
<option value="" disabled>Select DR Status</option>

  <option value="Pending">Pending</option>
  <option value="Approved">Approved</option>
  <option value="Rejected">Rejected</option>
</select>

              <span className="quote-unit-price">Unit Price: ₹&nbsp;{line.unitPrice.toFixed(2)}</span>
              <span className="quote-subtotal">Sub Total: ₹&nbsp;{line.subtotal.toFixed(2)}</span>

              <MdDelete 
              className='delete-quote'
  size={20} 
  onClick={() => handleDeleteProductRow(index)} 
  title="Delete Quote"
/>

{index === quoteLines.length - 1 && (
  <MdAddBox
  className='add-quote'
    size={20} 
    onClick={handleAddProductRow} 
    title="Add Quote"
/>
)}

            </div>
          ))}

<div className="quote-summary">
  <strong className="label">Sum: <span className="amount">₹&nbsp;{total.toFixed(2)}</span></strong>
  <input
  type="number"
  step="0.01"
  value={overallDiscount === 0 ? '' : overallDiscount}  // Show placeholder when value is empty
  onChange={handleOverallDiscountChange}
  placeholder="Enter Overall Discount"
/>

  <strong className="label">Total: <span className="amount">₹&nbsp;{(total - overallDiscount).toFixed(2)}</span></strong>
  <strong className="label">Tax (18%): <span className="amount">₹&nbsp;{taxAmount.toFixed(2)}</span></strong>
  </div>

          <div className="quote-final-total">
          <strong className="label">Grand Total (with 18% tax): <span className="amount"> ₹&nbsp;{finalTotal.toFixed(2)}</span></strong>
          </div>
          <button onClick={handleSubmitQuote}   disabled={loading }
 className="submit-button-quote">
            {loading ? (
              <>
                <FaSpinner className="spinner" size={20} title='Submitting...'/>
              </>
            )  : (
              <>
                <FaFilePdf  size={24} title='Save & Generate PDF' className='NewQuote'/>
              </>
            )}
          </button>
          
          
        </div>

        {/* Quote Display Section (Created Quotes as Table) */}
        <div className="quote-created-section">
          <h4>Previous Quotes</h4>
          {quotes.length === 0 ? (
            <p className='no-quote'>No Quotes Available</p>
          ) : (
            <table className="quote-table">
              <thead>
                <tr>
                  <th>Quote Number</th>
                  <th>Date</th>
                  <th>Quote Tag</th>
                  <th>Price</th>
                  <th>PDF Link</th>
                </tr>
              </thead>
              {/* Inside the return section, within the created quotes table */}
              <tbody>
                {currentQuotes.map((quoteItem) => (
                  <tr key={quoteItem.quote_id}>  {/* Ensure the key is unique and corresponds to the correct field */}
                    <td>{quoteItem.quote_number}</td> {/* Display the quote ID */}
                    <td>{quoteItem.quote_date}</td> {/* Display the quote date */}
                    <td>{quoteItem.quote_tag}</td> {/* Display the quote tag */}
                    <td>
                      {/* Safely handle total price */}
                      ₹&nbsp;{quoteItem.total_price && !isNaN(quoteItem.total_price)
                        ? quoteItem.total_price.toFixed(2)
                        : "0.00"}
                    </td> {/* Display total price */}
                    <td>
                      {/* Display PDF link */}
                      <a href={`${quoteItem.base_url}${quoteItem.pdf_link}`} target="_blank" rel="noopener noreferrer">
                        Download PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
                      
           {/* Pagination controls */}
           {quotes.length > 0 && (
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPageState - 1)}
              disabled={currentPageState === 1}
            >
            <FaChevronLeft />  
            </button>
            <span className='page-quote'>Page {currentPageState} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPageState + 1)}
              disabled={currentPageState === totalPages}
            >
              <FaChevronRight />
            </button>
            </div>
)}
        </div>
      </div>
      
    </div>
  );
};

export default QuoteSlider;




