import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProductToEdit, updateProductAsync, fetchProductsAsync, addProductAsync } from '../redux/slices/productSlice';
import axios from "../config/apiConfig"; // Axios instance
import API from "../config/config"; // API URL
import { Form } from "react-bootstrap";//changed from here 
import { Row, Col } from 'react-bootstrap';
import { FaCheckToSlot } from "react-icons/fa6";
import { HiSave } from "react-icons/hi";
import { FaSpinner } from 'react-icons/fa';
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { HiSquaresPlus } from "react-icons/hi2";//to here

const ProductSection = () => {
  const dispatch = useDispatch();
  const { products, productToEdit, loading, error } = useSelector((state) => state.products);
  const successMessage = useSelector((state) => state.products?.successMessage || ''); // chenges --added just to check whether it works or not
  
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
    drStatus: '',  // ✅ Added this
    maxDiscount: '',
    prodisEnabled: false,
    subscriptionDuration: "1 Year", // Set default value here
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
        drStatus: '',  // ✅ Added this
        maxDiscount: '',
        prodisEnabled: false,
        subscriptionDuration: '1 Year', // ✅ Add default value here

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
<div className="product-section">
<h3>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
      
<div onClick={() => setMode(mode === 'add' ? 'edit' : 'add')}>
  {mode === 'add' ? (
    <BiSolidMessageSquareEdit title="Switch to Edit Products" className="toggle-icon-prod" />
  ) : (
    <HiSquaresPlus title="Switch to Add Products" className="toggle-icon-prod" />
  )}
</div>
{successMessage && <p className="success-prod">{successMessage}</p>}
      {error && <p className="error-prod">{error}</p>}

      {/* Show search input and dropdown if in Edit mode */}
      {mode === 'edit' && (
        <div>
          <input
            className='search-field-prod'
            type="text"
            placeholder="Search by Product Name"
            value={formData.productName}
            onChange={handleSearchChange}
          />
                      <div className='search-field1-prod'>
                      {loading ? (
                <p className='ProductsLoading'>Loading...</p>
              ) : searchResults.length > 0 ?  (
            <select onChange={handleSelectProduct} value={formData._id || ''}>
              <option value="" disabled>Select a product</option>
              {searchResults.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.productName} (Code: {product.productCode})
                </option>
              ))}
            </select>
            
          ) : (
            <p className='NoProductsFound'>No products found...</p>
          )}</div>
        </div>
      )}

      <Form onSubmit={handleSubmit}className='product-form'>
      <Row className="g-5">
      <Col md={6}>
      <Form.Group className="form-group-prod">
  <Form.Label className="required-label">Product Name:</Form.Label>
  <Form.Control
    type="text"
    name="productName"
    value={formData.productName}
    onChange={handleChange}
    disabled={mode === "edit"} // Disable editing in Edit mode
    placeholder='Enter product name'
    required
  />
</Form.Group>
</Col>
<Col md={6}>
<Form.Group className="form-group-prod">
          <Form.Label className="required-label">Address:</Form.Label>
        <Form.Control as="textarea" rows={1} placeholder="Enter address" 
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
        /> 
        </Form.Group>
        </Col>
        </Row>

        <Row className="g-5">
  <Col md={6}>
  <Form.Group className="form-group-prod"> 
     <Form.Label className="required-label">Product Code:</Form.Label>
  <Form.Control
    type="text"
    name="productCode"
    value={formData.productCode}
    onChange={handleChange}
    disabled={mode === "edit"} // Disable editing in Edit mode
    placeholder='Enter product code'
    required
  />
</Form.Group>
  </Col>
  <Col md={6}>
    {/* Nested row for Sub Area and Area with a smaller gap */}
    <Row className="g-2">
      <Col md={6}>
      <Form.Group className="form-group-prod">       
           <Form.Label>Sub Area:</Form.Label>
          <Form.Control
            type="text"
            name="primaryLocality"
            value={formData.primaryLocality}
            onChange={handleChange}
            placeholder='--Test Sub Area--'
            readOnly
            />
        </Form.Group>
      </Col>
      <Col md={6}>
      <Form.Group className="form-group-prod">      
            <Form.Label>Area:</Form.Label>
          <Form.Control
    type="text"
    name="secondaryLocality"
    value={formData.secondaryLocality}
    onChange={handleChange}
    placeholder='--Test Area--'
            readOnly
            />
        </Form.Group>
      </Col>
    </Row>
  </Col>
</Row>

      <Row className="g-5">
     <Col md={6}>
     <Form.Group className="form-group-prod">
        <Form.Label className="required-label">Product Display Name:</Form.Label>
  <Form.Control
    type="text"
    name="ProductDisplay"
    value={formData.ProductDisplay}
    onChange={handleChange}
    placeholder='Enter product display name'
    required
  />
</Form.Group>

     </Col>
   
     {/* Wrap City, State, and Pincode inside a nested Row with a smaller gap */}
     <Col md={6}>
       <Row className="g-2"> {/* Adjust g-1 to a smaller gap; try g-0, g-1, g-2 as needed */}
         <Col md={4}>
         <Form.Group className="form-group-prod">
            <Form.Label>City:</Form.Label>
  <Form.Control
    type="text"
    name="city"
    value={formData.city}
    onChange={handleChange}
    placeholder='--Test City--'
    readOnly
    />
