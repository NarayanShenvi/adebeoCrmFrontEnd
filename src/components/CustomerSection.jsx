import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCustomerAsync,
  setSelectedCustomer,
  fetchCustomerAsync,
  clearSuccessMessage,
  updateCustomerAsync,
  resetSelectedCustomer,
  clearCustomers,
  clearError 
} from '../redux/slices/customerSlice';
import { Form } from 'react-bootstrap';
import { debounce } from 'lodash';
import './dashboard/Dashboard.css'; // changes made --Import the CSS fil
import { Row, Col } from 'react-bootstrap';
import { HiMiniUserPlus } from "react-icons/hi2";
import { FaUserEdit } from "react-icons/fa";
import { ImUserCheck } from "react-icons/im";
import { FaSpinner } from 'react-icons/fa';
import { loadCustomerComments, postCustomerComment } from "../redux/slices/customerSlice";
import { setModalState } from "../redux/slices/customerSlice";
import { FaEye, FaPlusSquare } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { HiSave } from "react-icons/hi";
import { fetchProductsAsync } from '../redux/slices/productSlice'; // Import fetchProductsAsync
import Select from 'react-select'; // Import react-select
import {  FaFaceMeh  } from "react-icons/fa6";//chages made- bugs free



const CustomerSection = ({ customer}) => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("");//changes made--for company type
  // Accessing customers and selectedCustomer state from Redux
  const customers = useSelector((state) => state.customers?.customers || []);
  const loading = useSelector((state) => state.customers?.createLoading || false);
  const error = useSelector((state) => state.customers?.error || null);
  const successMessage = useSelector((state) => state.customers?.successMessage || '');
  const selectedCustomer = useSelector((state) => state.customers?.selectedCustomer || null);
  
  const commentsRef = useRef(null); //changes made - bugs free
      const addCommentRef = useRef(null);//changes made - bugs free

  const indianStates = [
    "Andaman & Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];
   {/* states added-changes*/}

  const [selectedState, setSelectedState] = useState(""); // Add this if needed  {/* states added-changes*/}

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

  // const handleProductSelect = (selectedOptions) => {
  //   const selectedProducts = selectedOptions 
  //     ? selectedOptions.map(option => ({
  //         productId: option.value, // Product ID
  //         productDescription: option.label // Product Description (label)
  //       }))
  //     : [];
    
  //   setSelectedProducts(selectedProducts);  // Update the `selectedProducts` state
  // };

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
      if (newMode) {
        dispatch(clearError());
      }
      return newMode;
    });

    // Clear search query and reset success message on toggle
    setSearchQuery('');
    dispatch(clearSuccessMessage());
  };

  // const handleToggleEditMode = () => {
  //   setIsEditMode((prevMode) => {
  //     const newMode = !prevMode;
  
  //     if (!newMode) {
  //       // Switching to create mode, reset the customer form state
  //       setState({
  //         companyName: '',
  //         ownerName: '',
  //         primaryEmail: '',
  //         mobileNumber: '',
  //         address: '',
  //         altemail: '',
  //         city: '',
  //         comments: [],
  //         gstin: '',
  //         funnelType: '',
  //         insta: '',
  //         linkedin: '',
  //         pincode: '',
  //         primaryLocality: '',
  //         secondaryLocality: '',
  //         state: '',
  //         website: ''
  //       });
  
  //       // Clear selected products when switching to create mode
  //       setSelectedProducts([]); // Reset selected products
  
  //       // Clear the customers list (from Redux state)
  //       dispatch(clearCustomers());
  
  //       // Clear any errors in the Redux state before switching to create mode
  //      // dispatch(clearError());
  
  //       // Reset the customer search query if needed
  //       setSearchQuery('');
  //     }
  
  //     // If switching to edit mode, you may want to reset any previously selected customer info
  //     if (newMode) {
  //       dispatch(resetSelectedCustomer());
  //     }
  
  //     return newMode;
  //   });
  
  //   // Clear success message when toggling modes
  //   dispatch(clearSuccessMessage());
  // };
  

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    console.log("Updated Customer List:", customers);
  }, [customers]);

  const customerComments = useSelector((state) => state.customers?.customerComments || []);
  const modalState = useSelector((state) => state.customers?.modalState);

const [newComment, setNewComment] = useState("");
const fetchCommentsIfNeeded = (customerId) => {
  const existingComments = customerComments.find(comment => comment.customerId === customerId);
  if (!existingComments) {
      dispatch(loadCustomerComments(customerId));
  }
};

 // Close modal when clicking outside changes made from here
