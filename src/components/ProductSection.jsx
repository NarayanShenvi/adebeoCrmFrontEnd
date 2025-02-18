import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsAsync } from '../redux/slices/productSlice';  // The slice where the action is defined

const ProductionSection = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Function to handle button click and fetch products
  const handleLoadProducts = () => {
    dispatch(fetchProductsAsync());
    setIsDropdownVisible(true);
  };

  return (
    <div>
      <h1>Production Section</h1>
      <button onClick={handleLoadProducts}>
        {loading ? 'Loading...' : 'Show Products'}
      </button>

      {/* Show error message if there's an error */}
      {error && <div className="error">{error}</div>}

      {/* Show dropdown if isDropdownVisible is true */}
      {isDropdownVisible && !loading && !error && products.length > 0 && (
        <div className="dropdown">
          <ul>
            {products.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Show message if no products are available */}
      {isDropdownVisible && !loading && !error && products.length === 0 && (
        <div>No products available.</div>
      )}
    </div>
  );
};

export default ProductionSection;