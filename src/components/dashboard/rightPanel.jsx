import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadFunneldata } from '../../redux/slices/funnelSlice'; // Funnel slice
import FunnelSection from '../../components/FunnelSection';
import CustomerSection from '../../components/CustomerSection'; // CustomerSection import
import { resetNewCustomer } from '../../redux/slices/customerSlice'; // Action to reset new customer
import ProductSection from '../../components/ProductSection'
import { fetchProductsAsync } from '../../redux/slices/productSlice';  // Adjust the path accordingly
import  CreatePurchaseOrder from '../purchaseOrderSection';
import {fetchProformas} from '../../redux/slices/purchaseOrderSlice';
import {fetchCustomerPaymentsAsync} from '../../redux/slices/customerPaymentSlice';
import CustomerPaymentSection from '../customerPaymentSection';
import Createreport from '../reportSection';
import fetchReportsAsync from '../../redux/slices/reportSlice'
import { returnStatement } from '@babel/types';

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

  const loadPurchaseOrder =() =>  {
    dispatch(fetchProformas());
  }

  const loadCutomerPayments =() =>  {
    dispatch(fetchCustomerPaymentsAsync());
  }

  const loadReports =() =>  {
  //  dispatch(fetchReportsAsync());
  }

  useEffect(() => {
    if (selectedSection === 'funnel') {
      getFunnel(); // Load funnel data when 'funnel' section is selected
     } else if (selectedSection === 'customers') {
      getCustomer(); // Reset new customer fields when entering customers section
      } else if (selectedSection === 'products') {
        getProducts();
      } else if (selectedSection === 'purchase_orders'){
        loadPurchaseOrder();
      }  
        else if (selectedSection === 'cx_payment'){
        loadCutomerPayments();
      }
        else if (selectedSection === 'reports'){
        loadReports();
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
      case 'purchase_orders':
        return <CreatePurchaseOrder/>;
      case 'cx_payment':
        return <CustomerPaymentSection/>;
      case 'reports':
        return <Createreport/>;     
      default:
        return <div className='default_msg'>Select a section from the menu.</div>;
    }
  };

  return <div className="right-panel">{renderSection()}</div>;
};

export default RightPanel;





