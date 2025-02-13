import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCustomer,
  updateNewCustomerField,
  resetNewCustomer,
  setSelectedCustomer,
  fetchCustomer,
} from '../redux/slices/customerSlice';

const CustomerSection = () => {
  const dispatch = useDispatch();
  const { newCustomer = {}, loading, error, customers = [] } = useSelector(
    (state) => state.customer || {}
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isEditMode) {
      dispatch(resetNewCustomer()); // Reset when we switch to create mode
    }
  }, [isEditMode, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateNewCustomerField({ field: name, value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode && searchQuery) {
      dispatch(fetchCustomer(searchQuery));
    } else {
      dispatch(createCustomer(newCustomer)); // Use Redux state for submission
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
    setSearchQuery('');
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h3>{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h3>

      <button onClick={handleToggleEditMode}>
        Switch to {isEditMode ? 'Create New' : 'Edit Existing'}
      </button>

      {isEditMode ? (
        <>
          <div>
            <label>Search for Customer:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by company name"
            />
          </div>

          <div>
            {filteredCustomers.length > 0 ? (
              <ul>
                {filteredCustomers.map((customer) => (
                  <li key={customer.id} onClick={() => dispatch(setSelectedCustomer(customer))}>
                    {customer.companyName}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No customers found</p>
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Company Name:</label>
            <input
              type="text"
              name="companyName"
              value={newCustomer.companyName || ''} // Directly use Redux state value
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Contact Name:</label>
            <input
              type="text"
              name="contactName"
              value={newCustomer.contactName || ''} // Directly use Redux state value
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={newCustomer.email || ''} // Directly use Redux state value
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={newCustomer.phone || ''} // Directly use Redux state value
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Create Customer'}
          </button>
        </form>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CustomerSection;
