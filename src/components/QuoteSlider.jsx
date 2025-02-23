// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProductsAsync } from '../redux/slices/productSlice'; // Assuming you have this action set up
// import { createQuote } from '../redux/slices/quoteSlice';  // Import the createQuote action

// const QuoteSlider = ({ customerId, onClose }) => {
//   const dispatch = useDispatch();
//   const { products } = useSelector((state) => state.products); // List of products from Redux
//   const quoteState = useSelector((state) => state.quote); // Getting entire quote state
//   const { loading, quote, error } = quoteState || { loading: false, quote: null, error: null }; // Safe destructuring

//   const [quoteLines, setQuoteLines] = useState([{
//     productId: '',
//     quantity: 1,
//     discount: 0,
//     subtotal: 0,
//     unitPrice: 0,  // Initial salesCost as unitPrice
//   }]); // Initial line for quote
//   const [total, setTotal] = useState(0);

//   // Pagination state for lower section (later to be filled in)
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5; // Number of items to display per page

//   useEffect(() => {
//     // Fetch products from the backend when the component mounts
//     dispatch(fetchProductsAsync()); 
//   }, [dispatch]);

//   // Function to update quantity or discount for each line item
//   const handleLineChange = (index, field, value) => {
//     const newQuoteLines = [...quoteLines];
//     newQuoteLines[index][field] = value;

//     if (field === 'quantity' || field === 'discount') {
//       const product = products.find(product => product._id === newQuoteLines[index].productId);
//       if (product) {
//         // Ensure valid values for quantity, discount, and price
//         const quantity = parseInt(newQuoteLines[index].quantity, 10) || 1; // Fallback to 1 if not valid
//         let discount = parseFloat(newQuoteLines[index].discount) || 0; // Fallback to 0 if not valid
//         const price = parseFloat(product.salesCost) || 0; // Fallback to 0 if price is invalid

//         // Ensure the discount doesn't exceed the product's allowed max discount
//         const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
//         newQuoteLines[index].discount = validDiscount;

//         // Calculate the unit price (initial sales cost) and subtotal (handling invalid price or quantity)
//         const unitPrice = price; // Unit price is the initial sales cost
//         const subtotal = (unitPrice - validDiscount) * quantity;  // Subtotal is (unitPrice - discount) * quantity

//         // Update line with calculated values
//         newQuoteLines[index].unitPrice = unitPrice;
//         newQuoteLines[index].subtotal = subtotal;
//       }
//     }

//     setQuoteLines(newQuoteLines);
//     updateTotal(newQuoteLines);
//   };

//   // Update total cost of all lines
//   const updateTotal = (lines) => {
//     const totalCost = lines.reduce((acc, line) => acc + line.subtotal, 0);
//     setTotal(totalCost);
//   };

//   // Function to add a new row for selecting another product
//   const handleAddProductRow = () => {
//     setQuoteLines([
//       ...quoteLines,
//       {
//         productId: '',
//         quantity: 1,
//         discount: 0,
//         subtotal: 0,
//         unitPrice: 0,
//       },
//     ]);
//   };

//   // Handle product selection
//   const handleProductSelect = (index, productId) => {
//     const newQuoteLines = [...quoteLines];
//     newQuoteLines[index].productId = productId;

//     const product = products.find(product => product._id === productId);
//     if (product) {
//       // Ensure valid values for price, discount, and quantity
//       const quantity = parseInt(newQuoteLines[index].quantity, 10) || 1; // Fallback to 1 if invalid
//       let discount = parseFloat(newQuoteLines[index].discount) || 0; // Fallback to 0 if invalid
//       const price = parseFloat(product.salesCost) || 0; // Fallback to 0 if invalid

//       // Ensure the discount doesn't exceed the product's allowed max discount
//       const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);

//       // Calculate the unit price and subtotal
//       const unitPrice = price; // Unit price is the initial sales cost
//       const subtotal = (unitPrice - validDiscount) * quantity;

//       newQuoteLines[index].unitPrice = unitPrice;
//       newQuoteLines[index].subtotal = subtotal;
//     }

//     setQuoteLines(newQuoteLines);
//     updateTotal(newQuoteLines);
//   };

//   // Function to delete a product row
//   const handleDeleteProductRow = (index) => {
//     const newQuoteLines = quoteLines.filter((_, i) => i !== index); // Remove the product row by index
//     setQuoteLines(newQuoteLines);
//     updateTotal(newQuoteLines); // Recalculate total after removal
//   };

