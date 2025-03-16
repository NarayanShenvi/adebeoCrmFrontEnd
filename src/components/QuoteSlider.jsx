import React, { useState, useEffect, useRef } from 'react';//changes made
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineCancel } from "react-icons/md"; // Correct import changes made
import { fetchProductsAsync } from '../redux/slices/productSlice'; // Assuming you have this action set up
import { createQuote, fetchQuotesAsync } from '../redux/slices/quoteSlice';  // Import the createQuote and fetchQuotesAsync actions
import { MdAddBox, MdDelete  } from "react-icons/md";
import { FaSpinner, FaFilePdf } from 'react-icons/fa';
import {  FaChevronLeft, FaChevronRight } from "react-icons/fa"; //import statements are changed and some new imports are added

const QuoteSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products); // List of products from Redux
  const quoteState = useSelector((state) => state.quote); // Getting entire quote state
  const { loading, quotes, error, currentPage, totalPages,quoteCreationResponse } = quoteState || {}; // Safe destructuring

  const sliderRef = useRef(null); // Reference for the slider container changes made

  const [quoteLines, setQuoteLines] = useState([{
    productId: '',
    description:'',
    quantity: 1,
    discount: 0,
    subtotal: 0,
    unitPrice: 0,  // Initial salesCost as unitPrice
    drStatus: '', // Default status

  }]); // Initial line for quote
  const [total, setTotal] = useState(0);
  //changes
  const [overallDiscount, setOverallDiscount] = useState(0); // New state for overall discount
  const [finalTotal, setFinalTotal] = useState(0); // New state for final total
  const [taxAmount, setTaxAmount] = useState(0); // <-- ADD THIS to fix the issue

  // Pagination state for lower section
  const [currentPageState, setCurrentPageState] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page
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
    }
  }, [quoteCreationResponse]); // This will trigger when quoteCreationResponse updates
  

  const handleLineChange = (index, field, value) => {
    const newQuoteLines = [...quoteLines];
    newQuoteLines[index][field] = value;
  
    if (field === 'quantity' || field === 'discount') {
      const product = products.find(product => product._id === newQuoteLines[index].productId);
      if (product) {
        const quantity = parseInt(newQuoteLines[index].quantity, 10) || 1;
        let discount = parseFloat(newQuoteLines[index].discount) || 0;
        const price = parseFloat(product.salesCost) || 0;
        const description = product.ProductDisplay;
  
        const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
        newQuoteLines[index].discount = validDiscount;
  
        const unitPrice = price;
        const subtotal = (unitPrice - validDiscount) * quantity;
  
        newQuoteLines[index].unitPrice = unitPrice;
        newQuoteLines[index].subtotal = subtotal;
        newQuoteLines[index].description = description;
      }
    }
  
    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines);
  };
  
  
  const handleAddProductRow = () => {
    setQuoteLines([
      ...quoteLines,
      {
        productId: '',
        description:'',
        quantity: 1,
        discount: 0,
        subtotal: 0,
        unitPrice: 0,
        drStatus:'',
      },
    ]);
  };

  const handleProductSelect = (index, productId) => {
    const newQuoteLines = [...quoteLines];
    newQuoteLines[index].productId = productId;

    const product = products.find(product => product._id === productId);
    if (product) {
      const quantity = parseInt(newQuoteLines[index].quantity, 10) || 1;
      let discount = parseFloat(newQuoteLines[index].discount) || 0;
      const price = parseFloat(product.salesCost) || 0;
      const description = product.ProductDisplay || '';
      const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);

      const unitPrice = price;
      const subtotal = (unitPrice - validDiscount) * quantity;

      newQuoteLines[index].unitPrice = unitPrice;
      newQuoteLines[index].subtotal = subtotal;
      newQuoteLines[index].description = description;
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
  const discountValue = parseFloat(e.target.value) || 0;
  setOverallDiscount(discountValue);
  calculateFinalTotal(total, discountValue);
};

const calculateFinalTotal = (totalAmount, discount) => {
  const discountedTotal = Math.max(0, totalAmount - discount); // Ensure it doesn't go negative
  const tax = discountedTotal * 0.18; // 18% Tax
  setTaxAmount(tax);
  setFinalTotal(discountedTotal + tax);
};

  const handleDeleteProductRow = (index) => {
    const newQuoteLines = quoteLines.filter((_, i) => i !== index); // Remove the product row by index
    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines); // Recalculate total after removal
  };

  const indexOfLastQuote = currentPageState * itemsPerPage;
  const indexOfFirstQuote = indexOfLastQuote - itemsPerPage;
  const currentQuotes = Array.isArray(quotes) ? quotes.slice(indexOfFirstQuote, indexOfLastQuote) : [];

  const handlePageChange = (pageNumber) => {
    setCurrentPageState(pageNumber);
    dispatch(fetchQuotesAsync({ page: pageNumber }));
  };
//changes made to disable button
  const handleSubmitQuote = () => {
    console.log("🔹 handleSubmitQuote function triggered!");
  
    if (!customerId) {
      console.log("❌ No customer selected!");
      alert("❌ Please select a customer before submitting the quote.");
      return;
    }
  
    if (quoteLines.length === 0) {
      console.log("❌ No products added!");
      alert("❌ Please add at least one product.");
      return;
    }
  
    if (quoteLines.some(line => !line.productId)) {
      console.log("❌ Missing product in one or more lines!");
      alert("❌ Please select a product for each line.");
      return;
    }
  
    if (quoteLines.some(line => line.quantity <= 0)) {
      console.log("❌ Quantity cannot be zero or negative!");
      alert("❌ Please enter a valid quantity for all products.");
      return;
    }
  
    console.log("✅ All validations passed, submitting the quote...");
  
    const quoteData = {
      customer_id: customerId,
      quoteTag: `QUOTE_TAG-${quoteLines.map(line => line.productCode).join('-')}`, // Adding productCode to the quoteTag
      items: quoteLines.map(line => ({
        description: line.description,
        quantity: line.quantity,
        discount: line.discount,
        unit_price: line.unitPrice,
        sub_total: line.subtotal,
        dr_status: line.drStatus,
        product_id:line.productId
      })),
      gross_total: finalTotal,
    };
  
    console.log("📝 Dispatching createQuote action:", quoteData);
    dispatch(createQuote(quoteData));
  };
  
  

// Handle click outside to close slider chnages below
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        onClose(); // Close the slider
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (

<div ref={sliderRef}  className="quote-slider show">
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
              <div className="dropdown-container">
                <select
                  className="quote-select"
                  value={line.productId}
                  onChange={(e) => handleProductSelect(index, e.target.value)}
                  required
                >
                  <option value="" disabled>Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.productName} ({product.productCode}) - {product.ProductDisplay}
                    </option>
                  ))}
                </select>
              </div>

             <input
  type="number"
  className="quote-quantity-input"
  value={line.quantity || ""} // Allows placeholder to show when empty
  onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
  min="1"
  placeholder={`Quantity`} // Dynamic placeholder
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
                  <th>Quote Id</th>
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
                    <td>{quoteItem.quote_id}</td> {/* Display the quote ID */}
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




