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
import './dashboard/Dashboard.css'; // changes made --Import the CSS fil
import { Row, Col } from 'react-bootstrap';
import { HiMiniUserPlus } from "react-icons/hi2";
import { FaUserEdit } from "react-icons/fa";
import { ImUserCheck } from "react-icons/im";
import { FaSpinner } from 'react-icons/fa';
import { HiSave } from "react-icons/hi";




const CustomerSection = () => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("");//changes made--for company type
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
<div className="customer-section">
      <h3>{isEditMode ? 'Edit Existing Customer' : 'Create New Customer'}</h3>
      
      <div onClick={handleToggleEditMode}>
       {isEditMode ? (
        // When in edit mode, show the "create new" icon
        <HiMiniUserPlus  title="Switch to Create New" className="toggle-icon"/>
      ) : (
        // When in create mode, show the "edit existing" icon
        <FaUserEdit title="Switch to Edit Existing" className="toggle-icon" />
      )}
      </div>

      {successMessage && <p className="success">{successMessage}</p>}
      {error && <p className="error1">{error}</p>}
           {/* Search field for Edit mode */}
           {isEditMode && (
          <div >
            
            <input
              type="text"
              className='search-field'
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by company name"
              disabled={loading}
            />
            <div className='search-field1'>
              {loading ? (
                <p className='CustomerLoading'>Loading...</p>
              ) : customers.length > 0 ? (
                <select
                  onChange={(e) => {
                    const selectedCustomer = customers.find(
                      (customer) => customer._id === e.target.value
                    );
                    dispatch(setSelectedCustomer(selectedCustomer));
                  }}
                  value={selectedCustomer?._id || ''}

                >
                  <option value="" disabled>Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.companyName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className='NoCustomerssFound'>No customers found...</p>
              )}
            </div>
          </div>
        )}

     
      {/* The Form is always visible in both modes */}
      <Form onSubmit={handleSubmit} className='customer-form'>
        <Row className="g-5">
          <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter company name"
            name="companyName"
            value={state.companyName}
            onChange={(e) => setState({ ...state, companyName: e.target.value })}
            disabled={loading} required
          />
        </Form.Group>
        </Col>
        <Col md={6}>
        <Form.Group className="form-group">
        <Form.Label>Address</Form.Label>
        <Form.Control as="textarea" rows={1} placeholder="Enter address" 
        name="address"
        value={state.address}
        onChange={(e) => setState({ ...state, address: e.target.value })}
        disabled={loading} /> 
        </Form.Group>
    </Col>
    </Row>
    <Row className="g-5">
  <Col md={6}>
    <Form.Group className="form-group">
      <Form.Label>Company Type</Form.Label>
      <Form.Select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      
      >
        <option value="">-- Select --</option>
        <option>Technology</option>
        <option>Health</option>
        <option>Finance</option>
      </Form.Select>
    </Form.Group>
  </Col>
  <Col md={6}>
    {/* Nested row for Sub Area and Area with a smaller gap */}
    <Row className="g-2">
      <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Sub Area</Form.Label>
          <Form.Select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            
          >
            <option value="">Sub area</option>
            <option>Technology</option>
            <option>Health</option>
            <option>Finance</option>
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Area</Form.Label>
          <Form.Select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            
          >
            <option value="">Area</option>
            <option>Technology</option>
            <option>Health</option>
            <option>Finance</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  </Col>
