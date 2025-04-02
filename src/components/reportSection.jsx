import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityReport } from '../redux/slices/reportSlice'; // Path for your Redux slice
import { fetchUsers } from '../redux/slices/userSlice'; // Import the users fetch action
import { Form } from 'react-bootstrap';
import Select from 'react-select'; // Import react-select
import { Row, Col } from 'react-bootstrap';
import { LuFileCheck2 } from "react-icons/lu";
import {  FaChevronLeft, FaChevronRight } from "react-icons/fa"; //import statements are changed and some new imports are added

const ReportSection = () => {
  const dispatch = useDispatch();

  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const [reportGenerated, setReportGenerated] = useState(false); // Track if the report is generated

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      alert("You cannot select a future date!");
      e.target.value = startDate; // Reset to the previous value
      return;
    }
    setStartDate(selectedDate);
  };
  
  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      alert("You cannot select a future date!");
      e.target.value = endDate; // Reset to the previous value
      return;
    }
    setEndDate(selectedDate);
  };
  // State for the filter inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [reportType, setReportType] = useState('short');
  const [user, setUser] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;  // Items per page for pagination

  // Redux state to manage the report data
  const { activities, loading, totalPages, totalCount, error } = useSelector(state => state.report);

  // Redux state to manage user data
  const { users = [], loading: usersLoading, error: usersError } = useSelector(state => state.users); // Default to empty array

  // Fetch the current user's username and role from the user slice (handle undefined safely)
  const currentUser = useSelector(state => state.user?.username);  // Using optional chaining to avoid errors if state.user is undefined
  const isAdmin = useSelector(state => state.user?.role === 'admin'); // Using optional chaining to avoid errors if state.user is undefined

  // If the user is an admin, allow them to select any user, else only show the current user
  useEffect(() => {
    if (!user && !isAdmin) {
      setUser(currentUser);  // If no user is selected and user is not admin, default to current user
    }
  }, [user, currentUser, isAdmin]);

  // Fetch users when the component mounts
  useEffect(() => {
    console.log("Dispatching fetchUsers action...");
    dispatch(fetchUsers());
  }, [dispatch]);

  // Fetch the report data when the submit button is clicked
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit button clicked. Fetching report...");
    setPage(1);  // Reset to page 1 on filter change

    // Fetch the report based on the filter values
    if (startDate && endDate) {
      console.log("Dispatching fetchActivityReport with filters:", { startDate, endDate, companyName, reportType, user, page, perPage });
      dispatch(fetchActivityReport({
        startDate,
        endDate,
        companyName,
        reportType,
        user,
        page,
        perPage
      }));
    }
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    console.log("Changing page to:", newPage);
    setPage(newPage);
  };

  return (
    <div className='report-section'>
      <h3>Activity Report</h3>

      {/* Filter section at the top */}
      <Form onSubmit={handleSubmit} className='filter-form'>
      <Row className="g-3 align-items-center">
  <Col xs="auto">
    <Form.Label className="required-label">Start Date:</Form.Label>
  </Col>
  <Col>
    <Form.Control
      type="date"
      value={startDate}
      onChange={handleStartDateChange}
      required
      className="dates"
      max={today} // Prevents future date selection in UI
    />
  </Col>
  <Col xs="auto" className='datess'>
    <Form.Label className="required-label">End Date:</Form.Label>
  </Col>
  <Col>
    <Form.Control
      type="date"
      value={endDate}
      onChange={handleEndDateChange}
      required
      className="dates"
      max={today} // Prevents future date selection in UI
    />
  </Col>
</Row>

    <Row className="g-4">
  
  <Col md={3}>
    <Form.Group className="form-group">
      <Form.Label>Report Type</Form.Label>
      <Form.Select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      > 
        <option value="">Select Report Type</option>
        <option value="short">Short</option>
        <option value="detailed">Detailed</option>
      </Form.Select>
    </Form.Group>
  </Col>
  <Col md={5}>
    <Form.Group className="form-group">
      <Form.Label >Company Name</Form.Label>          
      <Form.Control
        type="text"
        placeholder="Search company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
    </Form.Group>
  </Col>
  <Col md={3}>
    <Form.Group className="form-group">
      <Form.Label>User Name</Form.Label>
      <Form.Select
  value={user}
  onChange={(e) => setUser(e.target.value)}
>
  <option value="">Select a user</option> {/* Default empty option */}
  {usersLoading ? (
    <option>Loading users...</option>
  ) : usersError ? (
    <option>Error loading users</option>
  ) : (
    users.map((user) => (
      <option key={user.username} value={user.username}>
        {user.username}
      </option>
    ))
  )}
</Form.Select>

    </Form.Group>
  </Col>
  <Col  md={1}>
    <Form.Group className="form-group">
      <Form.Label className="invisible">&nbsp;</Form.Label> {/* Keeps button aligned */}
      <button type="submit" className="report-button" title='Generate Report'><LuFileCheck2 className='filecheck'/>
      </button>
    </Form.Group>
  </Col>
</Row>
      </Form><br></br><br></br>

     {/* Loading and error state */}
     {loading && (
    <div className="loading-container-report">
      <div className="loading-spinner-report"></div>
      <p className="loading-message-report">Loading report...</p>
  </div>
)}

{error && (
    <div className="error-container-report">
      <i className="bi bi-exclamation-triangle-fill error-icon-report"></i>
      <p className="error-message-report">Error: {error}</p>
  </div>
)}


      {/* Report table section */}
      <div className="report-table">
        {activities.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Company Name</th>
                <th>Activity Type</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={index}>
                  <td>{activity.insertBy}</td>
                  <td>{activity.company_name}</td>
                  <td>{activity.activityType}</td>
                  <td>
                    {activity.details.split(",").map((item, index) => (
                      <span key={index}>
                        {item}
                        <br />
                      </span>
                    ))}
                  </td>
                  <td>{new Date(activity.insertDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          reportGenerated && !loading && (
            <p className="no-activity-message">NO ACTIVITIES FOUND...</p>
          )
        )}

        {/* Pagination */}
        {activities.length > 0 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <FaChevronLeft /> 
          </button>
          <span className='page-quote'>{page} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            <FaChevronRight />
          </button>
        </div> )}
      </div>
    </div>
  );
};

export default ReportSection;
