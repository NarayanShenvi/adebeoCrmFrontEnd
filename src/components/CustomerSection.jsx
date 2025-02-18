import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCustomerAsync,
  setSelectedCustomer,
  fetchCustomerAsync,
  clearSuccessMessage,
  updateCustomerAsync,
  resetSelectedCustomer,
  clearCustomers
} from '../redux/slices/customerSlice';
import { Form } from 'react-bootstrap';
import { debounce } from 'lodash';
import { fetchProductsAsync } from '../redux/slices/productSlice'; // Import fetchProductsAsync
import Select from 'react-select'; // Import react-select

const CustomerSection = () => {
  const dispatch = useDispatch();

  // Accessing customers and selectedCustomer state from Redux
  const customers = useSelector((state) => state.customers?.customers || []);
  const loading = useSelector((state) => state.customers?.createLoading || false);
  const error = useSelector((state) => state.customers?.error || null);
  const successMessage = useSelector((state) => state.customers?.successMessage || '');
  const selectedCustomer = useSelector((state) => state.customers?.selectedCustomer || null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState({
    companyName: '',
    ownerName: '',
    primaryEmail: '',
    mobileNumber: '',
    address: '',
    altemail: '',
    city: '',
    comments: [],
    gstin: '',
    funnelType: '',
    insta: '',
    linkedin: '',
    pincode: '',
    primaryLocality: '',
    secondaryLocality: '',
    state: '',
    website: ''
  });
  //--------------------Products Section update ------------------------
  // Accessing products state from Redux
  const products = useSelector((state) => state.products?.products || []);
  const loadingProducts = useSelector((state) => state.products?.loading || false);
  const errorProducts = useSelector((state) => state.products?.error || null);

  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProductsAsync());
  }, [dispatch]);

  const handleProductSelect = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedProducts(selectedIds);  // Update `selectedProducts` correctly
  };

  const selectRef = useRef(null);

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.clearValue();
    }
  }, [selectedCustomer]);

  //--------------------Products Section update ------------------------

  // Search debounce for filtering customers
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim() !== '') {
        dispatch(fetchCustomerAsync(query)); // Fetch customers based on the search query
      }
    }, 500),
    []
  );

  // Watch for changes to selectedCustomer in the Redux state
  useEffect(() => {
    if (selectedCustomer) {
      // Perform some action or side effect after selectedCustomer is updated
      console.log("Selected customer updated:", selectedCustomer);
      // You can add more logic like redirecting, showing a success message, etc.
    }
  }, [selectedCustomer]); // Dependency array ensures it runs when selectedCustomer changes

  // Update state when selectedCustomer changes (for Edit mode)
  useEffect(() => {
    if (isEditMode && selectedCustomer) {
      console.log("Selected Customer for Edit Mode:", selectedCustomer);

      // Reset selected products when changing the customer
      setSelectedProducts([]); // Clear previously selected products

      // Set state for customer details
      setState({
        companyName: selectedCustomer.companyName || '',
        ownerName: selectedCustomer.ownerName || '',
        primaryEmail: selectedCustomer.primaryEmail || '',
        mobileNumber: selectedCustomer.mobileNumber || '',
        address: selectedCustomer.address || '',
        altemail: selectedCustomer.altemail || '',
        city: selectedCustomer.city || '',
        comments: selectedCustomer.comments || [],
        gstin: selectedCustomer.gstin || '',
        funnelType: selectedCustomer.funnelType || '',
        insta: selectedCustomer.insta || '',
        linkedin: selectedCustomer.linkedin || '',
        pincode: selectedCustomer.pincode || '',
        primaryLocality: selectedCustomer.primaryLocality || '',
        secondaryLocality: selectedCustomer.secondaryLocality || '',
        state: selectedCustomer.state || '',
        website: selectedCustomer.website || ''
      });

      // Directly use the `products` array, which is already an array of product IDs (strings)
      if (selectedCustomer.products && Array.isArray(selectedCustomer.products)) {
        setSelectedProducts(selectedCustomer.products); // Set selected products for editing
      }
    }
  }, [isEditMode, selectedCustomer]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFocus = () => {
    // Manually reset the selected products when the select is focused
    setSelectedProducts([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const customerData = { ...state, products: selectedProducts };

    if (isEditMode && selectedCustomer) {
      // Editing an existing customer
      const updatedCustomer = { ...customerData, id: selectedCustomer._id };

      console.log("Updated Customer Payload:", updatedCustomer);

      try {
        const resultAction = await dispatch(updateCustomerAsync(updatedCustomer));
        
        if (resultAction && resultAction.id) {
          const updatedCustomerData = resultAction;
          console.log("Updated Customer Data:", updatedCustomerData);

          // Update Redux state with the updated customer
          dispatch(setSelectedCustomer(updatedCustomerData));

          // Update local state with the latest customer data
          setState({
            companyName: updatedCustomerData.companyName || '',
            ownerName: updatedCustomerData.ownerName || '',
            primaryEmail: updatedCustomerData.primaryEmail || '',
            mobileNumber: updatedCustomerData.mobileNumber || '',
            address: updatedCustomerData.address || '',
            altemail: updatedCustomerData.altemail || '',
            city: updatedCustomerData.city || '',
            comments: updatedCustomerData.comments || [],
            gstin: updatedCustomerData.gstin || '',
            funnelType: updatedCustomerData.funnelType || '',
            insta: updatedCustomerData.insta || '',
            linkedin: updatedCustomerData.linkedin || '',
            pincode: updatedCustomerData.pincode || '',
            primaryLocality: updatedCustomerData.primaryLocality || '',
            secondaryLocality: updatedCustomerData.secondaryLocality || '',
            state: updatedCustomerData.state || '',
            website: updatedCustomerData.website || ''
          });

          // Clear form only after successful update
          setState({
            companyName: '',
            ownerName: '',
            primaryEmail: '',
            mobileNumber: '',
            address: '',
            altemail: '',
            city: '',
            comments: [],
            gstin: '',
            funnelType: '',
            insta: '',
            linkedin: '',
            pincode: '',
            primaryLocality: '',
            secondaryLocality: '',
            state: '',
            website: ''
          });

          // Optionally reset selected products
          setSelectedProducts([]);
        } else {
          console.log("Error in resultAction:", resultAction);
          console.error("Error updating customer:", resultAction?.error || "Unknown error");
        }
      } catch (err) {
        console.error("Error submitting customer data:", err);
      }
    } else {
      // Creating a new customer
      const customerPayload = { ...customerData, products: selectedProducts || [] };

      console.log("Create Customer Payload:", customerPayload);

      try {
        await dispatch(createCustomerAsync(customerPayload));

        // Clear form after successful creation
        setState({
          companyName: '',
          ownerName: '',
          primaryEmail: '',
          mobileNumber: '',
          address: '',
          altemail: '',
          city: '',
          comments: [],
          gstin: '',
          funnelType: '',
          insta: '',
          linkedin: '',
          pincode: '',
          primaryLocality: '',
          secondaryLocality: '',
          state: '',
          website: ''
        });

        // Optionally reset selected products after creation
        setSelectedProducts([]);
      } catch (err) {
        console.error("Error creating customer:", err);
      }
    }
  };

  // Toggle between Edit and Create mode
  const handleToggleEditMode = () => {
    setIsEditMode((prevMode) => {
      const newMode = !prevMode;
      if (!newMode) {
        // Reset state and products only when creating a new customer
        setState({
          companyName: '',
          ownerName: '',
          primaryEmail: '',
          mobileNumber: '',
          address: '',
          altemail: '',
          city: '',
          comments: [],
          gstin: '',
          funnelType: '',
          insta: '',
          linkedin: '',
          pincode: '',
          primaryLocality: '',
          secondaryLocality: '',
          state: '',
          website: ''
        });

        // Clear selected products when switching to create mode
        setSelectedProducts([]); // Reset selected products
        dispatch(clearCustomers());

         // Dispatch action to clear the selected customer in Redux state
        //dispatch(resetSelectedCustomer());

      // Clear the search query and reset the customer list
      //setSearchQuery('');
      //dispatch(fetchCustomerAsync(''));  // Dispatch with empty string to reset the customer list
      }
      return newMode;
    });

    // Clear search query and reset success message on toggle
    setSearchQuery('');
    dispatch(clearSuccessMessage());
  };

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    console.log("Updated Customer List:", customers);
  }, [customers]);

  return (
    <div>
      <h3>{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h3>
      <button onClick={handleToggleEditMode}>
        Switch to {isEditMode ? 'Create New' : 'Edit Existing'}
      </button>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* The Form is always visible in both modes */}
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter company name"
            name="companyName"
            value={state.companyName}
            onChange={(e) => setState({ ...state, companyName: e.target.value })}
            disabled={loading}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Choose Products</Form.Label>
          {loadingProducts ? (
            <p>Loading Products...</p>
          ) : errorProducts ? (
            <p style={{ color: 'red' }}>{errorProducts}</p>
          ) : (
            <Select
              key={selectedCustomer ? selectedCustomer._id : 'new'} // Unique key to force reset on customer change
              isMulti
              name="products"
              options={products.map(product => ({
                label: `${product.productName} - ${product.productCode}`,
                value: product._id
              }))}
              value={products
                .filter(product => selectedProducts.includes(product._id))
                .map(product => ({
                  label: `${product.productName} - ${product.productCode}`,
                  value: product._id
                }))}
              onChange={handleProductSelect}
              getOptionLabel={(e) => e.label}
              getOptionValue={(e) => e.value}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          )}
        </Form.Group>

        <Form.Group>
          <Form.Label>Contact Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter contact name"
            name="ownerName"
            value={state.ownerName}
            onChange={(e) => setState({ ...state, ownerName: e.target.value })}
            disabled={loading}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            name="primaryEmail"
            value={state.primaryEmail}
            onChange={(e) => setState({ ...state, primaryEmail: e.target.value })}
            disabled={loading}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            name="mobileNumber"
            value={state.mobileNumber}
            onChange={(e) => setState({ ...state, mobileNumber: e.target.value })}
            disabled={loading}
          />
        </Form.Group>

        {/* Add other form fields similarly */}

        {/* Search field for Edit mode */}
        {isEditMode && (
          <div>
            <label>Search for Customer:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by company name"
              disabled={loading}
            />
            <div>
              {loading ? (
                <p>Loading...</p>
              ) : customers.length > 0 ? (
                <select
                  onChange={(e) => {
                    const selectedCustomer = customers.find(
                      (customer) => customer._id === e.target.value
                    );
                    dispatch(setSelectedCustomer(selectedCustomer));
                  }}
                  value={selectedCustomer?._id || ''}
                  style={{ width: '100%' }}
                >
                  <option value="" disabled>Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.companyName}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No customers found</p>
              )}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {isEditMode ? 'Save Changes' : 'Create Customer'}
        </button>
      </Form>
    </div>
  );
};

export default CustomerSection;
