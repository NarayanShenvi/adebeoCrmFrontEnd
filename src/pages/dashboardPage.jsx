// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { loadFunneldata } from "../redux/slices/funnelSlice" ; // Adjust the path to your slice

// const Dashboard = () => {
//   const dispatch = useDispatch(); // Hook to dispatch actions
  
//   // Function to trigger the funnel data load
//   const handleGetFunnel = () => {
//     dispatch(loadFunneldata()); // Dispatch the action to load funnel data
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Welcome to Your Dashboard</h1>
//       <p>This is your dashboard page. You can add more components here.</p>

//       {/* Funnel button - triggers the getFunnel action */}
//       <button onClick={handleGetFunnel}>
//         Funnel
//       </button>

//       <div></div>

//       {/* Customers button */}
//       <button>
//         Customers
//       </button>
//     </div>
//   );
// };

// export default Dashboard;

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