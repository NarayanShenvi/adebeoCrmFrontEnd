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
        quantity: item.quantity || 0,
        discount: item.discount || 0,
        subtotal: item.sub_total || 0,
        unitPrice: item.unit_price || 0,
        drStatus: item.dr_status || "",
      }));
  
      setInvoiceLines(quoteItems);
      updateTotal(quoteItems);
    }
  }, [selectedQuoteDetails]);

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
  
      const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
  
      const unitPrice = price;
      const subtotal = (unitPrice - validDiscount) * quantity;
  
      const newInvoiceLines = [...invoiceLines];
      newInvoiceLines[index].productId = productId;
      newInvoiceLines[index].unitPrice = unitPrice;
      newInvoiceLines[index].subtotal = subtotal;
  
      setInvoiceLines(newInvoiceLines);
      updateTotal(newInvoiceLines);
    }
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
      quantity: item.quantity || 0,
      discount: item.discount || 0,
      subtotal: item.sub_total || 0,
      unitPrice: item.unit_price || 0,
      drStatus: item.dr_status || "",
    }));
  
    setInvoiceLines(quoteItems);
    updateTotal(quoteItems);
  };

  const handleSubmitProformaInvoice = () => {
    console.log ("selected quote:",selectedQuoteDetails)
    const proformaInvoiceData = {
      customer_id: customerId,
      preformaTag: 'PROFORMA_INVOICE_TAG',
      quote_id: selectedQuoteDetails.quote_id, // Add selected quote_id here
      quote_tag: selectedQuoteDetails.quote_tag, // Add selected quote_tag here
      items: invoiceLines.map(line => ({
        description: line.description || "Sample Product",
        quantity: line.quantity,
        discount: line.discount,
        unit_price: line.unitPrice,
        sub_total: line.subtotal,
        dr_status: line.drStatus,
      })),
      gross_total: finalTotal,
    };
    dispatch(createPerforma(proformaInvoiceData));
  };


  const handlePageChange = (pageNumber) => {
    setCurrentPageState(pageNumber);
    dispatch(fetchPerformasAsync({ page: pageNumber }));
  };

  return (
    <div ref={sliderRef} className={`POinvoice-slider-overlay ${onClose ? "show" : ""}`}>
      <div className="POinvoice-slider-container">
        <div className="proforma-invoice-header">
          <h4>Create a New Proforma Invoice</h4>
          <MdOutlineCancel onClick={onClose} className="close-slider" title="Close" />
        </div>

        {/* Proforma Invoice Selection */}
        <div className="proforma-invoice-create-section">
          <div>
            <label>
              <input 
                type="radio" 
                value="new" 
                checked={proformaType === "new"} 
                onChange={() => setProformaType("new")}
              />
              New
            </label>
            <label>
              <input 
                type="radio" 
                value="existing" 
                checked={proformaType === "existing"} 
                onChange={() => setProformaType("existing")}
              />
              From Existing Quotes
            </label>
          </div>

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
                      {quote.quote_id && quote.quote_tag ? `${quote.quote_id} - ${quote.quote_tag}` : 'Unknown Quote'}
                    </option>
                  ))
                ) : (
                  <option>No quotes available</option>
                )}
              </select>
            </div>
        )}
          {/* Invoice Table for "New" Proforma */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Discount</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoiceLines.map((line, index) => (
                <tr key={line.description + index}>
                  <td>
                    {proformaType === "existing" ? (
                      <span>{line.description || "Unknown Product"}</span>
                    ) : (
                      <select value={line.productId} onChange={(e) => handleProductSelect(index, e.target.value)}>
                        <option value="" disabled>Select Product</option>
                        {products && products.length > 0 ? (
                          products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.ProductDisplay || "Unknown Product"}
                            </option>
                          ))
                        ) : (
                          <option>No products available</option>
                        )}
                      </select>
                    )}
                  </td>
                  <td>
                    {proformaType === "existing" ? (
                      <span>{line.quantity}</span>
                    ) : (
                      <input 
                        type="number" 
                        value={line.quantity} 
                        onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    {proformaType === "existing" ? (
                      <span>{line.discount}</span>
                    ) : (
                      <input 
                        type="number" 
                        value={line.discount} 
                        onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
                      />
                    )}
                  </td>
                  <td>{(line.unitPrice || 0).toFixed(2)}</td>
                  <td>{(line.subtotal || 0).toFixed(2)}</td>
                  <td>
                    {proformaType === "new" && (
                      <MdDelete 
                        onClick={() => handleDeleteProductRow(index)} 
                        className="delete-btn"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {proformaType === "new" && (
            <button onClick={handleAddProductRow}>Add Product</button>
          )}
        </div>

        <div className="totals-section">
          <div>
            <label>Total</label>
            <span>{total.toFixed(2)}</span>
          </div>
          <div>
            <label>Overall Discount</label>
            <input 
              type="number" 
              value={overallDiscount} 
              onChange={(e) => setOverallDiscount(parseFloat(e.target.value))}
              disabled={proformaType === "existing"}
            />
          </div>
          <div>
            <label>Tax</label>
            <span>{taxAmount.toFixed(2)}</span>
          </div>
          <div>
            <label>Final Total</label>
            <span>{finalTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleSubmitProformaInvoice} 
            disabled={loading || total === 0}
          >
            {loading ? <FaSpinner /> : 'Create Proforma Invoice'}
          </button>
        </div>

        {/* Available PO's Section (Empty Placeholder for now) */}
        <div className="available-pos-section">
  <h4>Previous Proforma's</h4>

  {/* Table to display Proformas */}
  <table>
    <thead>
      <tr>
        <th>Proforma Id</th>
        <th>Date</th>
        <th>Proforma Tag</th>
        <th>Price</th>
        <th>PDF Link</th>
      </tr>
    </thead>
    <tbody>
      {currentPerformas && currentPerformas.length > 0 ? (
        currentPerformas.map((invoice) => (
          <tr key={invoice.performa_number}>
            <td>{invoice.performa_number}</td>
            <td>{new Date(invoice.insertDate).toLocaleDateString()}</td>
            <td>{invoice.proforma_tag}</td>
            <td>
              {invoice.total_amount && !isNaN(invoice.total_amount)
                ? invoice.total_amount.toFixed(2)
                : "0.00"}
            </td>
            <td>
              <a href={invoice.pdf_filename} target="_blank" rel="noopener noreferrer">
                <FaFilePdf />
              </a>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5">No performas available for this page.</td>
        </tr>
      )}
    </tbody>
  </table>

  {/* Pagination Controls */}
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
</div>
</div>
</div>
  );
};

export default POInvoiceSlider;
