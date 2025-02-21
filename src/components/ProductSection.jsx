import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProductToEdit, updateProductAsync, fetchProductsAsync, addProductAsync } from '../redux/slices/productSlice';
import axios from "../config/apiConfig"; // Axios instance
import API from "../config/config"; // API URL

const ProductSection = () => {
  const dispatch = useDispatch();
  const { products, productToEdit, loading, error } = useSelector((state) => state.products);
  
  const [mode, setMode] = useState('add');  // Mode: 'add' or 'edit'
  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    ProductDisplay: '',
    ProductCompanyName: '',
    Contact: '',
    address: '',
    companyGstin: '',
    primaryLocality: '',
    secondaryLocality: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    salesCode: '',
    purchaseCost: '',
    salesCost: '',
    maxDiscount: '',
    prodisEnabled: false,
  });
  
  const [searchResults, setSearchResults] = useState([]); // For holding search results

  // Effect to reset form if switching between add/edit modes
  useEffect(() => {
    if (mode === 'edit' && productToEdit) {
      setFormData(productToEdit);  // Set data for edit mode
    } else {
      setFormData({
        productName: '',
        productCode: '',
        ProductDisplay: '',
        ProductCompanyName: '',
        Contact: '',
        address: '',
        companyGstin: '',
        primaryLocality: '',
        secondaryLocality: '',
        city: '',
        state: '',
        pincode: '',
        email: '',
        salesCode: '',
        purchaseCost: '',
        salesCost: '',
        maxDiscount: '',
        prodisEnabled: false,
      });
    }
  }, [mode, productToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle search input change for productName
  const handleSearchChange = async (e) => {
    const searchTerm = e.target.value;
    setFormData({ ...formData, productName: searchTerm });

    if (searchTerm.length >= 3) {  // Start searching after 3 characters
      try {
        const response = await axios.get(`${API}/load_edit_adebeo_products`, {
          params: { productName: searchTerm }
        });
        setSearchResults(response.data.data); // Assuming response contains an array of products
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]); // Clear results if search term is too short
    }
  };

  const handleSelectProduct = (e) => {
    const selectedProduct = searchResults.find(product => product._id === e.target.value);
    setFormData({
      ...selectedProduct,  // Populate form with selected product's data
    });
    setSearchResults([]);  // Clear search results
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'edit') {
      dispatch(updateProductAsync(formData));  // Update product if in Edit mode
    } else {
      dispatch(addProductAsync(formData));  // Add new product if in Add mode
    }
  };

  return (
    <div>
      <h2>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
      
      <div>
        <button onClick={() => setMode('add')}>Add Mode</button>
        <button onClick={() => setMode('edit')}>Edit Mode</button>
      </div>

      {/* Show search input and dropdown if in Edit mode */}
      {mode === 'edit' && (
        <div>
          <input
            type="text"
            placeholder="Search by Product Name"
            value={formData.productName}
            onChange={handleSearchChange}
          />
          {searchResults.length > 0 && (
            <select onChange={handleSelectProduct} value={formData._id || ''}>
              <option value="" disabled>Select a product</option>
              {searchResults.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.productName} (Code: {product.productCode})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            disabled={mode === 'edit'}  // Disable editing productName in Edit mode
          />
        </div>
        <div>
          <label>Product Code:</label>
          <input
            type="text"
            name="productCode"
            value={formData.productCode}
            onChange={handleChange}
            disabled={mode === 'edit'}  // Disable editing productCode in Edit mode
          />
        </div>
        <div>
          <label>Product Display Name:</label>
          <input
            type="text"
            name="ProductDisplay"
            value={formData.ProductDisplay}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Product Company Name:</label>
          <input
            type="text"
            name="ProductCompanyName"
            value={formData.ProductCompanyName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Contact Person:</label>
          <input
            type="text"
            name="Contact"
            value={formData.Contact}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Company GSTIN:</label>
          <input
            type="text"
            name="companyGstin"
            value={formData.companyGstin}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Primary Locality:</label>
          <input
            type="text"
            name="primaryLocality"
            value={formData.primaryLocality}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Secondary Locality:</label>
          <input
            type="text"
            name="secondaryLocality"
            value={formData.secondaryLocality}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Pincode:</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Sales Code:</label>
          <input
            type="text"
            name="salesCode"
            value={formData.salesCode}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Purchase Cost:</label>
          <input
            type="number"
            name="purchaseCost"
            value={formData.purchaseCost}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Sales Cost:</label>
          <input
            type="number"
            name="salesCost"
            value={formData.salesCost}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Max Discount:</label>
          <input
            type="number"
            name="maxDiscount"
            value={formData.maxDiscount}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Product Enabled:</label>
          <input
            type="checkbox"
            name="prodisEnabled"
            checked={formData.prodisEnabled}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {mode === 'edit' ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ProductSection;
