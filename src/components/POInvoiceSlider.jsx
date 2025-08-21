import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { fetchProductsAsync, fetchComboProductsAsync } from '../redux/slices/productSlice';
import { createPerforma, fetchPerformasAsync,resetProformaCreationResponse } from '../redux/slices/proformaSlice';
import { fetchQuotesAsync } from '../redux/slices/quoteSlice';
import { FaSpinner, FaFilePdf } from 'react-icons/fa';
import { MdAddBox } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { createPortal } from "react-dom";



const POInvoiceSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const proformaInvoiceState = useSelector((state) => state.proformaInvoice);
  const { loading, performas, proformaInvoices, error, currentPage, totalPages } = proformaInvoiceState || {};
  const quoteState = useSelector((state) => state.quote); // Getting entire quote state
  const { quotes } = quoteState || {};
  const proformaCreationResponse = useSelector(state => state.proformaInvoice.successMessage); // Get success message from state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const combos = useSelector((s) => s.products?.comboProducts || []);


  const [refPoValue, setRefPoValue] = useState(""); // ✅ Define the state {/* --added-27-3*/}
  const [proformaType, setProformaType] = useState("new");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState(null);
  // const { quotes, proformaInvoices, loading, error, currentPage, totalPages } = useSelector(
  //   (state) => state.proformaInvoice
  // );

const [hoveredCatId, setHoveredCatId] = useState(null); // category currently hovered
const [activeCatId, setActiveCatId] = useState(null); // category clicked/tapped (persist)
const hideTimerRef = useRef(null);

const itemsPerPage = 5; // Adjust based on your requirement
  //const [currentPerformas, setCurrentPerformas] = useState(1);

const sliderRef = useRef(null); // Reference for the slider container changes made
const wrapperRef = useRef(null);
  const [invoiceLines, setInvoiceLines] = useState([{
  productId: '',
  quantity: 1,
  discount: 0,
  subtotal: 0,
  unitPrice: 0,
  drStatus: '',
  selectionType: '',
  selectedProduct: null,
  selectedCombo: '',
  dropdownOpen: false
}]);
const invoiceLinesRef = useRef(invoiceLines);
useEffect(() => {
  invoiceLinesRef.current = invoiceLines;
}, [invoiceLines]);

const triggerRefs = useRef([]);
const portalRefs = useRef([]);
const [portalPos, setPortalPos] = useState({ top: 0, left: 0 });


  const [total, setTotal] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [currentPageState, setCurrentPageState] = useState(1);
  useEffect(() => {
    if (proformaCreationResponse) {
      alert(proformaCreationResponse); // This will display the success message
      dispatch(fetchPerformasAsync({ page: currentPageState, customer_id: customerId })); // this is to refresh the Previous performas table
       // After dispatching, reset proformaCreationResponse to prevent it from triggering again
      dispatch(resetProformaCreationResponse()); // Action to reset the response

    }
  }, [proformaCreationResponse]);
  

  useEffect(() => {
    if (customerId) {  // Make sure the customerId is provided
      dispatch(fetchPerformasAsync({ page: currentPageState, customer_id: customerId }));
    }
  }, [dispatch, currentPageState, customerId]);

  const indexOfLastQuote = currentPageState * itemsPerPage;
  const indexOfFirstQuote = indexOfLastQuote - itemsPerPage;
//  console.log ("current ProformalInvoices are:", proformaInvoices)
 const currentPerformas = Array.isArray(performas) ? performas.slice(indexOfFirstQuote, indexOfLastQuote) : [];
