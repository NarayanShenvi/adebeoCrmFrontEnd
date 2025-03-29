import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadFunneldata, loadCustomerComments, postCustomerComment } from '../redux/slices/funnelSlice';
import { setModalState } from '../redux/slices/funnelSlice';
import { FaEye, FaPlusSquare, FaTasks, FaChevronLeft, FaChevronRight } from "react-icons/fa"; //import statements are changed and some new imports are added
import { FaHandHoldingDollar, FaIndianRupeeSign, FaFileCircleCheck, FaFaceMeh  } from "react-icons/fa6";
import './dashboard/Dashboard.css'; // Import the CSS fil
import { MdOutlineCancel } from "react-icons/md";
import { HiSave } from "react-icons/hi";
import QuoteSlider from './QuoteSlider'; // Adjust the path if needed
import InvoiceSlider from './InformationSlider'; // Adjust the path if needed
import POInvoiceSlider from './POInvoiceSlider'; // Adjust the path if needed
import { RiInformation2Fill } from "react-icons/ri";


const FunnelSection = () => {
  const dispatch = useDispatch();
  const [selectedCustomerId, setSelectedCustomerId] = useState(null); // Track selected customer changes made
 
//tableref part removed
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8); // Set default rows per page to 5
  const [currentPage, setCurrentPage] = useState(1);

  const [showQuoteSlider, setShowQuoteSlider] = useState(false);
  const [showInvoiceSlider, setShowInvoiceSlider] = useState(false); // New state for slider
  const [showPOInvoiceSlider, setShowPOInvoiceSlider] = useState(false); // New state for slider

const sliderRef = useRef(null); // Create a ref for the slider
  const commentsRef = useRef(null); //changes made - bugs free
  const addCommentRef = useRef(null);//changes made - bugs free  

  const funnelData = useSelector((state) => state.funnel.funnelData);
  const loading = useSelector((state) => state.funnel.loading);
  const error = useSelector((state) => state.funnel.error);
  const customerComments = useSelector((state) => state.funnel.customerComments);
  const modalState = useSelector((state) => state.funnel.modalState);

  const [totalPages, setTotalPages] = useState(1);
 
  // Calculate page boundaries based on rows per page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = funnelData.slice(indexOfFirstRow, indexOfLastRow);

  // Handle pagination changes
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Recalculate total pages based on rows per page
  useEffect(() => {
    setTotalPages(Math.ceil(funnelData.length / rowsPerPage));
  }, [funnelData, rowsPerPage]);

  // Update page if the currentPage exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value)); // Set the new value for rowsPerPage
    setCurrentPage(1); // Reset to the first page when changing rows per page
  };

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
      dispatch(loadFunneldata(1, rowsPerPage, debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, dispatch, rowsPerPage]);

  // Fetch customer comments only if they haven't been fetched already
  const fetchCommentsIfNeeded = (customerId) => {
    const existingComments = customerComments.find(
      (comment) => comment.customerId === customerId
    );
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
    if (modalState.selectedAddCommentCustomerId && newComment.trim()) {
      dispatch(postCustomerComment(modalState.selectedAddCommentCustomerId, newComment));
      setNewComment('');
      dispatch(setModalState({ addComment: false }));
    } else {
      alert('Please select a customer and enter a comment.');
    }
  };
  
  const handleShowQuotes = (customerId) => {
    dispatch(setModalState({
      showQuoteSlider: true,
      selectedQuoteCustomerId: customerId
    }));
  };
  
  
  
  const handleCloseQuotes = () => {
    dispatch(setModalState({
      showQuoteSlider: false,
      selectedQuoteCustomerId: null
    }));
  };


  const handleShowInvoice = (customerId) => {
    dispatch(setModalState({
      showInvoiceSlider: true,
      selectedInvoiceCustomerId: customerId
      
    }));
  };
  
  const handleCloseInvoice = () => {
    dispatch(setModalState({
      showInvoiceSlider: false,
      selectedInvoiceCustomerId: null
    }));
  };
  

  const handleShowPOInvoice = (customerId) => {
    dispatch(setModalState({
      showPOInvoiceSlider: true,
      selectedPOInvoiceCustomerId: customerId
    }));
  };
  
  const handleClosePOInvoice = () => {
    dispatch(setModalState({
      showPOInvoiceSlider: false,
      selectedPOInvoiceCustomerId: null
    }));
  };
  
  

  // Close slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        dispatch(setModalState({ showQuoteSlider: false, selectedQuoteCustomerId: null }));
      }
    };
  
    if (modalState.showQuoteSlider) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalState.showQuoteSlider, dispatch]);
  
  
  if (loading) return <div className='loading'>Loading funnel data...</div>;//changes made.. classnames were added
  if (error) return <div className='error'>Error: {error}</div>;//changes made

  return (
    // tableref removed
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
     <table className="funnel-table" >
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
            <tr
            key={item._id}
            onClick={() => setSelectedCustomerId(item._id)}
            className={selectedCustomerId === item._id ? 'selected-customer' : ''}
          >
           
   <td>{item.insertDate}</td>
   <td>{item.companyName}</td>
   <td>{item.address}</td>
   <td>{item.area}</td>
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
     <FaHandHoldingDollar 
  title="Quotes" 
  className="action-icon" 
  onClick={() => handleShowQuotes(item._id)} // Pass customer ID
/>
     
     <FaIndianRupeeSign title=" Porforma Invoice" className="action-icon"   onClick={() => handleShowPOInvoice(item._id)} // Pass customer ID 
     />
     <RiInformation2Fill   title=" Customer Information" className="action-icon"    onClick={() => handleShowInvoice(item._id)} // Pass customer ID
     />
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
            {/* changes made from Show Comments Modal */}
{modalState.showComments && !modalState.addComment && (
  <div className="comments-modal-container" ref={commentsRef}>
    <div className="comments-modal" >
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
      )}
      <div className='cancel'>
        <MdOutlineCancel onClick={handleCloseCommentsModal} title='Cancel' className='cancelcomment'/>
      </div>
    </div>
  </div>
)}

{/* Add Comment Modal */}
{modalState.addComment && !modalState.showComments && (
  <div className="comment-edit-modal-container"  ref={addCommentRef}>
    <div className="comment-edit-modal">
      <h4>Add Comment</h4>
      <textarea
        value={newComment}
        onChange={handleCommentChange}
        placeholder="Enter your comment here..."
        rows="5"
      />
      <div>
        <MdOutlineCancel onClick={handleCloseAddCommentModal} title='Cancel' className='cancelcomment'/>
        <HiSave onClick={handleSubmitComment} title='Submit' className='submitcomment'/>
      </div>
      <p className="alert-box">Comment saved successfully! ✅</p>
    </div>
  </div>
)}
{/* to here Add Comment Modal -- bugs free */}

    {modalState.showQuoteSlider && modalState.selectedQuoteCustomerId && (
  <QuoteSlider 
    customerId={modalState.selectedQuoteCustomerId} 
    onClose={handleCloseQuotes} 
  />
)}
{modalState.showInvoiceSlider && modalState.selectedInvoiceCustomerId && (
  <InvoiceSlider 
    customerId={modalState.selectedInvoiceCustomerId} 
    onClose={handleCloseInvoice} 
  />
)}
{modalState.showPOInvoiceSlider && modalState.selectedPOInvoiceCustomerId && (
  <POInvoiceSlider 
    customerId={modalState.selectedPOInvoiceCustomerId} 
    onClose={handleClosePOInvoice} 
  />
)}



    </div>
  );
};

export default FunnelSection;

