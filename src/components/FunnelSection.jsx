import React from 'react';
import { useSelector } from 'react-redux';

const FunnelSection = () => {
  // Accessing funnelData and loading from the Redux store
  const funnelData = useSelector((state) => state.funnel.funnelData);
  const loading = useSelector((state) => state.funnel.loading);
  const error = useSelector((state) => state.funnel.error);

  if (loading) return <div>Loading funnel data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Funnel Data</h3>

      {/* Check if there's data available */}
      {funnelData && funnelData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Website</th>
              {/* Add more columns as needed */}
            </tr>
          </thead>
         <tbody>
            {funnelData.map((item, index) => (
                <tr key={item._id}>
                <td>{item.companyName}</td>
                <td>{item.address}</td>
                <td>{item.primaryEmail}</td>
                <td>{item.mobileNumber}</td>
                <td>{item.website}</td>
                </tr>
            ))}
        </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default FunnelSection;