useEffect(() => {
  dispatch(fetchProductsAsync());
  dispatch(fetchComboProductsAsync()); // important for combo dropdowns
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
    if (customerId) {
      dispatch(fetchPerformasAsync({ page: currentPageState, customer_id: customerId })).then((response) => {
     //   console.log("API Response fetchPerformasAsync :", response); // Add this to check the API response
      });
    }
  }, [dispatch, currentPageState, customerId]);

  useEffect(() => {
   // console.log("Updated currentPerformas:", currentPerformas);  // Track the updated value
  }, [currentPerformas]); 

  useEffect(() => {
   // console.log("Proforma Invoices Redux State:", proformaInvoiceState); // This will show the full state
  }, [proformaInvoiceState]);

  useEffect(() => {
    console.log('Initial quotes from Redux state:', quotes);
    if (proformaType === "existing" && customerId) {
      dispatch(fetchQuotesAsync({ page: currentPageState, customer_id: customerId })).then((response)=> {
        console.log('after fetch quotes from Redux state:', response);
      });
      
    }
  }, [dispatch, currentPageState, customerId, proformaType]);

  useEffect(() => {
    console.log("Proforma Invoices State:", proformaInvoices);  // Add this to debug the state
  }, [proformaInvoices]);

  useEffect(() => {
    if (proformaType === "new") {
      setInvoiceLines([{
       productId: '',
      quantity: 1,
      discount: 0,
      subtotal: 0,
      unitPrice: 0,
      drStatus: '',
      selectionType: 'single',
      selectedProduct: null,
      selectedCombo: '',
      dropdownOpen: false
      }]);
      setTotal(0);
    setOverallDiscount(0);
    setTaxAmount(0);
    setFinalTotal(0);
    } else if (proformaType === "existing" && selectedQuoteDetails) {
      const quoteItems = selectedQuoteDetails.items.map(item => ({
        productId: item.productId,
      productCode: item.productCode,
      salesCode: item.salesCode,
      quantity: item.quantity,
      discount: item.discount,
      subtotal: item.subtotal,
      unitPrice: item.unitPrice,
      drStatus: item.drStatus,
      selectionType: 'single',   // ADD THIS
      selectedProduct: null,     // ADD THIS (optional: prefill if products list available)
      selectedCombo: '',         // ADD THIS
      dropdownOpen: false        // ADD THIS
      }));
      setOverallDiscount(selectedQuoteDetails.overall_discount); // this has been added here to fetch the existing values
      setTaxAmount(selectedQuoteDetails.tax_amount); // this has been added here to fetch the existing values
      setInvoiceLines(quoteItems);
      updateTotal(quoteItems);
    }
  }, [proformaType, selectedQuoteDetails]);

  useEffect(() => {
    if (selectedQuoteDetails) {
      const quoteItems = selectedQuoteDetails.items.map(item => ({
              description: item.description || "Unknown Product",
      productCode: item.productCode || ' ',
      salesCode: item.salesCode || 0,
      quantity: item.quantity || 0,
      discount: item.discount || 0,
      subtotal: item.sub_total || 0,
      unitPrice: item.unit_price || 0,
      drStatus: item.dr_status || "",
      productId: item.product_id || 0,
      selectionType: 'single',     // Added for dropdown logic
      selectedProduct: null,       // Optional: prefill if products available
      selectedCombo: '',           // Optional: prefill if combo
      dropdownOpen: false          // Control dropdown visibility

      }));
      setOverallDiscount(selectedQuoteDetails.overall_discount); // this has been added here to fetch the existing values
      setTaxAmount(selectedQuoteDetails.tax_amount); // this has been added here to fetch the existing values
      setInvoiceLines(quoteItems);
      updateTotal(quoteItems);
    }
  }, [selectedQuoteDetails]);

   //changes made from here 
  const handleLineChange = (index, field, value) => {
  const newInvoiceLines = [...invoiceLines];
  const line = newInvoiceLines[index]; // easier reference
  line[field] = value;

  // Handle quantity or discount changes
  if (field === 'quantity' || field === 'discount') {
    if (line.selectionType === 'single') {
      const product = products.find(p => p._id === line.productId);

      if (!product) {
        // 👇 Removed duplicate alert here
        line.discount = 0;
      } else {
        const quantity = parseInt(line.quantity, 10) || 1;
        let discount = parseFloat(line.discount) || 0;
        const price = parseFloat(product.salesCost) || 0;

        const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
        line.discount = validDiscount;

        const unitPrice = price;
        const subtotal = (unitPrice - validDiscount) * quantity;

        line.unitPrice = unitPrice;
        line.subtotal = subtotal;
      }
    } else if (line.selectionType === 'combo') {
      const combo =
        combos.find(c => c.comboCode === line.productId) ||
        combos.find(c => c.comboCode === line.selectedCombo);

      if (!combo) {
        // 👇 Removed duplicate alert here
        line.discount = 0;
      } else {
        const quantity = parseInt(line.quantity, 10) || 1;
        let discount = parseFloat(line.discount) || 0;
        const unitPrice = parseFloat(combo.salesCost) || 0;

        const validDiscount = Math.min(discount, parseFloat(combo.maxDiscount) || 100);
        line.discount = validDiscount;

        const subtotal = (unitPrice - validDiscount) * quantity;

        line.unitPrice = unitPrice;
        line.subtotal = subtotal;
        line.description = combo.comboDisplayName || '';
        line.productCode = combo.comboCode;
        line.salesCode = '';
      }
    }
  }

  // ✅ Discount validation (keep alerts only here)
  if (field === 'discount') {
    if (line.selectionType === 'single') {
      const product = products.find(p => p._id === line.productId);
      if (!product) {
        alert("💡 Please select a product first, before entering a discount!");
        return;
      }

      let discount = parseFloat(value) || 0;
      const maxDiscount = parseFloat(product.maxDiscount) || 100;

      if (discount < 0) {
        alert("⛔ Discount cannot be negative!");
        discount = 0;
      } else if (discount > maxDiscount) {
        alert(`🚫 Maximum discount allowed is ${maxDiscount}₹!`);
        discount = maxDiscount;
      }
      line.discount = discount;
    } else if (line.selectionType === 'combo') {
      const combo =
        combos.find(c => c.comboCode === line.productId) ||
        combos.find(c => c.comboCode === line.selectedCombo);

      if (!combo) {
        alert("💡 Please select a combo first, before entering a discount!");
        return;
      }

      let discount = parseFloat(value) || 0;
      const maxDiscount = parseFloat(combo.maxDiscount) || 100;

      if (discount < 0) {
        alert("⛔ Discount cannot be negative!");
        discount = 0;
      } else if (discount > maxDiscount) {
        alert(`🚫 Maximum discount allowed is ${maxDiscount}₹!`);
        discount = maxDiscount;
      }
      line.discount = discount;
    }
  }

  setInvoiceLines(newInvoiceLines);
  updateTotal(newInvoiceLines);
};

  
   const updateTotal = (lines) => {
       const totalCost = lines.reduce((acc, line) => acc + line.subtotal, 0);
       setTotal(totalCost);
       calculateFinalTotal(totalCost, overallDiscount);
     };
   
     useEffect(() => {
       // Log when the quotes are updated in the state
       console.log('Quotes updated in Redux state:', quotes);
     }, [quotes]); // This will log every time the `quotes` state changes
   
     useEffect(() => {
    // console.log("Component current Performans", currentPerformas);
   }, [currentPerformas]);
   
    // const currentPerformas = Array.isArray(performas) ? performas.slice(indexOfFirstPerforma, indexOfLastPerforma) : [];
     const calculateFinalTotal = (totalAmount, overallDiscount) => {
       console.log ("check overalldiscount here: ",overallDiscount );
       const discountedTotal = totalAmount - overallDiscount;
       const tax = Math.round(discountedTotal * 0.18); // 18% Tax, rounded to nearest integer
       setTaxAmount(tax);
       setFinalTotal(discountedTotal + tax);
     };
 
     const handleAddProductRow = () => {
  setInvoiceLines([
    ...invoiceLines,
    {
      productId: '',
      quantity: 1,
      discount: 0,
      subtotal: 0,
      unitPrice: 0,
      drStatus: '',
      selectionType: 'single',   // added
      selectedProduct: null,      // added
      selectedCombo: '',          // added
      dropdownOpen: false         // added
    },
  ]);
};

  
  const handleProductSelect = (index, productId) => {
  const newInvoiceLines = [...invoiceLines];
  const line = newInvoiceLines[index];
  line.productId = productId;

  // SINGLE PRODUCT
  if (line.selectionType === "single") {
    const product = products.find((p) => p._id === productId);
    if (product) {
      const quantity = parseInt(line.quantity, 10) || 1;
      let discount = parseFloat(line.discount) || 0;
      const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
      const unitPrice = parseFloat(product.salesCost) || 0;
      const subtotal = (unitPrice - validDiscount) * quantity;

      line.unitPrice = unitPrice;
      line.subtotal = subtotal;
      line.description = product.ProductDisplay || '';
      line.productCode = product.productCode;
      line.salesCode = product.salesCode;
      line.discount = validDiscount; // enforce max discount
    }
  }

  // COMBO PRODUCT
  if (line.selectionType === "combo") {
    const combo = combos.find((c) => c.comboCode === productId);
    if (combo) {
      const quantity = parseInt(line.quantity, 10) || 1;
      const unitPrice = parseFloat(combo.salesCost) || 0;
      const subtotal = unitPrice * quantity;

      line.unitPrice = unitPrice;
      line.subtotal = subtotal;
      line.description = combo.comboDisplayName || '';
      line.productCode = combo.comboCode;
      line.salesCode = '';
      line.discount = 0; // combos may not allow individual discounts
    }
  }

  setInvoiceLines(newInvoiceLines);
  updateTotal(newInvoiceLines);
};


    const handleOverallDiscountChange = (e) => {
  let discountValue = parseFloat(e.target.value) || 0;
  const maxOverallDiscount = 100; // Maximum allowed discount

  // ✅ Check if at least one product or combo is selected
  const hasProductOrCombo = invoiceLines.some(
    (line) => line.productId || line.selectedCombo
  );

  if (!hasProductOrCombo) {
    alert("💡 Please select a product or combo first, before entering an overall discount!");
    return;
  }

  // ✅ Validate discount limits
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

  const handleDeleteProductRow = (index) => {
    const newInvoiceLines = invoiceLines.filter((_, i) => i !== index);
    setInvoiceLines(newInvoiceLines);
    updateTotal(newInvoiceLines);
  };

  const handleQuoteSelect = (quoteID) => {
    const selectedQuote = quotes.find((quote) => quote.quote_id === quoteID);
  
    if (!selectedQuote) {
      console.error("Selected quote not found");
      return;
    }
  
    setSelectedQuote(quoteID);
    setSelectedQuoteDetails(selectedQuote);
  
    const quoteItems = selectedQuote.items.map(item => ({
  description: item.description || "Unknown Product",
  productCode: item.productCode || ' ',
  salesCode: item.salesCode || 0,
  quantity: parseInt(item.quantity) || 0,
  discount: parseFloat(item.discount) || 0,
  subtotal: parseFloat(item.sub_total) || 0,
  unitPrice: parseFloat(item.unit_price) || 0,
  drStatus: item.dr_status || "",
  productId: item.product_id || 0,
  selectionType: item.selectionType || "single",
  selectedCombo: item.selectedCombo || ""
}));

setOverallDiscount(selectedQuote.overall_discount || 0);
setTaxAmount(selectedQuote.tax_amount || 0);
setInvoiceLines(quoteItems);
updateTotal(quoteItems);

  };
  

  const handleSubmitProformaInvoice = () => {
  console.log("selected quote:", selectedQuoteDetails);

  // --- VALIDATIONS ---
  if (!customerId) {
    alert("⚠️ Please select a customer before submitting the Proforma Invoice!");
    return;
  }

  if (invoiceLines.length === 0) {
    alert("⚠️ Please add at least one product before submitting!");
    return;
  }

  if (invoiceLines.some(line => !line.productId)) {
    alert("⚠️ One or more lines are missing a product!");
    return;
  }

  if (invoiceLines.some(line => line.quantity <= 0)) {
    alert("⚠️ Quantity must be greater than 0 for all products!");
    return;
  }

  // --- PREPARE DATA ---
  const proformaInvoiceData = {
    customer_id: customerId,
    preformaTag: `${invoiceLines.map(line => `${line.productCode}(${line.quantity})`).join('-')}`,
    quote_number: selectedQuoteDetails?.quote_number || null,
    refPoValue: refPoValue || "",
    quote_tag: selectedQuoteDetails?.quote_tag || null,
    items: invoiceLines.map(line => {
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
        productCode: line.productCode,
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
    tax_amount: taxAmount
  };

  console.log("📝 Dispatching createPerforma action:", proformaInvoiceData);
  dispatch(createPerforma(proformaInvoiceData));

  alert("✅ Proforma Invoice submitted successfully!");

  // --- RESET FORM ---
  setInvoiceLines([{
    productCode: '',
    productId: '',
    description: '',
    quantity: 1,
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


  const handlePageChange = (pageNumber) => {
    setCurrentPageState(pageNumber);
    dispatch(fetchPerformasAsync({ page: pageNumber }));
  };

  useEffect(() => {
  function handleClick(e) {
    let clickedInsideSlider = wrapperRef.current?.contains(e.target);

    invoiceLinesRef.current.forEach((line, i) => {
      const triggerEl = triggerRefs.current[i];
      const portalEl = portalRefs.current[i];

      const clickedInsideDropdown =
        triggerEl?.contains(e.target) || portalEl?.contains(e.target);

      // Close dropdown if click outside trigger + portal
      if (line.dropdownOpen && !clickedInsideDropdown) {
        const newLines = [...invoiceLinesRef.current];
        newLines[i].dropdownOpen = false;
        setInvoiceLines(newLines);
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
<div ref={wrapperRef} className="POinvoice-slider show">
      <div className="POinvoice-slider-content">
        <div className="POinvoice-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
  <h4 >Create Proforma Invoice For</h4> 
  <p >Customer Name </p>
</div>
          <MdOutlineCancel onClick={onClose} className="close-slider" title="Close" />
        </div>
        <div className="radio-group">
  <input 
    type="radio" 
    id="new" 
    value="new" 
    checked={proformaType === "new"} 
    onChange={() => setProformaType("new")} 
  />
  <label htmlFor="new">New</label>

  <input 
    type="radio" 
    id="existing" 
    value="existing" 
    checked={proformaType === "existing"} 
    onChange={() => setProformaType("existing")} 
  />
  <label htmlFor="existing">From Existing Quotes</label>

</div>
{/* from--added-27-3*/}
<div className="input-container-ref">
  <label className='ref' >Ref PO</label>
  <input 
    type="text" 
    placeholder="Enter Reference PO" 
    value={refPoValue} 
    onChange={(e) => setRefPoValue(e.target.value)} 
    className="form-control-ref"
  />
</div>
{/* to--added-27-3*/}
        {/* Proforma Invoice Selection */}
       <div className="proforma-invoice-create-section">
  {proformaType === "existing" && (
    <div className="quote-selection">
      <select
        value={selectedQuote}
        onChange={(e) => handleQuoteSelect(e.target.value)}
      >
        <option value="">Select Quote</option>
        {quotes && quotes.length > 0 ? (
          quotes.map((quote,index) => (
            <option key={quote.quote_id} value={quote.quote_id}>
              {quote.quote_number && quote.quote_tag ? `${quote.quote_number} - ${quote.quote_tag}` : 'Unknown Quote'}
            </option>
          ))
        ) : (
          <option>No quotes available</option>
        )}
      </select>
    </div>  
  )}

  {/* Invoice Table for "New" Proforma */}
  <table className="po-invoice-table">
    <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Discount</th>
        <th>DR Status</th> {/* New column for DR Status */}
        <th>Unit Price</th>
        <th>Sub Total</th>
        {proformaType === "new" && <th>Actions</th>} {/* Conditionally render "Actions" header */}
      </tr>
    </thead>
   <tbody>
  {invoiceLines.map((line, index) => (
    <tr key={line.description + index}>
      <td>
        {/* SELECTION TYPE */}
        <div className="selection-type">
          <select
            value={line.selectionType}
            onChange={(e) => {
              const val = e.target.value;
              const newLines = [...invoiceLines];
              newLines[index].selectionType = val;
              newLines[index].selectedProduct = null;
              newLines[index].selectedCombo = "";
              setInvoiceLines(newLines);
            }}
            className="select-product-type-po"
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
              <div
                ref={(el) => (triggerRefs.current[index] = el)}
                onClick={(e) => {
                  e.stopPropagation();
                  const newLines = [...invoiceLines];
                  const nextOpen = !newLines[index].dropdownOpen;
                  newLines[index].dropdownOpen = nextOpen;
                  setInvoiceLines(newLines);

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
                    onClick={(e) => e.stopPropagation()}
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
                                  const newLines = [...invoiceLines];
                                  newLines[index].selectedProduct = p;
                                  newLines[index].productId = p._id;
                                  newLines[index].dropdownOpen = false; // 👈 close dropdown after selection
                                  handleProductSelect(index, p._id);
                                  setInvoiceLines(newLines);
                                }}
                                className={`product-item ${
                                  line.selectedProduct?._id === p._id
                                    ? "selected"
                                    : ""
                                }`}
                              >
                                {p.productName} ({p.ProductDisplay || ""}) — Code:{" "}
                                {p.productCode}
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
                      const newLines = [...invoiceLines];
                      newLines[index].selectedCombo = selectedComboCode;
                      newLines[index].productId = selectedComboCode;

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
                      }

                      setInvoiceLines(newLines);
                      updateTotal(newLines);
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
      </td>
          {/* Quantity */}
          <td>
            {proformaType === "existing" ? (
              <span>{line.quantity}</span>
            ) : (
              <input 
                className="po-quantity-input"
                type="number"
                value={line.quantity || ""}
                onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                min="1"
                placeholder={`Quantity`}
                required
              />
            )}
          </td>

          {/* Discount */}
          <td>
            {proformaType === "existing" ? (
              <span>{line.discount}</span>
            ) : (
              <input
                type="number"
                className="po-quantity-input"
                value={line.discount || ""}
                onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
                min="0"
                max={products.find(product => product._id === line.productId)?.maxDiscount || 100}
                placeholder={`Discount`}
                required
              />
            )}
          </td>

          {/* DR Status */}
          <td>
            {proformaType === "existing" ? (
              <span>{line.drStatus || "Unknown Status"}</span>
            ) : (
              <select
                value={line.drStatus || ""}
                onChange={(e) => handleLineChange(index, 'drStatus', e.target.value)}
                className="po-select"
              >
                <option value="" disabled>Select DR Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            )}
          </td>

          {/* Unit Price & Subtotal */}
          <td className="po-unit-price">{(line.unitPrice || 0).toFixed(2)}</td>
          <td className="po-subtotal">{(line.subtotal || 0).toFixed(2)}</td>

          {/* Actions */}
          {proformaType === "new" && (
            <td>
              <div className="icon-container-po">
                <MdDelete
                  onClick={() => handleDeleteProductRow(index)}
                  className="delete-poinvoice"
                  title="Delete Quote"
                />
                <MdAddBox
                  onClick={() => handleAddProductRow(index)}
                  className="add-poinvoice"
                  title="Add Quote"
                />
              </div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>

        <div  className="totals-section">
          <div>
            <label className="label">Sum:</label>
            <span className="amount"> ₹&nbsp;{total.toFixed(2)}</span>
          </div>
          <div>
            {/*CHANGES MADE */}
            <input 
              className="amount"
              type="number" 
              step="0.01"
              value={overallDiscount === 0 ? '' : overallDiscount}  
              onChange={handleOverallDiscountChange}            
              disabled={proformaType === "existing"}
              placeholder="Enter Overall Discount"
            />                  {/*TO HERE - bugs free */}
          </div>
          <div>
            <label className="label">Total:</label>
            <span className="amount"> ₹&nbsp;{(total - overallDiscount).toFixed(2)}</span> 
            </div>

          <div>
            <label className="label">Tax (18%):</label>
            <span className="amount"> ₹&nbsp;{taxAmount.toFixed(2)}</span>
          </div>
           </div>
          <div className="po-quote-final-total">           
             <label className="label">Grand Total (with 18% tax):</label>
            <span className="amount"> &nbsp;₹&nbsp;{finalTotal.toFixed(2)}</span>
          </div>
         
          <button 
            onClick={handleSubmitProformaInvoice} 
            disabled={loading || total === 0}
            className="submit-button-po">
                    {loading ? (
                      <>
                        <FaSpinner className="spinner" size={20} title='Submitting...'/>
                      </>
                    )  : (
                      <>
                        <FaFilePdf  size={24} title='Save & Generate PDF' className='Newpo'/>
                      </>
                    )}
                  </button>
        </div>
        {/* Available PO's Section (Empty Placeholder for now) */}
        <div className="proforma-created-section">
  <h4>Previous Proformas</h4>
  
  {currentPerformas && currentPerformas.length > 0 ? (
    <table className="po-table">
      <thead>
        <tr>
          <th>Proforma Number</th>
          <th>Date</th>
          <th>Proforma Tag</th>
          <th>Price</th>
          <th>PDF Link</th>
        </tr>
      </thead>
      <tbody>
        {currentPerformas.map((invoice) => (
          <tr key={invoice.performa_number}>
            <td>{invoice.performa_number}</td>
            <td>{new Date(invoice.performa_date).toLocaleDateString('en-US')}</td>
            <td>{invoice.preformaTag}</td>
            <td>
            ₹&nbsp;{invoice.total_amount && !isNaN(invoice.total_amount)
                ? invoice.total_amount.toFixed(2)
                : "0.00"}
            </td>
            <td>
            <a href={`${invoice.base_url}${invoice.pdf_link}`} target="_blank" rel="noopener noreferrer">
            Download PDF
            </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="no-po">No Proformas Available</p>
  )}



  {/* Pagination Controls */}
  {currentPerformas && currentPerformas.length > 0 && (
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

export default POInvoiceSlider;
