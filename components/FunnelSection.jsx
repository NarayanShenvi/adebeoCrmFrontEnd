import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaEye, FaPlusSquare, FaTasks, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaHandHoldingDollar, FaIndianRupeeSign, FaFileCircleCheck } from "react-icons/fa6";
import './dashboard/Dashboard.css'; // Import the CSS fil

  const FunnelSection = () => {
  // Accessing funnelData and loading from the Redux store
  const funnelData = useSelector((state) => state.funnel.funnelData);
  const loading = useSelector((state) => state.funnel.loading);
  const error = useSelector((state) => state.funnel.error);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Ensure useEffect is placed before any early returns
  useEffect(() => {
    setTotalPages(Math.ceil(funnelData.length / rowsPerPage));
  }, [funnelData, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (loading) return <div className='loading'>Loading funnel data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = funnelData.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  return (
    <div className="funnel-container">
      <h3>Funnel Data</h3>

      {/* Check if there's data available */}
      {funnelData && funnelData.length > 0 ? (
        <div className='right-pannel'>
        <table className="funnel-table">
          <thead>
            <tr>
              <th>Assigned Date</th>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Area</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Products</th>
              <th>Actions</th>
              {/* Add more columns as needed */}
            </tr>
          </thead>
          <tbody>
          {currentRows.map((item) => (
                <tr key={item._id}>
      <td>{item.insertDate}</td>
      <td>{item.ownerName}</td>
      <td>{item.address.replace(/, /g, ',\n')}</td>
      <td>{item.city}</td>
      <td>{item.mobileNumber}</td>
      <td>{item.primaryEmail}</td>
      <td>{item.products}</td>
      <td>{Array.isArray(item.comments) ? 
        <span className="icon-container">
        <FaEye title="View Comments" className="action-icon"/>
        <FaPlusSquare title="Add Comments" className="action-icon"/>
        <FaTasks title="View Tasks" className="action-icon"/>
        <span className="icon-gap"></span> {/* Gap between groups */}
        <FaHandHoldingDollar title="Quotes" className="action-icon"/>
        <FaFileCircleCheck  title="PO Invoice" className="action-icon"/>
        <FaIndianRupeeSign title="Invoice" className="action-icon"/>
        </span> : item.comments}

      </td>
    </tr>
  ))}
</tbody>
        </table>
        
       {/* Pagination Controls */}
       <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              <FaChevronLeft />
            </button>
            <span className='page'> Page {currentPage} of {totalPages} </span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages}>
              <FaChevronRight />
            </button>
          </div>
        </div>
        
      ) : (
        <p className="no-data">No data available</p>
      )}
      
        
    </div>
  );
};

export default FunnelSection;

