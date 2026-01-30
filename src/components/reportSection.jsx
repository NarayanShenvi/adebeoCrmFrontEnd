import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityReport } from '../redux/slices/reportSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { Form } from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import { LuFileCheck2 } from "react-icons/lu";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const ReportSection = () => {
  const dispatch = useDispatch();

  const today = new Date().toISOString().split("T")[0];
  const [reportGenerated, setReportGenerated] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [reportType, setReportType] = useState('short');
  const [user, setUser] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { activities, loading, totalPages, totalCount, error } = useSelector(state => state.report);
  const { users = [], loading: usersLoading, error: usersError } = useSelector(state => state.users);

  const currentUser = useSelector(state => state.user?.username);
  const isAdmin = useSelector(state => state.user?.role === 'admin');

  // Default to current user if not admin
  useEffect(() => {
    if (!user && !isAdmin) {
      setUser(currentUser);
    }
  }, [user, currentUser, isAdmin]);

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Prevent future dates
  const handleStartDateChange = (e) => {
  const selectedDate = e.target.value.split("T")[0]; // remove time if any
    if (selectedDate > today) {
      toast.warn("You cannot select a future date!");
      e.target.value = startDate;
      return;
    }
    setStartDate(selectedDate);
      setEndDate(''); // reset end date whenever start date changes

  };

const handleEndDateChange = (e) => {
  if (!startDate) {
    toast.warn("Please select Start Date first!");
    e.target.value = ''; // reset end date
    return;
  }
  const selectedDate = e.target.value;
  if (selectedDate > today) {
    toast.warn("You cannot select a future date!");
    e.target.value = endDate;
    return;
  }
  if (selectedDate < startDate) {
    toast.warn("End Date cannot be before Start Date!");
    e.target.value = endDate;
    return;
  }
  setEndDate(selectedDate);
};

  // Fetch report
  const fetchReportData = (pageNum = 1) => {
    if (startDate && endDate) {
      setReportGenerated(true);
      dispatch(fetchActivityReport({
        startDate,
        endDate,
        companyName,
        reportType,
        user,
        page: pageNum,
        perPage
      }));
    }
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReportData(1);
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchReportData(newPage);
  };
const handleHomePage = () => {
  setPage(1);
  fetchReportData(1);
};

  // Client-side filtering for companyName (optional if backend doesn't support partial match)
  // Apply company name filter on frontend (case-insensitive)
  // Add this before return()
const filteredActivities = activities.filter(act => {
  if (!companyName) return true; // no filter applied
  return act.company_name?.toLowerCase().includes(companyName.toLowerCase());
});

  return (
    <div className='report-section'>
      <h3>Activity Report</h3>
<ToastContainer />
      {/* Filter Form */}
      <Form onSubmit={handleSubmit} className='filter-form'>
        {/* Start & End Date */}
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
      max={today} // can't select future
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
      max={today} // can't select future
      min={startDate || ''} // can't select before start date
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
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter company name"
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
                <option value="">Select a user</option>
                {usersLoading ? (
                  <option>Loading users...</option>
                ) : usersError ? (
                  <option>Error loading users</option>
                ) : (
                  users.map(u => (
                    <option key={u.username} value={u.username}>{u.username}</option>
                  ))
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Form.Group className="form-group">
              <Form.Label className="invisible">&nbsp;</Form.Label>
              <button type="submit" className="report-button" title='Generate Report'>
                <LuFileCheck2 className='filecheck'/>
              </button>
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <br /><br />

      {/* Loading & Error */}
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

      {/* Report Table */}
{/* Home button (top) */}
{filteredActivities.length > 0 && page > 1 && (
  <div className="pagination-home-report">
    <button onClick={handleHomePage}>
      ⏮ Home
    </button>
  </div>
)}

<div className="report-table">
  {reportType === 'detailed' && companyName ? (
    <p className="no-activity-message-short">
      Cannot generate a Detailed report with Company name filter. Please select 'Short' Report Type.
    </p>
  ) : filteredActivities.length > 0 ? (
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
        {filteredActivities.map((activity, index) => (
          <tr key={index}>
            <td>{activity.insertBy}</td>
            <td>{activity.company_name}</td>
            <td>{activity.activity_type}</td>
            <td>
              {activity.details.split(",").map((item, idx) => (
                <span key={idx}>{item}<br /></span>
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
{/* Pagination */}
{filteredActivities.length > 0 && totalPages > 1 && (
  <div className="pagination-controls">
    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
      <FaChevronLeft /> 
    </button>
    <span className='page-quote'>{page} of {totalPages}</span>
    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
      <FaChevronRight />
    </button>
  </div>
)}

</div>

    </div>
  );
};

export default ReportSection;
