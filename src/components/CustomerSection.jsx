import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createCustomerAsync,
  setSelectedCustomer,
  fetchCustomerAsync,
  clearSuccessMessage,
  updateCustomerAsync
} from '../redux/slices/customerSlice';
import { Form } from 'react-bootstrap';
import { debounce } from 'lodash';

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

  // Search debounce for filtering customers
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim() !== '') {
        dispatch(fetchCustomerAsync(query)); // Fetch customers based on the search query
      }
    }, 500),
    []
  );

  // Update state when selectedCustomer changes (for Edit mode)
  useEffect(() => {
    if (isEditMode && selectedCustomer) {
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
    }
  }, [isEditMode, selectedCustomer]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode && selectedCustomer) {
      // Edit an existing customer
      const updatedCustomer = { ...state, id: selectedCustomer._id };
      await dispatch(updateCustomerAsync(updatedCustomer));  // PUT request to update
    } else {
      // Create a new customer
      await dispatch(createCustomerAsync(state));  // POST request to create
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
      }); // Clear the form after creation
    }
  };

  // Toggle between Edit and Create mode
  const handleToggleEditMode = () => {
    setIsEditMode((prevMode) => {
      const newMode = !prevMode;
      if (!newMode) {
        // Reset state when switching to create mode
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
      }
      return newMode;
    });
    setSearchQuery(''); // Clear search when toggling modes
    dispatch(clearSuccessMessage()); // Clear any success messages
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
          {loading ? 'Submitting...' : isEditMode ? 'Update Customer' : 'Create Customer'}
        </button>
      </Form>
    </div>
  );
};

export default CustomerSection;
