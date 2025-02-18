import React from 'react';
import Dashboard from '../components/dashboard/dashboard';

const DashboardPage = () => {
  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;

// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProductsAsync } from '../redux/slices/productSlice';  // Assuming you're using this action to fetch products
// import Dashboard from '../components/dashboard/dashboard';

// const DashboardPage = () => {
//   const dispatch = useDispatch();
//   const productsLoading = useSelector((state) => state.products.loading); // If there's a loading state for products

//   useEffect(() => {
//     // Only dispatch fetchProductsAsync if products are not already being loaded
//     if (!productsLoading) {
//       dispatch(fetchProductsAsync());
//     }
//   }, [dispatch, productsLoading]);

//   return (
//     <div>
//       <Dashboard />
//     </div>
//   );
// };

// export default DashboardPage;