</Row>

    <Row className="g-5">
  <Col md={6}>
    <Form.Group className="form-group">
      <Form.Label>Owner Name</Form.Label>
      <Form.Control
        type="text"
        placeholder="Enter owner name"
        name="ownerName"
        value={state.ownerName}
        onChange={(e) => setState({ ...state, ownerName: e.target.value })}
        disabled={loading}
        
      />
    </Form.Group>
  </Col>

  {/* Wrap City, State, and Pincode inside a nested Row with a smaller gap */}
  <Col md={6}>
    <Row className="g-2"> {/* Adjust g-1 to a smaller gap; try g-0, g-1, g-2 as needed */}
      <Col md={4}>
        <Form.Group className="form-group">
          <Form.Label>City</Form.Label>
          <Form.Select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            
          >
            <option>City</option>
            <option>Technology</option>
            <option>Health</option>
            <option>Finance</option>
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group className="form-group">
          <Form.Label>State</Form.Label>
          <Form.Select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            
          >
            <option value="">State</option>
            <option>Technology</option>
            <option>Health</option>
            <option>Finance</option>
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group className="form-group">
          <Form.Label>Pincode</Form.Label>
          <Form.Control
            type="text"
            placeholder="Pincode"
            name="pincode"
            value={state.pincode}
            onChange={(e) => setState({ ...state, pincode: e.target.value })}
            disabled={loading}
            
          />
        </Form.Group>
      </Col>
    </Row>
  </Col>
</Row>

        {/* Primary Email */}
        <Row className="g-5">
  <Col md={6}>
   
        <Form.Group className="form-group">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter primary email address"
            name="primaryEmail"
            value={state.primaryEmail}
            onChange={(e) => setState({ ...state, primaryEmail: e.target.value })}
            disabled={loading} required
          />
        </Form.Group>
    
    </Col>  
    <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Alt Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter alternative email address"
            name="altEmail"
            value={state.altEmail}
            onChange={(e) => setState({ ...state, altEmail: e.target.value })}
            disabled={loading} 
          />
        </Form.Group>
        </Col>
        </Row> 
<Row className="g-5">   
        <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            name="mobileNumber"
            value={state.mobileNumber}
            onChange={(e) => setState({ ...state, mobileNumber: e.target.value })}
            disabled={loading} required
          />
        </Form.Group>
        </Col>
        <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>GSTIN</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter gstin"
            name="gstin"
            value={state.gstin}
            onChange={(e) => setState({ ...state, gstin: e.target.value })}
            disabled={loading} 
          />
        </Form.Group>
        
        </Col>
      </Row>
      <Row className="g-5">   
        <Col md={6}>
        <Form.Group className="form-group">
      <Form.Label>Products</Form.Label>
      <Form.Select value={selected} onChange={(e) => setSelected(e.target.value)} >
        <option value="">-- Select --</option>
        <option >Technology</option>
        <option >Health</option>
        <option >Finance</option>
      </Form.Select>
    </Form.Group>
        </Col>
        <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Website</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter website"
            name="website"
            value={state.website}
            onChange={(e) => setState({ ...state, website: e.target.value })}
            disabled={loading} 
          />
        </Form.Group>
        </Col>
      </Row>
      <Row className="g-5">   
        <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Linkedin</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Linkedin ID"
            name="linkedin"
            value={state.linkedin}
            onChange={(e) => setState({ ...state, linkedin: e.target.value })}
            disabled={loading} 
          />
        </Form.Group>
        </Col>
        <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Insta ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Insta ID"
            name="insta"
            value={state.insta}
            onChange={(e) => setState({ ...state, insta: e.target.value })}
            disabled={loading} 
          />
        </Form.Group>
        </Col>
      </Row>
       {/* Read-Only Field */}
       <Form.Group className="form-group">
          <Form.Label>Funnel Status</Form.Label>
          <Form.Select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            
          >
            <option value="">State</option>
            <option>Current</option>
            <option>Future</option>
            <option>Not Interested</option>
          </Form.Select>
        </Form.Group>

        {/* Add other form fields similarly */}

   
<button type="submit" disabled={loading} className="submit-button">
  {loading ? (
    <>
      <FaSpinner className="spinner" size={20} title='Submitting...'/>
    </>
  ) : isEditMode ? (
    <>
      <ImUserCheck size={24} title='Save Update'className='SaveUpdate'/>
    </>
  ) : (
    <>
      <HiSave  size={24} title='Save New Customer...' className='NewCustomer'/>
    </>
  )}
</button>

      </Form>
    </div>
  );
};

export default CustomerSection;
