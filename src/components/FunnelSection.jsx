

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadFunneldata, loadCustomerComments, postCustomerComment } from '../redux/slices/funnelSlice';
import { setModalState } from '../redux/slices/funnelSlice';
import { FaEye, FaPlusSquare, FaTasks, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaHandHoldingDollar, FaIndianRupeeSign, FaFileCircleCheck } from "react-icons/fa6";
import './dashboard/Dashboard.css'; // Import the CSS fil

const FunnelSection = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');

  const funnelData = useSelector((state) => state.funnel.funnelData);
  const loading = useSelector((state) => state.funnel.loading);
  const error = useSelector((state) => state.funnel.error);
  const customerComments = useSelector((state) => state.funnel.customerComments);
  const modalState = useSelector((state) => state.funnel.modalState);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = funnelData.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(funnelData.length / rowsPerPage));
  }, [funnelData, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  // Debounced search term effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch funnel data when searchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() !== '') {
      dispatch(loadFunneldata(1, 5, debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, dispatch]);

  // Fetch customer comments only if they haven't been fetched already
  const fetchCommentsIfNeeded = (customerId) => {
    const existingComments = customerComments.find(
      (comment) => comment.customerId === customerId
    );
    if (!existingComments) {
      dispatch(loadCustomerComments(customerId));
    }
  };

  const handleShowComments = (customerId) => {
    dispatch(setModalState({ selectedShowCommentsCustomerId: customerId, showComments: true }));

    // Fetch comments only if they haven't been fetched yet
    fetchCommentsIfNeeded(customerId);
  };

  const handleAddComment = (customerId) => {
    dispatch(setModalState({
      selectedAddCommentCustomerId: customerId,
      addComment: true,
    }));
  };

  const handleCloseCommentsModal = () => {
    dispatch(setModalState({ showComments: false }));
  };

  const handleCloseAddCommentModal = () => {
    dispatch(setModalState({ addComment: false }));
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = () => {
    if (modalState.selectedAddCommentCustomerId && newComment.trim()) {
      dispatch(postCustomerComment(modalState.selectedAddCommentCustomerId, newComment));
      setNewComment('');
      dispatch(setModalState({ addComment: false }));
    } else {
      alert('Please select a customer and enter a comment.');
    }
  };

  if (loading) return <div>Loading funnel data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="funnel-container">
      <h3>Funnel Data</h3>
      {/* Search input */}
      <div>
        <input
          type="text"
          placeholder="Search by Company Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Funnel Data Table */}
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
      ){/* Pagination Controls */}
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

      {/* Show Comments Modal */}
      {modalState.showComments && Array.isArray(customerComments) && customerComments.length > 0 && (
        <div className="comments-modal">
          <h4>Customer Comments</h4>
          <p>Displaying {customerComments.length} comments</p>
          <textarea
            readOnly
            rows={5}
            value={customerComments.map((comment) => (
              `${comment.name}: ${comment.text}\nDate: ${new Date(comment.date).toLocaleString()}\n`
            )).join("\n")}
            style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}
          />
          <button onClick={handleCloseCommentsModal}>Close</button>
        </div>
      )}

      {/* Add Comment Modal */}
      {modalState.addComment && (
        <div className="comment-edit-modal">
          <h4>Add Comment</h4>
          <textarea
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Enter your comment here..."
            rows="5"
          />
          <div>
            <button onClick={handleSubmitComment}>Submit Comment</button>
            <button onClick={handleCloseAddCommentModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunnelSection;





























