import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadFunneldata } from '../../redux/slices/funnelSlice'; // Funnel slice
import FunnelSection from '../../components/FunnelSection';
import CustomerSection from '../../components/CustomerSection'; // CustomerSection import
import { resetNewCustomer } from '../../redux/slices/customerSlice'; // Action to reset new customer
import ProductSection from '../../components/ProductSection'
import { fetchProductsAsync } from '../../redux/slices/productSlice';  // Adjust the path accordingly


const RightPanel = ({ selectedSection }) => {
  const dispatch = useDispatch();

  // Access loading state from redux store (with optional chaining to avoid errors)
const funnelLoading = useSelector((state) => state.funnel?.loading);
const customerLoading = useSelector((state) => state.customer?.loading);


  //Trigger function to load funnel data
  const getFunnel = () => {
    dispatch(loadFunneldata());
  };

  const getProducts = async () => {
    dispatch(fetchProductsAsync());
  };
  
  // Trigger function to load customer data (reset to new customer)
  const getCustomer = () => {
    dispatch(resetNewCustomer());  // Reset new customer state to initial empty fields
    console.log("Loading customer data...");
  };

  useEffect(() => {
    if (selectedSection === 'funnel') {
      getFunnel(); // Load funnel data when 'funnel' section is selected
     } else if (selectedSection === 'customers') {
      getCustomer(); // Reset new customer fields when entering customers section
    } else if (selectedSection === 'products') {
      getProducts();
    }
  }, [selectedSection, dispatch]);

  const renderSection = () => {
    switch (selectedSection) {
      case 'funnel':
        return <FunnelSection/>;
      case 'customers':
       return <CustomerSection />;
      case 'products':
        return <ProductSection />;
      default:
        return <div className='default_msg'>Select a section from the menu.</div>;
    }
  };

  return <div className="right-panel">{renderSection()}</div>;
};

export default RightPanel;





