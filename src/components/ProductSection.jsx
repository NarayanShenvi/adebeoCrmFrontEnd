import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { MdAddBox, MdDelete  } from "react-icons/md";
import { fetchCategoriesAsync } from '../redux/slices/addProductCategoy';
import Select from 'react-select';
import {
  addComboProductAsync,
  fetchComboProductsAsync,
  updateComboProductAsync
} from '../redux/slices/productSlice';


const ProductSection = () => {
  const dispatch = useDispatch();
  const { products, productToEdit, loading, error } = useSelector((state) => state.products);
  const successMessage = useSelector((state) => state.products?.successMessage || ''); // chenges --added just to check whether it works or not
  const [mode, setMode] = useState('add');
  const [isCombo, setIsCombo] = useState(false);
const [comboProducts, setComboProducts] = useState([
  { name: '', quantity: 1 }
]); 
const [selectedCategory, setSelectedCategory] = useState('');
 const [productList, setProductList] = useState([]);  const [formData, setFormData] = useState({
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
  drStatus: '',
  maxDiscount: '',
  type: "product",           // ✅ new backend field
  prodisEnabled: false,
  subscriptionDuration: "1 Year",
  showCostFields: false,
  categoryCode: selectedCategory || "", // single string
  isUSD: false,               // ✅ new backend field
  priceUSD: 0,               // ✅ new backend field
  priceINR: 0,               // ✅ new backend field
});

  
  const [searchResults, setSearchResults] = useState([]); // For holding search results
  const [singleFormData, setSingleFormData] = useState({
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
  drStatus: '',
  maxDiscount: '',
  type: "product",            // ✅ new backend field
  prodisEnabled: false,
  subscriptionDuration: "1 Year",
  showCostFields: false,
  categoryCode: selectedCategory || "", // single string
  isUSD: false,               // ✅ new backend field
 priceUSD: 0,               // ✅ new backend field
  priceINR: 0,               // ✅ new backend field
});


  
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
  drStatus: '',
  maxDiscount: '',
  type: "product",            // ✅ new backend field
  prodisEnabled: false,
  subscriptionDuration: "1 Year",
  showCostFields: false,
  categoryCode: selectedCategory || "", // single string
  isUSD: false,               // ✅ new backend field
priceUSD: 0,               // ✅ new backend field
  priceINR: 0,               // ✅ new backend field

      });
    }
  }, [mode, productToEdit]);
 
  const [loadingCategories, setLoadingCategories] = useState(false);
const [errorCategories, setErrorCategories] = useState('');

 const [categories, setCategories] = useState([]);

  useEffect(() => {
    // fetch all categories once
    axios.get(`${API}/getAllCategories`)
      .then(res => setCategories(res.data || []))
      .catch(err => console.error(err));
  }, []);



  useEffect(() => {
    if (isCombo) {
      axios.get(`${API}/load_edit_adebeo_products`).then(res => {
        setProductList(res.data.data || []);
      }).catch(err => console.error("Failed to fetch product list", err));
    }
  }, [isCombo]);

 useEffect(() => {
  if (isCombo) {
    const total = comboProducts.reduce(
      (acc, item) =>
        acc + (parseFloat(item.salesCost || 0) * parseFloat(item.quantity || 0)),
      0
    );

    setFormData((prev) => ({
      ...prev,
      salesCost: total.toFixed(2),
    }));
  }
}, [comboProducts, isCombo]);
 
useEffect(() => {
  dispatch(fetchCategoriesAsync());
}, [dispatch]);


useEffect(() => {
  dispatch(fetchCategoriesAsync());
}, [dispatch]);

