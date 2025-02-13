

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadFunneldata, loadCustomerComments, postCustomerComment } from '../redux/slices/funnelSlice';
import { setModalState } from '../redux/slices/funnelSlice';

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
    <div>
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
      {funnelData && Array.isArray(funnelData) && funnelData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {funnelData.map((item) => (
              <tr key={item._id}>
                <td>{item.companyName}</td>
                <td>{item.address}</td>
                <td>{item.primaryEmail}</td>
                <td>{item.mobileNumber}</td>
                <td>{item.website}</td>
                <td>
                  <button onClick={() => handleShowComments(item._id)}>Show Comments</button>
                  <button onClick={() => handleAddComment(item._id)}>Add Comment</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
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





























