import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAsync } from '../redux/slices/productSlice'; // Assuming you have this action set up

const QuoteSlider = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products); // List of products from Redux

  const [quoteLines, setQuoteLines] = useState([{
    productId: '',
    quantity: 1,
    discount: 0,
    subtotal: 0,
    unitPrice: 0,  // Initial salesCost as unitPrice
  }]); // Initial line for quote
  const [total, setTotal] = useState(0);

  // Pagination state for lower section (later to be filled in)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page

  useEffect(() => {
    // Fetch products from the backend when the component mounts
    dispatch(fetchProductsAsync()); 
  }, [dispatch]);

  // Function to update quantity or discount for each line item
  const handleLineChange = (index, field, value) => {
    const newQuoteLines = [...quoteLines];
    newQuoteLines[index][field] = value;

    if (field === 'quantity' || field === 'discount') {
      const product = products.find(product => product._id === newQuoteLines[index].productId);
      if (product) {
        // Ensure valid values for quantity, discount, and price
        const quantity = parseInt(newQuoteLines[index].quantity, 10) || 1; // Fallback to 1 if not valid
        let discount = parseFloat(newQuoteLines[index].discount) || 0; // Fallback to 0 if not valid
        const price = parseFloat(product.salesCost) || 0; // Fallback to 0 if price is invalid

        // Ensure the discount doesn't exceed the product's allowed max discount
        const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);
        newQuoteLines[index].discount = validDiscount;

        // Calculate the unit price (initial sales cost) and subtotal (handling invalid price or quantity)
        const unitPrice = price; // Unit price is the initial sales cost
        const subtotal = (unitPrice - validDiscount) * quantity;  // Subtotal is (unitPrice - discount) * quantity

        // Update line with calculated values
        newQuoteLines[index].unitPrice = unitPrice;
        newQuoteLines[index].subtotal = subtotal;
      }
    }

    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines);
  };

  // Update total cost of all lines
  const updateTotal = (lines) => {
    const totalCost = lines.reduce((acc, line) => acc + line.subtotal, 0);
    setTotal(totalCost);
  };

  // Function to add a new row for selecting another product
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

  // Handle product selection
  const handleProductSelect = (index, productId) => {
    const newQuoteLines = [...quoteLines];
    newQuoteLines[index].productId = productId;

    const product = products.find(product => product._id === productId);
    if (product) {
      // Ensure valid values for price, discount, and quantity
      const quantity = parseInt(newQuoteLines[index].quantity, 10) || 1; // Fallback to 1 if invalid
      let discount = parseFloat(newQuoteLines[index].discount) || 0; // Fallback to 0 if invalid
      const price = parseFloat(product.salesCost) || 0; // Fallback to 0 if invalid

      // Ensure the discount doesn't exceed the product's allowed max discount
      const validDiscount = Math.min(discount, parseFloat(product.maxDiscount) || 100);

      // Calculate the unit price and subtotal
      const unitPrice = price; // Unit price is the initial sales cost
      const subtotal = (unitPrice - validDiscount) * quantity;

      newQuoteLines[index].unitPrice = unitPrice;
      newQuoteLines[index].subtotal = subtotal;
    }

    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines);
  };

  // Function to delete a product row
  const handleDeleteProductRow = (index) => {
    const newQuoteLines = quoteLines.filter((_, i) => i !== index); // Remove the product row by index
    setQuoteLines(newQuoteLines);
    updateTotal(newQuoteLines); // Recalculate total after removal
  };

  // Pagination logic for lower section
  const indexOfLastQuote = currentPage * itemsPerPage;
  const indexOfFirstQuote = indexOfLastQuote - itemsPerPage;
  const currentQuotes = quoteLines.slice(indexOfFirstQuote, indexOfLastQuote);

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="quote-slider">
      <div className="quote-slider-content">
        <div className="quote-header">
          <h4>Create a New Quote</h4>
          <button onClick={onClose} className="close-slider">Close</button>
        </div>

        <div className="quote-create-section">
          <h5>Select Products</h5>
          
          {/* Loop through the quote lines */}
          {quoteLines.map((line, index) => (
            <div key={index} className="quote-line">
              <div className="dropdown-container">
                {/* Product Name Dropdown */}
                <select
                  className="quote-select"
                  value={line.productId}
                  onChange={(e) => handleProductSelect(index, e.target.value)}
                >
                  <option value="" disabled>Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.productName} ({product.productCode}) {/* Displaying Product Name with Code */}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <input
                type="number"
                className="quote-quantity-input"
                value={line.quantity}
                onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                min="1"
              />

              {/* Discount */}
              <input
                type="number"
                step="0.01"  // Allow decimal discount input
                className="quote-discount-input"
                value={line.discount}
                onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
                min="0"
                max={products.find(product => product._id === line.productId)?.maxDiscount || 100} // max discount from product
              />

              {/* Unit Price */}
              <span className="quote-unit-price">Unit Price: ${line.unitPrice.toFixed(2)}</span> {/* Display Unit Price */}
              
              {/* Subtotal */}
              <span className="quote-subtotal">Subtotal: ${line.subtotal.toFixed(2)}</span> {/* Display formatted subtotal */}

              {/* Delete Product Button */}
              <button
                className="quote-delete-line-btn"
                onClick={() => handleDeleteProductRow(index)}
              >
                Delete
              </button>

              {/* Add New Row Button */}
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
            <strong>Total: ${total.toFixed(2)}</strong> {/* Display formatted total */}
          </div>

          <button className="quote-submit-btn">Submit Quote</button>
        </div>

        {/* Lower Section: Created Quote (Placeholder for now) */}
        <div className="quote-created-section">
          <h5>Created Quote</h5>
          <p>Displaying quotes with pagination (this section will be filled in later).</p>

          {/* Pagination controls */}
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= quoteLines.length}
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