const handleComboChange = (index, field, value) => {
  const updated = [...comboProducts];

  if (field === 'name') {
    const selected = productList.find(prod => prod._id === value);
    if (selected) {
      updated[index] = {
        ...updated[index],
        name: selected._id,   // for display in dropdown
        displayName: selected.productName,  // optional, for display elsewhere
      productId: selected._id,      // backend requires
        salesCost: parseFloat(selected.salesCost || 0),
        quantity: updated[index].quantity || 1,
      };
    }
  } else if (field === 'quantity') {
    updated[index][field] = parseInt(value) || 0;
  }

  setComboProducts(updated);

  // Update total salesCost
  const total = updated.reduce(
    (acc, item) => acc + (parseFloat(item.salesCost || 0) * parseInt(item.quantity || 1)),
    0
  );

  setFormData(prev => ({
    ...prev,
    salesCost: total.toFixed(2),
  }));
};

  const addComboRow = () => setComboProducts([...comboProducts, { name: '', quantity: 1 }]);
  const removeComboRow = (index) => {
    const updated = comboProducts.filter((_, i) => i !== index);
    setComboProducts(updated);
    setFormData(prev => ({
      ...prev,
      productName: JSON.stringify(updated)
    }));
  };

  const handleChange = (e) => {
  console.log("handleChange:", e.target.name, e.target.value);
  setFormData((prevData) => ({
    ...prevData,
    [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));
};


  const handleCostChange  = (e) => {
    const { name, value, type, checked } = e.target;
  
    if ((name === "priceUSD" || name === "priceINR") && (parseInt(value) < 1 || isNaN(value))) {
      return; // Don't update state if value is less than 1
    }
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  // Handle search input change for productName
  
const [searchTerm, setSearchTerm] = useState("");
const handleSearchChange = async (e) => {
  const term = e.target.value;

  if (term.length < 3) {
    setSearchResults([]);
    return;
  }

  try {
    if (!isCombo) {
      const response = await axios.get(`${API}/load_edit_adebeo_products`, {
        params: { productName: term },
      });
      setSearchResults(response.data.data || []);
    } else {
      const token = localStorage.getItem("Access_Token");
      const response = await axios.get(`${API}/getComboProducts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { name: term },
      });
      setSearchResults(response.data.data || []);
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    setSearchResults([]);
  }
};

const handleSelectProduct = (e) => {
  const selectedId = e.target.value;

  const selectedProduct = searchResults.find(
    (p) => (!isCombo ? p._id === selectedId : p.comboCode === selectedId)
  );

  if (!selectedProduct) return;

  if (!isCombo) {
    // Single product populate
    setFormData({
      ...formData,
      ...selectedProduct,
    });
  } else {
    // Combo product populate with proper nesting
    const comboObj = {
      comboCode: selectedProduct.comboCode,
      comboDisplayName: selectedProduct.comboDisplayName,
      salesCode: selectedProduct.salesCode,
      salesCost: parseFloat(selectedProduct.salesCost) || 0,
      maxDiscount: parseFloat(selectedProduct.maxDiscount) || 0,
      products: selectedProduct.products.map((p) => ({
        productId: p.productId,
        productCode: p.productCode,
        productName: p.productName,
        quantity: p.quantity,
        salesCost: parseFloat(p.salesCost || 0),
      })),
    };

    setFormData({
      ...formData,
      productName: selectedProduct.comboDisplayName, // display in input
      productCode: selectedProduct.comboCode,
      salesCode: selectedProduct.salesCode,
      salesCost: parseFloat(selectedProduct.salesCost) || 0,
      maxDiscount: parseFloat(selectedProduct.maxDiscount) || 0,
      comboProducts: [comboObj], // ✅ full combo with nested products
    });
  }

  setSearchResults([]);
};


const handleSubmit = async (e) => {
  e.preventDefault();

  if (mode === 'edit') {
    const payload = {
      ...formData,
      categoryCode: selectedCategory || "",
    };
    dispatch(updateProductAsync(payload));
  } else {
    if (!isCombo) {
      // keep single product logic exactly as is
      const payload = {
        ...formData,
        categoryCode: selectedCategory || "",
      };
      dispatch(addProductAsync(payload));
    } else { // Combo product
  const payload = {
    comboCode: formData.productCode,
    comboDisplayName: formData.ProductDisplay || formData.productName,
    salesCode: formData.salesCode,
    salesCost: parseFloat(formData.salesCost) || 0,
    maxDiscount: parseFloat(formData.maxDiscount) || 0,
    products: comboProducts.map(p => ({
      productCode: p.name,
      productId: p.productId,
      quantity: p.quantity,
      salesCost: parseFloat(p.salesCost || 0)
    }))
  };
   // Clear form & combo list after submit
        setFormData({
          productCode: "",
          productName: "",
          ProductDisplay: "",
          salesCode: "",
          salesCost: "",
          maxDiscount: "",
        });
        setComboProducts([{ name: "", productId: "", quantity: 1, salesCost: 0 }]);
  const result = await dispatch(addComboProductAsync(payload));

  if (result?.message) {
    alert(result.message); // e.g. "Combo product created successfully"
  } else if (result?.error) {
    alert(result.error); // e.g. "ComboCode already exists"
  }
}

  }
};


  return (
<div className="product-section">
<h3>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
      
<div
  onClick={() => {
    if (mode === 'add') {
      // ✅ Switching to Edit Mode
      setMode('edit');
      setComboProducts([{ name: '', quantity: 1 }]); // Clear combo inputs
     
    } else {
      // ✅ Switching to Add Mode
      setMode('add');
      setComboProducts([{ name: '', quantity: 1 }]); // Clear combo inputs
      
    }
  }}
>
  {mode === 'add' ? (
    <BiSolidMessageSquareEdit title="Switch to Edit Products" className="toggle-icon-prod" />
  ) : (
    <HiSquaresPlus title="Switch to Add Products" className="toggle-icon-prod" />
  )}
</div>


<div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
  {/* Single / Combo product */}
  <div className="radio-prod">
    <label>
      <input
        type="radio"
        checked={!isCombo}
        onChange={() => {
          setIsCombo(false);
          setFormData(singleFormData);
        }}
      />{" "}
      Single Product
    </label>
    <label style={{ marginLeft: "10px" }}>
      <input
        type="radio"
        checked={isCombo}
        onChange={() => {
          setSingleFormData(formData);
          setIsCombo(true);
          setFormData({
            productName: "",
            productCode: "",
            ProductDisplay: "",
            ProductCompanyName: "",
            Contact: "",
            address: "",
            companyGstin: "",
            primaryLocality: "",
            secondaryLocality: "",
            city: "",
            state: "",
            pincode: "",
            email: "",
            salesCode: "",
            purchaseCost: "",
            salesCost: "",
            drStatus: "",
            maxDiscount: "",
            type: "product",
            prodisEnabled: false,
            subscriptionDuration: "1 Year",
            showCostFields: false,
            isUSD: false,               // ✅ new backend field
            priceUSD: 0,               // ✅ new backend field
            priceINR: 0,               // ✅ new backend field
  categoryCode: selectedCategory || "", // single string
          });
        }}
      />{" "}
      Combo Product
    </label>
  </div>

  {/* Product / Service type */}
  {!isCombo && (
    <div>
      <Form.Group className="crm-type-radio-type">
        <Form.Label >Type:</Form.Label>
        <Form.Check
          inline
          type="radio"
          id="type-product"
          name="type"
          label="Product"
          value="product"
          checked={formData.type === "product"}
          onChange={handleChange}
        />
        <Form.Check
          inline
          type="radio"
          id="type-service"
          name="type"
          label="Service"
          value="service"
          checked={formData.type === "service"}
          onChange={handleChange}
        />
      </Form.Group>
    </div>
  )}
</div>

{successMessage && <p className="success-prod">{successMessage}</p>}
      {error && <p className="error-prod">{error}</p>}

      {/* Show search input and dropdown if in Edit mode */}
      {mode === 'edit' && (
  <div>
    <input
  className="search-field-prod"
  type="text"
  placeholder={isCombo ? "Search by Combo Product Name" : "Search by Product Name"}
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    handleSearchChange(e);
  }}
/>

    <div className="search-field1-prod">
      {loading ? (
        <p className="ProductsLoading">Loading...</p>
      ) : searchResults.length > 0 ? (
       <select
  onChange={handleSelectProduct}
  value={!isCombo ? formData._id || "" : ""}
>
  <option value="" disabled>
    {isCombo ? "Select a combo product" : "Select a product"}
  </option>
  {searchResults.map((product) => (
    <option
      key={!isCombo ? product._id : product.comboCode}
      value={!isCombo ? product._id : product.comboCode}
    >
      {isCombo
        ? `${product.comboDisplayName} (Code: ${product.comboCode})`
        : `${product.productName} (Code: ${product.productCode})`}
    </option>
  ))}
</select>


      ) : (
        <p className="NoProductsFound">No products found...</p>
      )}
    </div>
  </div>
)}



      <Form onSubmit={handleSubmit}className='product-form'>
        {!isCombo && (
    <>
      {/* ----------- FULL ORIGINAL FORM (EXACTLY AS YOU HAD) ----------- */}
       <Row className="g-5">
    <Col md={6}>
      <Form.Group className="form-group-prod">
        <Form.Label className="required-label">Product Name:</Form.Label>

        {!isCombo ? (
          <Form.Control
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            disabled={mode === "edit"}
            placeholder="Enter product name"
            required
          />
        ) : (
          <div>
            {comboProducts.map((item, idx) => (
              <div key={idx} className="d-flex gap-2 align-items-center mb-1">
                <select
                  disabled={mode === "edit"}
                  className="form-control"
                  value={item.name}
                  onChange={e => handleComboChange(idx, 'name', e.target.value)}
                >
                  <option value="">Select Product</option>
                  {productList.map((product) => {
                    const alreadySelected = comboProducts.some(
                      (row, i) => i !== idx && row.name === product._id
                    );
                    return (
                      <option
                        key={product._id}
                        value={product._id}
                        disabled={alreadySelected}
                      >
                        {product.productName}
                      </option>
                    );
                  })}
                </select>

                <input
                  type="number"
                  disabled={mode === "edit"}
                  className="form-control w-25"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => handleComboChange(idx, 'quantity', e.target.value)}
                />

                <MdAddBox
                  className={`add-prod ${mode === 'edit' ? 'disabled-icon' : ''}`}
                  size={20}
                  onClick={mode === 'edit' ? undefined : addComboRow}
                  title={mode === 'edit' ? "Disabled in Edit Mode" : "Add Product"}
                  style={{
                    cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
                    opacity: mode === 'edit' ? 0.5 : 1
                  }}
                />

                <MdDelete
                  className={`delete-prod ${mode === 'edit' ? 'disabled-icon' : ''}`}
                  size={20}
                  onClick={mode === 'edit' ? undefined : () => removeComboRow(idx)}
                  title={mode === 'edit' ? "Disabled in Edit Mode" : "Delete Product"}
                  style={{
                    cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
                    opacity: mode === 'edit' ? 0.5 : 1
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Form.Group>

      {/* ✅ Product Category Dropdown - only shown when not a combo */}
      {!isCombo && (
       <Form.Group className="form-group-prod mt-3">
  <Form.Label className="required-label">Choose Category</Form.Label>
  {loadingCategories ? (
  <p>Loading Categories...</p>
) : errorCategories ? (
  <p style={{ color: 'red' }}>{errorCategories}</p>
) :(
    <Form.Control
      as="select"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
    >
      <option value="">Select a category</option>
      {categories.map((cat) => (
        <option key={cat.Category_Code} value={cat.Category_Code}>
          {cat.Category_Name}
        </option>
      ))}
    </Form.Control>
  )}
</Form.Group>



      )}
    </Col>

    <Col md={6}>
      <Form.Group className="form-group-prod">
        <Form.Label className="required-label">Address:</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          placeholder="Enter address"
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
  <Form.Group>
  <Form.Control
    type="number"
    name="purchaseCost"
    value={formData.purchaseCost ?? ""}
    onChange={(e) => handleChange(e)}
    placeholder="Enter purchase cost"
    required
    min={0}
    step="0.01"
  />
</Form.Group>

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
        setFormData((prev) => ({ ...prev, salesCost: value }));
      }
    }}
    min="0"
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
        placeholder="Enter email address"
        required
      />
    </Form.Group>
  </Col>

  <Col md={6}>
        <Form.Group className="form-group-prod">
          <Form.Label className="required-label">Max Discount:</Form.Label>
          <Form.Group>
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
              min="0"
              placeholder="Enter maximum discount"
              required
            />
          </Form.Group>
        </Form.Group>
      </Col>
</Row>
                  <Row className="g-5 align-items-end">
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

      <Col md={6}>
        <Form.Group className="form-group-prod">
          <Form.Check
            className="custom1-checkbox"
            type="checkbox"
            id="show-cost-fields"
            label="Apply USD"
            name="isUSD"
            checked={formData.isUSD}
            onChange={handleChange}
            
          />
          {formData.isUSD && (
  <div className="d-flex gap-2 mt-2">
    <Form.Control 
  type="number"
  placeholder="Price in USD"
  name="priceUSD"
  value={formData.priceUSD === 0 && formData.isUSD ? "" : formData.priceUSD}
  onChange={handleCostChange}
  min="1"
/>

<Form.Control
  type="number"
  placeholder="INR Equivalent"
  name="priceINR"
  value={formData.priceINR === 0 && formData.isUSD ? "" : formData.priceINR}
  onChange={handleCostChange}
  min="1"
/>

  </div>
)}
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
 </>
  )}
   {isCombo && (
    <>
      {/* ----------- COMBO FIELDS ONLY ----------- */}

      <Row className="g-5">
         {/* Multi-select products with quantity */}
        <Col md={6}>
          <Form.Group className="form-group-prod">
            <Form.Label>Combo Products:</Form.Label>
            {comboProducts.map((item, idx) => (
              <div key={idx} className="d-flex gap-2 align-items-center mb-1">
                <select
  disabled={mode === "edit"}
  className="form-control"
  value={item.name}       // now this is the _id, matching option.value
  onChange={(e) => handleComboChange(idx, "name", e.target.value)}
>
  <option value="">Select Product</option>
  {productList.map(product => {
    const alreadySelected = comboProducts.some(
      (row, i) => i !== idx && row.name === product._id
    );
    return (
      <option key={product._id} value={product._id} disabled={alreadySelected}>
        {product.productName}
      </option>
    );
  })}
</select>
                <input
                  type="number"
                  disabled={mode === "edit"}
                  className="form-control w-25"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => handleComboChange(idx, "quantity", e.target.value)}
                />

                <MdAddBox
                  className={`add-prod ${mode === "edit" ? "disabled-icon" : ""}`}
                  size={20}
                  onClick={mode === "edit" ? undefined : addComboRow}
                  title={mode === "edit" ? "Disabled in Edit Mode" : "Add Product"}
                  style={{
                    cursor: mode === "edit" ? "not-allowed" : "pointer",
                    opacity: mode === "edit" ? 0.5 : 1,
                  }}
                />

 {/* Show delete only if not the first row */}
    {idx > 0 && (
      <MdDelete
        className={`delete-prod ${mode === "edit" ? "disabled-icon" : ""}`}
        size={20}
        onClick={mode === "edit" ? undefined : () => removeComboRow(idx)}
        title={mode === "edit" ? "Disabled in Edit Mode" : "Delete Product"}
        style={{
          cursor: mode === "edit" ? "not-allowed" : "pointer",
          opacity: mode === "edit" ? 0.5 : 1,
        }}
      />
    )}
  </div>
            ))}
          </Form.Group>
        </Col>
      
        <Col md={6}>
          {/* Combo Code (mapped to productCode) */}
          <Form.Group className="form-group-prod">
            <Form.Label className="required-label">Combo Code:</Form.Label>
            <Form.Control
              type="text"
              name="productCode"
              value={formData.productCode}
              onChange={handleChange}
              disabled={mode === "edit"}
              placeholder="Enter combo code"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-5">
         <Col md={6}>
          <Form.Group className="form-group-prod">
            <Form.Label className="required-label">Combo Display Name:</Form.Label>
            <Form.Control
    type="text"
    name="ProductDisplay"
    value={formData.ProductDisplay}
    onChange={handleChange}
    placeholder='Enter combo product display name'
    required
  />
          </Form.Group>
        </Col>
        <Col md={6}>
          {/* Sales Code */}
          <Form.Group className="form-group-prod">
            <Form.Label className="required-label">Sales Code:</Form.Label>
            <Form.Control
              type="text"
              name="salesCode"
              value={formData.salesCode}
              onChange={handleChange}
              placeholder="Enter sales code"
              required
            />
          </Form.Group>
        </Col>

        
      </Row>

      <Row className="g-5">
        <Col md={6}>
          {/* Sales Cost (auto-calculated but editable) */}
          <Form.Group className="form-group-prod">
            <Form.Label className="required-label">Sales Cost:</Form.Label>
            <Form.Control
              type="number"
              name="salesCost"
              value={formData.salesCost || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseFloat(value) >= 0) {
                  setFormData((prev) => ({ ...prev, salesCost: value }));
                }
              }}
              min="0"
              placeholder="Enter sales cost"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          {/* Max Discount */}
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
              min="0"
              placeholder="Enter maximum discount"
              required
            />
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
     
    </>
  )}

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