//   // Pagination logic for lower section
//   const indexOfLastQuote = currentPage * itemsPerPage;
//   const indexOfFirstQuote = indexOfLastQuote - itemsPerPage;
//   const currentQuotes = quoteLines.slice(indexOfFirstQuote, indexOfLastQuote);

//   // Function to handle page change
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // Function to handle submit quote
//   // Function to handle submit quote
//   const handleSubmitQuote = () => {
//     const quoteData = {
//       customer_id: customerId,
//       quoteTag: 'QUOTE_TAG', // You can adjust this according to your needs
//       items: quoteLines.map(line => ({
//        // description: line.productDisplay, // Send ProductDisplay instead of productId
//        description: "Sample Product",
//         quantity: line.quantity,
//         discount: line.discount,
//         unit_price : line.unitPrice,
//         sub_total: line.subtotal,
//       })),
//       gross_total: total,
//     };

//     // Dispatch createQuote async action (assuming createQuote handles async logic)
//     dispatch(createQuote(quoteData));
//   }

//   return (
//     <div className="quote-slider">
//       <div className="quote-slider-content">
//         <div className="quote-header">
//           <h4>Create a New Quote</h4>
//           <button onClick={onClose} className="close-slider">Close</button>
//         </div>

//         <div className="quote-create-section">
//           <h5>Select Products</h5>
          
//           {/* Loop through the quote lines */}
//           {quoteLines.map((line, index) => (
//             <div key={index} className="quote-line">
//               <div className="dropdown-container">
//                 {/* Product Name Dropdown */}
//                 <select
//                   className="quote-select"
//                   value={line.productId}
//                   onChange={(e) => handleProductSelect(index, e.target.value)}
//                 >
//                   <option value="" disabled>Select a product</option>
//                   {products.map((product) => (
//                     <option key={product._id} value={product._id}>
//                       {product.productName} ({product.productCode}) {/* Displaying Product Name with Code */}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Quantity */}
//               <input
//                 type="number"
//                 className="quote-quantity-input"
//                 value={line.quantity}
//                 onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
//                 min="1"
//               />

//               {/* Discount */}
//               <input
//                 type="number"
//                 step="0.01"  // Allow decimal discount input
//                 className="quote-discount-input"
//                 value={line.discount}
//                 onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
//                 min="0"
//                 max={products.find(product => product._id === line.productId)?.maxDiscount || 100} // max discount from product
//               />

//               {/* Unit Price */}
//               <span className="quote-unit-price">Unit Price: ${line.unitPrice.toFixed(2)}</span> {/* Display Unit Price */}
              
//               {/* Subtotal */}
//               <span className="quote-subtotal">Subtotal: ${line.subtotal.toFixed(2)}</span> {/* Display formatted subtotal */}

//               {/* Delete Product Button */}
//               <button
//                 className="quote-delete-line-btn"
//                 onClick={() => handleDeleteProductRow(index)}
//               >
//                 Delete
//               </button>

//               {/* Add New Row Button */}
//               {index === quoteLines.length - 1 && (
//                 <button
//                   className="quote-add-line-btn"
//                   onClick={handleAddProductRow}
//                 >
//                   Add Product
//                 </button>
//               )}
//             </div>
//           ))}

//           <div className="quote-total">
//             <strong>Total: ${total.toFixed(2)}</strong> {/* Display formatted total */}
//           </div>

//           <button
//             className="quote-submit-btn"
//             onClick={handleSubmitQuote}
//             disabled={loading} // Disable the button while the request is in progress
//           >
//             {loading ? 'Submitting...' : 'Submit Quote'}
//           </button>
//         </div>

//         {/* Lower Section: Created Quote (Placeholder for now) */}
//         <div className="quote-created-section">
//           <h5>Created Quote</h5>
//           <p>Displaying quotes with pagination (this section will be filled in later).</p>

//           {/* Pagination controls */}
//           <div className="pagination-controls">
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </button>
//             <span>Page {currentPage}</span>
//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage * itemsPerPage >= quoteLines.length}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuoteSlider;

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAsync } from '../redux/slices/productSlice'; // Assuming you have this action set up
import { createQuote, fetchQuotesAsync } from '../redux/slices/quoteSlice';  // Import the createQuote and fetchQuotesAsync actions

const QuoteSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products); // List of products from Redux
  const quoteState = useSelector((state) => state.quote); // Getting entire quote state
  const { loading, quotes, error, currentPage, totalPages } = quoteState || {}; // Safe destructuring
  
  const [quoteLines, setQuoteLines] = useState([{
    productId: '',
    quantity: 1,
    discount: 0,
    subtotal: 0,
    unitPrice: 0,  // Initial salesCost as unitPrice
  }]); // Initial line for quote
  const [total, setTotal] = useState(0);

  // Pagination state for lower section
  const [currentPageState, setCurrentPageState] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page

  useEffect(() => {
    // Fetch products from the backend when the component mounts
    dispatch(fetchProductsAsync()); 
    // Fetch quotes on page load
    dispatch(fetchQuotesAsync({ page: currentPageState }));
  }, [dispatch, currentPageState]);

  const handleLineChange = (index, field, value) => {
    const newQuoteLines = [...quoteLines];
    newQuoteLines[index][field] = value;

    if (field === 'quantity' || field === 'discount') {
      const product = products.find(product => product._id === newQuoteLines[index].productId);
      if (product) {
        const quantity = parseInt(newQuoteLines[index].quantity, 10) || 1;
        let discount = parseFloat(newQuoteLines[index].discount) || 0;
        const price = parseFloat(product.salesCost) || 0;

        const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
        newQuoteLines[index].discount = validDiscount;

        const unitPrice = price;
        const subtotal = (unitPrice - validDiscount) * quantity;

        newQuoteLines[index].unitPrice = unitPrice;
        newQuoteLines[index].subtotal = subtotal;
      }
    }

    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines);
  };

  const updateTotal = (lines) => {
    const totalCost = lines.reduce((acc, line) => acc + line.subtotal, 0);
    setTotal(totalCost);
  };

  const handleAddProductRow = () => {
    setQuoteLines([
      ...quoteLines,
      {
        productId: '',
        quantity: 1,
        discount: 0,
        subtotal: 0,
        unitPrice: 0,
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

      const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);

      const unitPrice = price;
      const subtotal = (unitPrice - validDiscount) * quantity;

      newQuoteLines[index].unitPrice = unitPrice;
      newQuoteLines[index].subtotal = subtotal;
    }

    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines);
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

  const handleSubmitQuote = () => {
    const quoteData = {
      customer_id: customerId,
      quoteTag: 'QUOTE_TAG',
      items: quoteLines.map(line => ({
        description: "Sample Product", // Placeholder for actual product description
        quantity: line.quantity,
        discount: line.discount,
        unit_price: line.unitPrice,
        sub_total: line.subtotal,
      })),
      gross_total: total,
    };

    dispatch(createQuote(quoteData));
  };

  return (
    <div className="quote-slider">
      <div className="quote-slider-content">
        <div className="quote-header">
          <h4>Create a New Quote</h4>
          <button onClick={onClose} className="close-slider">Close</button>
        </div>

        {/* Quote Creation Section */}
        <div className="quote-create-section">
          <h5>Select Products</h5>
          {quoteLines.map((line, index) => (
            <div key={index} className="quote-line">
              <div className="dropdown-container">
                <select
                  className="quote-select"
                  value={line.productId}
                  onChange={(e) => handleProductSelect(index, e.target.value)}
                >
                  <option value="" disabled>Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.productName} ({product.productCode})
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="number"
                className="quote-quantity-input"
                value={line.quantity}
                onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                min="1"
              />

              <input
                type="number"
                step="0.01"
                className="quote-discount-input"
                value={line.discount}
                onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
                min="0"
                max={products.find(product => product._id === line.productId)?.maxDiscount || 100}
              />

              <span className="quote-unit-price">Unit Price: ${line.unitPrice.toFixed(2)}</span>
              <span className="quote-subtotal">Subtotal: ${line.subtotal.toFixed(2)}</span>

              <button
                className="quote-delete-line-btn"
                onClick={() => handleDeleteProductRow(index)}
              >
                Delete
              </button>

              {index === quoteLines.length - 1 && (
                <button
                  className="quote-add-line-btn"
                  onClick={handleAddProductRow}
                >
                  Add Product
                </button>
              )}
            </div>
          ))}

          <div className="quote-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>

          <button
            className="quote-submit-btn"
            onClick={handleSubmitQuote}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Quote'}
          </button>
        </div>

        {/* Quote Display Section (Created Quotes as Table) */}
        <div className="quote-created-section">
          <h5>Created Quotes</h5>
          {quotes.length === 0 ? (
            <p>No quotes available</p>
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
                      ${quoteItem.total_price && !isNaN(quoteItem.total_price)
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
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPageState - 1)}
              disabled={currentPageState === 1}
            >
              Previous
            </button>
            <span>Page {currentPageState} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPageState + 1)}
              disabled={currentPageState === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSlider;




