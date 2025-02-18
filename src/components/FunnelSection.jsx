import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadFunneldata, loadCustomerComments, postCustomerComment } from '../redux/slices/funnelSlice';
import { setModalState } from '../redux/slices/funnelSlice';
import { FaEye, FaPlusSquare, FaTasks, FaChevronLeft, FaChevronRight } from "react-icons/fa"; //import statements are changed and some new imports are added
import { FaHandHoldingDollar, FaIndianRupeeSign, FaFileCircleCheck, FaFaceMeh  } from "react-icons/fa6";
import './dashboard/Dashboard.css'; // Import the CSS fil
import { MdOutlineCancel } from "react-icons/md";
import { HiSave } from "react-icons/hi";


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
    }, 800);

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
  
  if (loading) return <div className='loading'>Loading funnel data...</div>;//changes made.. classnames were added
  if (error) return <div className='error'>Error: {error}</div>;//changes made

  return (
    
    <div className="funnel-container">
      <h3>My Funnel</h3>
      <br></br>
      <input
          type="text"
          placeholder="Search by Customer Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='search_company'/>  
          {/* changes made--searchbar classname */}

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
      {/* changes made--icons */}
    <FaEye onClick={() => handleShowComments(item._id)} title="View Comments" className="action-icon" />
    <FaPlusSquare onClick={() => handleAddComment(item._id)} title="Add Comment" className="action-icon" />

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
        // changes made -- classname added
        <p className="no-data">No data available</p> 
        
      )}

      {/* Show Comments Modal */}
      {/* Show Comments Modal changed  to show no data msg */}
{modalState.showComments && (
  <div className="comments-modal">
    <h4>Customer Comments</h4>
    
    {Array.isArray(customerComments) && customerComments.length > 0 ? (
      <>
        <p className='displaycomments'>Displaying {customerComments.length} comments</p>
        <textarea
          readOnly
          rows={5}
          value={customerComments.map((comment) => (
            `${comment.name}: ${comment.text}\nDate: ${new Date(comment.date).toLocaleString()}\n`
          )).join("\n")} 
        />
      </>
    ) : (
      <p className='nocomments'>No comments available... <FaFaceMeh /></p>
       // Message when no comments exist
    )}<div className='cancel'>
    <MdOutlineCancel onClick={handleCloseCommentsModal} title='Cancel' className='cancelcomment'/>
    </div>
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
          <MdOutlineCancel onClick={handleCloseAddCommentModal} title='Cancel' className='cancelcomment'/>{/* changes made--icons are added */}
          <HiSave onClick={handleSubmitComment} title='Submit' className='submitcomment'/>            
          </div>
          <p className="alert-box">Comment saved successfully! ✅</p>{/* changes made-- alertbox to show successfull submit */}
        </div>
      )}
    </div>
  );
};

export default FunnelSection;