useEffect(() => {
  const handleClickOutside = (event) => {
    if (modalState.showComments && commentsRef.current && !commentsRef.current.contains(event.target)) {
      handleCloseCommentsModal();
    }
    if (modalState.addComment && addCommentRef.current && !addCommentRef.current.contains(event.target)) {
      handleCloseAddCommentModal();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [modalState.showComments, modalState.addComment]);


  const handleShowComments = (customerId) => {
    dispatch(setModalState({ 
      selectedShowCommentsCustomerId: customerId, 
      showComments: true, 
      addComment: false  // Ensure "Add Comment" is closed
    }));
    fetchCommentsIfNeeded(customerId);
  };
  
  const handleAddComment = (customerId) => {
    dispatch(setModalState({ 
      selectedAddCommentCustomerId: customerId, 
      addComment: true, 
      showComments: false  // Ensure "View Comments" is closed
    }));
  };
  
  const handleCloseCommentsModal = () => {
    dispatch(setModalState({
      selectedShowCommentsCustomerId: null, // Reset selected customer
      showComments: false, 
      addComment: false // Ensure add comment is also closed
    }));
  };
  
  const handleCloseAddCommentModal = () => {
    dispatch(setModalState({
      selectedAddCommentCustomerId: null, // Reset selected customer
      addComment: false,
      showComments: false // Ensure view comments is also closed
    }));
  };
  
  // to here - bugs free

const handleCommentChange = (e) => {
  setNewComment(e.target.value);
};

const handleSubmitComment = () => {
  // Check if modalState is defined and has the required properties
  if (!modalState || !modalState.selectedAddCommentCustomerId) {
      alert("Error: No customer selected.");
      return;
  }

  // Ensure the comment is not empty
  if (!newComment.trim()) {
      alert("Please enter a comment.");
      return;
  }

  // Dispatch the comment post action
  dispatch(postCustomerComment(modalState.selectedAddCommentCustomerId, newComment))
      .then(() => {
          // Clear the input field after successful submission
          setNewComment('');

          // Close the comment modal
          dispatch(setModalState({ addComment: false }));
      })
      .catch((error) => {
          console.error("Error submitting comment:", error);
          alert("Failed to submit comment. Please try again.");
      });
};



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
          <Form.Label className="required-label">Company Name</Form.Label>
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
  <option value="">-- Select Type --</option>
  <option value="Architectural">Architectural</option>
  <option value="Interior">Interior</option>
  <option value="Constructions">Constructions</option>
  <option value="Consultants">Consultants</option>
  <option value="Manufacturers">Manufacturers</option>
</Form.Select>
{/* added com type - changes*/}
    </Form.Group>
  </Col>
  <Col md={6}>
    {/* Nested row for Sub Area and Area with a smaller gap */}
    <Row className="g-2">
      <Col md={6}>
        <Form.Group className="form-group">
          <Form.Label>Sub Area</Form.Label>
          <Form.Control
           type="text"
           value={selected}
           onChange={(e) => setSelected(e.target.value)}
           placeholder="Enter Sub Area"
         />
       </Form.Group> {/* chaged sub-area to ip field */}
      </Col>
      <Col md={6}>
      <Form.Group className="form-group">
  <Form.Label>Area</Form.Label>
  <Form.Control
    type="text"
    value={selected}
    onChange={(e) => setSelected(e.target.value)}
    placeholder="Enter Area"
  />
</Form.Group> {/* chaged area to ip field */}

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
<option value="">--Test City --</option>            
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={4}>
      <Form.Group className="form-group">
  <Form.Label>State</Form.Label>
  <Form.Select 
    value={state.state} 
    onChange={(e) => setState({ ...state, state: e.target.value })}
  >
    <option value="">-- Select State --</option>
    {indianStates.map((stateName, index) => (
      <option key={index} value={stateName}>{stateName}</option>
    ))}
  </Form.Select> {/* states added-changes*/}
</Form.Group>

      </Col>
      <Col md={4}>
        <Form.Group className="form-group">
          <Form.Label>Pincode</Form.Label>
          <Form.Control
            type="text"
            placeholder="--Test Pincode--"
            name="pincode"
            value={state.pincode}
            onChange={(e) => setState({ ...state, pincode: e.target.value })}
            disabled={loading}
            readOnly
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
          <Form.Label className="required-label">Email</Form.Label>
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
          <Form.Label className="required-label">Phone</Form.Label>
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
              {/* changed */}

              <Row className="g-5">   
       <Col md={6}>
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
        </Col>
       </Row>
        {/* Add other form fields similarly */}
              {/* changed up to here */}

       
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
{isEditMode && (
    <span className="icon-container-customer">
        <FaEye 
            onClick={() => handleShowComments(customer?._id)} 
            title="View Comments" 
            className="action-icon-customer"
        />
        <FaPlusSquare 
            onClick={() => handleAddComment(customer?._id)} 
            title="Add Comment" 
            className="action-icon-customer"
        />
    </span>
)}
      </Form>
      

   {/* Show Comments Modal */}
  {/* changes made from Show Comments Modal */}
   {modalState.showComments && !modalState.addComment && (
     <div className="comments-modal-container-customer" ref={commentsRef}>
       <div className="comments-modal-customer" >
         <h4>Customer Comments</h4>
         {Array.isArray(customerComments) && customerComments.length > 0 ? (
           <>
             <p className='displaycomments-customer'>Displaying {customerComments.length} comments</p>
             <textarea
               readOnly
               rows={5}
               value={customerComments.map((comment) => (
                 `${comment.name}: ${comment.text}\nDate: ${new Date(comment.date).toLocaleString()}\n`
               )).join("\n")}
             />
           </>
         ) : (
           <p className='nocomments-customer'>No comments available... <FaFaceMeh /></p>
         )}
         <div className='cancel-customer'>
           <MdOutlineCancel onClick={handleCloseCommentsModal} title='Cancel' className='cancelcomment-customer'/>
         </div>
       </div>
     </div>
   )}
   
   {/* Add Comment Modal */}
   {modalState.addComment && !modalState.showComments && (
     <div className="comment-edit-modal-container-customer"  ref={addCommentRef}>
       <div className="comment-edit-modal-customer">
         <h4>Add Comment</h4>
         <textarea
           value={newComment}
           onChange={handleCommentChange}
           placeholder="Enter your comment here..."
           rows="5"
         />
         <div>
           <MdOutlineCancel onClick={handleCloseAddCommentModal} title='Cancel' className='cancelcomment-customer'/>
           <HiSave onClick={handleSubmitComment} title='Submit' className='submitcomment-customer'/>
         </div>
         <p className="alert-box-customer">Comment saved successfully! ✅</p>
       </div>
     </div>
   )}
   {/* to here Add Comment Modal -- bugs free */}


    </div>
  );
};

export default CustomerSection;