</Form.Group>
         </Col>
         <Col md={4}>
         <Form.Group className="form-group-prod">
            <Form.Label>State:</Form.Label>
  <Form.Control
    type="text"
    name="state"
    value={formData.state}
    onChange={handleChange}
    placeholder='--Test State--'
    readOnly
    />
           </Form.Group>
         </Col>
         <Col md={4}>
         <Form.Group className="form-group-prod">
            <Form.Label>Pincode:</Form.Label>
  <Form.Control
    type="text"
    name="pincode"
    value={formData.pincode}
    onChange={handleChange}
    placeholder='--Test Pincode--'
    readOnly
    />
           </Form.Group>
         </Col>
       </Row>
     </Col>
   </Row>     
         <Row className="g-5">
          <Col md={6}>
            <Form.Group className="form-group-prod">
              <Form.Label className="required-label">Product Company Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="ProductCompanyName"
                  value={formData.ProductCompanyName}
                  onChange={handleChange}
                  placeholder='Enter product company name'
                  required
                      />
            </Form.Group>
          </Col>  
          <Col md={6}>
          <Form.Group className="form-group-prod">
                <Form.Label className="required-label">Sales Code:</Form.Label>
  <Form.Control
    type="text"
    name="salesCode"
    value={formData.salesCode}
    onChange={handleChange}
    placeholder='Enter sales code'
     required
  />
</Form.Group>

                </Col>
                </Row> 
        
   <Row className="g-5">   
           <Col md={6}>
           <Form.Group className="form-group-prod">
              <Form.Label className="required-label">Company GSTIN:</Form.Label>
  <Form.Control
    type="text"
    name="companyGstin"
    value={formData.companyGstin}
    onChange={handleChange}
    placeholder='Enter company GSTIN'
    required
  />
</Form.Group>

           </Col>
           <Col md={6}>
    {/* Nested row for Sub Area and Area with a smaller gap */}
    <Row className="g-2">
           <Col md={6}>
           <Form.Group className="form-group-prod">
  <Form.Label className="required-label">Purchase Cost:</Form.Label>
  <Form.Control
    type="number"
    name="purchaseCost"
    value={formData.purchaseCost || ""}
    onChange={(e) => {
      const value = e.target.value;
      if (value === "" || parseFloat(value) >= 0) {
        handleChange(e);
      }
    }}
    min="0" // Prevents negative values
    placeholder="Enter purchase cost"
    required
  />
</Form.Group>


           </Col>
           <Col md={6}>
           <Form.Group className="form-group-prod">
    <Form.Label className="required-label">Sales Cost:</Form.Label>
    <Form.Control
      type="number"
      name="salesCost"
      value={formData.salesCost || ""}
      onChange={(e) => {
        const value = e.target.value;
        if (value === "" || parseFloat(value) >= 0) {
          handleChange(e);
        }
      }}
      min="0" // Prevents negative values
      placeholder="Enter sales cost"
      required
    />
  </Form.Group>
</Col>
</Row>
</Col>
         </Row>     
         <Row className="g-5">   
                    <Col md={6}>
                    <Form.Group className="form-group-prod">
                       <Form.Label className="required-label">Email:</Form.Label>
           <Form.Control
             type="email"
             name="email"
             value={formData.email}
             onChange={handleChange}
         placeholder='Enter email address'
         required
           />
         </Form.Group>
         
                    </Col>
                    <Col md={6}>
                    <Form.Group className="form-group-prod">
  <Form.Label className="required-label">Max Discount:</Form.Label>
  <Form.Control
    type="number"
    name="maxDiscount"
    value={formData.maxDiscount || ""}
    onChange={(e) => {
      const value = e.target.value;
      if (value === "" || parseFloat(value) >= 0) {
        handleChange(e);
      }
    }}
    min="0" // Prevents negative values
    placeholder="Enter maximum discount"
    required
  />
</Form.Group>

                       {/* changed  dr status removed*/}
         
                    </Col>
                  </Row>     
                  <Row className="g-5"> 
                    <Col md={6}>
                    <Form.Group className="form-group-prod">
           <Form.Label className="required-label">Duration:</Form.Label>
           <div className="radio-group-prod">
             {["1 Month", "3 Months", "6 Months", "1 Year", "2 Years", "3 Years", "Perpetual"].map((duration) => (
               <div key={duration} className="radio-button-prod">
                 <input
                   type="radio"
                   id={`duration-${duration}`}
                   name="subscriptionDuration"
                   value={duration}
                   onChange={handleChange}
                   checked={formData.subscriptionDuration === duration}
                 />
                 <label htmlFor={`duration-${duration}`}>{duration}</label>
               </div>
             ))}
           </div>
         </Form.Group>
         
           </Col>
                  </Row> 
                  <Form.Group className="form-group-prod mt-4 custom-checkbox" controlId="productEnabled">
           <Form.Check
             type="checkbox"
             label="Product Enabled"
             name="prodisEnabled"
             checked={formData.prodisEnabled}
             onChange={handleChange}
         
           />
         </Form.Group>                  
          {/* changed up to here */}


        <button type="submit" disabled={loading} className="submit-button-prod">
          {loading ? (
            <>
              <FaSpinner className="spinner" size={20} title='Submitting...'/>
            </>
          ) : mode === 'edit' ? (
            <>
              <FaCheckToSlot size={24} title='Save Update'className='SaveUpdateProd'/>
            </>
          ) : (
            <>
              <HiSave  size={24} title='Save New Product...' className='NewProduct'/>
            </>
          )}
        </button>

      </Form>
      
      
    </div>
  );
};

export default ProductSection;
