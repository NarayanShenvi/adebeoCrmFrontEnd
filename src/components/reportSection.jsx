import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityReport } from '../redux/slices/reportSlice'; // Path for your Redux slice
import { fetchUsers } from '../redux/slices/userSlice'; // Import the users fetch action

const ReportSection = () => {
  const dispatch = useDispatch();

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
    <div>
      <h2>Activity Report</h2>

      {/* Filter section at the top */}
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="filter-item">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="filter-item">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className="filter-item">
          <label>Company Name</label>
          <input
            type="text"
            placeholder="Search company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label>Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="short">Short</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        <div className="filter-item">
          <label>User</label>
          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
          >
            {/* Admin can see all users, else just show current user */}
            {usersLoading ? (
              <option>Loading users...</option>
            ) : usersError ? (
              <option>Error loading users</option>
            ) : (
              users.map((user) => (
                <option key={user.username} value={user.username}>{user.username}</option>
              ))
            )}
          </select>
        </div>

        {/* Submit button to fetch report */}
        <button type="submit">Generate Report</button>
      </form>

      {/* Loading and error state */}
      {loading && <p>Loading report...</p>}
      {error && <p>Error: {error}</p>}

      {/* Report table section */}
      <div className="report-table">
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
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <tr key={index}>
                  <td>{activity.insertBy}</td>
                  <td>{activity.company_name}</td>
                  <td>{activity.activityType}</td>
                  <td>{activity.details}</td>
                  <td>{new Date(activity.insertDate).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No activities found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>{page} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportSection;
