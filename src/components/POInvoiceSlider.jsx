import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { fetchProductsAsync } from '../redux/slices/productSlice';
import { createPerforma, fetchPerformasAsync } from '../redux/slices/proformaSlice';
import { fetchQuotesAsync } from '../redux/slices/quoteSlice';
//import { createPerforma } from '../redux/slices/proformaSlice';
import { FaSpinner, FaFilePdf } from 'react-icons/fa';
import { MdAddBox } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


const POInvoiceSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const proformaInvoiceState = useSelector((state) => state.proformaInvoice);
  const { loading, performas, proformaInvoices, error, currentPage, totalPages } = proformaInvoiceState || {};
  const quoteState = useSelector((state) => state.quote); // Getting entire quote state
  const { quotes } = quoteState || {};
  const proformaCreationResponse = useSelector(state => state.proformaInvoice.successMessage); // Get success message from state

  // const { quotes, proformaInvoices, loading, error, currentPage, totalPages } = useSelector(
  //   (state) => state.proformaInvoice
  // );
  const itemsPerPage = 5; // Adjust based on your requirement
  //const [currentPerformas, setCurrentPerformas] = useState(1);

  const sliderRef = useRef(null);

  const [proformaType, setProformaType] = useState("new");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState(null);

  const [invoiceLines, setInvoiceLines] = useState([{
    productId: '',
    quantity: 1,
    discount: 0,
    subtotal: 0,
    unitPrice: 0,
    drStatus: '',
  }]);

  const [total, setTotal] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [currentPageState, setCurrentPageState] = useState(1);
  useEffect(() => {
    if (proformaCreationResponse) {
      alert(proformaCreationResponse); // This will display the success message
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
  }, [dispatch]);

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
      }]);
    } else if (proformaType === "existing" && selectedQuoteDetails) {
      const quoteItems = selectedQuoteDetails.items.map(item => ({
        productId: item.productId,
        productCode: item.productCode,
        quantity: item.quantity,
        discount: item.discount,
        subtotal: item.subtotal,
        unitPrice: item.unitPrice,
        drStatus: item.drStatus,
      }));
      setInvoiceLines(quoteItems);
      updateTotal(quoteItems);
    }
  }, [proformaType, selectedQuoteDetails]);

  useEffect(() => {
    if (selectedQuoteDetails) {
      const quoteItems = selectedQuoteDetails.items.map(item => ({
        description: item.description || "Unknown Product",
        productCode:item.productCode|| ' ',
        quantity: item.quantity || 0,
        discount: item.discount || 0,
        subtotal: item.sub_total || 0,
        unitPrice: item.unit_price || 0,
        drStatus: item.dr_status || "",
        productId: item.product_id || 0,  // Ensure product_id is used
      }));
  
      setInvoiceLines(quoteItems);
      updateTotal(quoteItems);
    }
  }, [selectedQuoteDetails]);

   //changes made from here 
    const handleLineChange = (index, field, value) => {
      const newInvoiceLines = [...invoiceLines];
      newInvoiceLines[index][field] = value;
    
      if (field === 'quantity' || field === 'discount') {
        const product = products.find(product => product._id === newInvoiceLines[index].productId);
        if (product) {
          const quantity = parseInt(newInvoiceLines[index].quantity, 10) || 1;
          let discount = parseFloat(newInvoiceLines[index].discount) || 0;
          const price = parseFloat(product.salesCost) || 0;
    
          const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
          newInvoiceLines[index].discount = validDiscount;
    
          const unitPrice = price;
          const subtotal = (unitPrice - validDiscount) * quantity;
    
          newInvoiceLines[index].unitPrice = unitPrice;
          newInvoiceLines[index].subtotal = subtotal;
        }
      }
      
      if (field === 'discount') {
        const product = products.find(product => product._id === newInvoiceLines[index].productId);
  
        if (!product) {
            alert("💡 Please select a product first, before entering a discount!");
            return; // Prevents further execution
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
  
        newInvoiceLines[index].discount = discount;
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
     const calculateFinalTotal = (totalAmount, discount) => {
       const discountedTotal = totalAmount - discount;
       const tax = discountedTotal * 0.18;
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
        },
      ]);
    };
  
    const handleProductSelect = (index, productId) => {
      const product = products.find((product) => product._id === productId);
      if (product) {
        const quantity = parseInt(invoiceLines[index].quantity, 10) || 1;
        let discount = parseFloat(invoiceLines[index].discount) || 0;
        const price = parseFloat(product.salesCost) || 0;
        const description = product.ProductDisplay;
        const productCode = product.productCode;
  
        const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
    
        const unitPrice = price;
        const subtotal = (unitPrice - validDiscount) * quantity;
        
    
        const newInvoiceLines = [...invoiceLines];
        newInvoiceLines[index].productId = productId;
        newInvoiceLines[index].unitPrice = unitPrice;
        newInvoiceLines[index].subtotal = subtotal;
        newInvoiceLines[index].description = description;
        newInvoiceLines[index].productCode = productCode;
        setInvoiceLines(newInvoiceLines);
        updateTotal(newInvoiceLines);
      }
    };
    const handleOverallDiscountChange = (e) => {
      let discountValue = parseFloat(e.target.value) || 0;
      const maxOverallDiscount = 100; // Maximum allowed discount
    
      // Check if at least one product is selected
      const hasProduct = invoiceLines.some(line => line.productId);
    
      if (!hasProduct) {  
          alert("💡 Please select a product first, before entering a overall discount!");
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
      productCode:item.productCode || ' ',
      quantity: item.quantity || 0,
      discount: item.discount || 0,
      subtotal: item.sub_total || 0,
      unitPrice: item.unit_price || 0,
      drStatus: item.dr_status || "",
      productId:item.product_id||0
    }));
  
    setInvoiceLines(quoteItems);
    updateTotal(quoteItems);
  };
  

  const handleSubmitProformaInvoice = () => {
      console.log ("selected quote:",selectedQuoteDetails)
      const proformaInvoiceData = {
        customer_id: customerId,
        preformaTag: 'PROFORMA_INVOICE_TAG',
        quote_number: selectedQuoteDetails?.quote_number || null, // Add selected quote_id here
        quote_tag: selectedQuoteDetails?.quote_tag || null, // Add selected quote_tag here 
        items: invoiceLines.map(line => ({
          description: line.description || "Sample Product",
          quantity: line.quantity,
          discount: line.discount,
          unit_price: line.unitPrice,
          sub_total: line.subtotal,
          dr_status: line.drStatus,
          product_id:line.productId
        })),
        gross_total: finalTotal,
      };
      dispatch(createPerforma(proformaInvoiceData));
      // ✅ Reset the form fields after submission
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
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  return (
<div ref={sliderRef}  className="POinvoice-slider show">
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
                    {proformaType === "existing" ? (
                      <span>{line.description || "Unknown Product"}</span>
                    ) : (
                      <select value={line.productId} onChange={(e) => handleProductSelect(index, e.target.value)} className='po-select'>
                        <option value="" disabled>Select Product</option>
                        {products && products.length > 0 ? (
                          products.map((product) => (
                            <option key={product._id} value={product._id}>
                               {product.productName} ({product.productCode}) - {product.ProductDisplay}
                            </option>
                          ))
                        ) : (
                          <option>No products available</option>
                        )}
                      </select>
                    )}
                  </td>
                   {/*CHANGES MADE */}
                   <td>
                    {proformaType === "existing" ? (
                      <span>{line.quantity}</span>
                    ) : (
                      <input 
                      className="po-quantity-input"
                      type="number"
                      value={line.quantity || ""} // Allows placeholder to show when empty
                      onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                      min="1"
                      placeholder={`Quantity`} // Dynamic placeholder
                      required
                      />
                    )}
                  </td>
                  <td>
                    {proformaType === "existing" ? (
                      <span>{line.discount}</span>
                    ) : (
                      <input
  type="number"
  className="po-quantity-input"
  value={line.discount || ""}  // Shows placeholder when empty
  onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
  min="0"
  max={products.find(product => product._id === line.productId)?.maxDiscount || 100}
  placeholder={`Discount`}
  required
/>
                    )}
                  </td>
                  
{/*TO HERE - bugs free */}
                   {/* New DR Status Column */}
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

                  <td className="po-unit-price">{(line.unitPrice || 0).toFixed(2)}</td>
                  <td className="po-subtotal">{(line.subtotal || 0).toFixed(2)}</td>
                  {/* Conditionally render actions only for "new" proformaType */}
        {proformaType === "new" && (
          <td>
            <div class="icon-container-po">
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
