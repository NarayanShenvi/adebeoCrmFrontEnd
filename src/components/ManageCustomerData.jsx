// src/components/ManageCustomerData.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  fetchCustomerAsync,
  setSelectedCustomer,
  resetSelectedCustomer,
  clearCustomers,
} from "../redux/slices/customerSlice";
import {
  loadFunneldata,
  updateCustomerStatusAndAssignment,
  clearFunnelState,
} from "../redux/slices/funnelSlice";
import { fetchUsers } from "../redux/slices/userSlice";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import "./dashboard/Dashboard.css";
import { HiSave } from "react-icons/hi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify"; 
import { BiSolidMessageRoundedError } from "react-icons/bi";
import { IoIosWarning } from "react-icons/io";
import { BiSolidCommentCheck } from "react-icons/bi";

const ManageCustomerData = () => {
  const dispatch = useDispatch();
  const location = useLocation(); // <-- used to detect route changes

  const {
    customers = [],
    loading: customersLoading,
    selectedCustomer,
  } = useSelector((state) => state.customers);

  const funnel = useSelector((state) => state.funnel);
  const { funnelData = [], loading: funnelLoading, pagination = {} } = funnel;
  const { currentPage: funnelCurrent = 1, totalPages = 1 } = pagination;
const [selectedCustomerId, setSelectedCustomerId] = useState("");
const [localSearchLoading, setLocalSearchLoading] = useState(false);

  const { users = [], loading: usersLoading } = useSelector(
    (state) => state.users
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [localPage, setLocalPage] = useState(1);
  const perPage = 5;

  const [checkedRows, setCheckedRows] = useState({});
  const [rowAssignment, setRowAssignment] = useState({});
  const [rowStatus, setRowStatus] = useState({});
  const [popupRowId, setPopupRowId] = useState(null);
  const [isSubmittingRow, setIsSubmittingRow] = useState({});
  const searchDebounceRef = useRef(null);

  // --------------------------
  // Robust clear: runs on mount and on route change/unmount
  // --------------------------
  useEffect(() => {
    const clearAllLocalAndRedux = () => {
      // Redux clears
      dispatch(resetSelectedCustomer());
      dispatch(clearCustomers());
      dispatch(clearFunnelState());

      // Local component clears
      setSearchQuery("");
      setLocalPage(1);
      setCheckedRows({});
      setRowAssignment({});
      setRowStatus({});
      setPopupRowId(null);
      setIsSubmittingRow({});

      // Clear debounce
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };

    // Clear immediately on mount (ensures fresh state even if component wasn't unmounted earlier)
    clearAllLocalAndRedux();

    // Cleanup to run when route changes or when component unmounts.
    return () => {
      // clear again when navigating away
      dispatch(resetSelectedCustomer());
      dispatch(clearCustomers());
      dispatch(clearFunnelState());
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
    // Use location.pathname so cleanup runs on navigation even if component stays mounted in layout
  }, [dispatch, location.pathname]);

  // Fetch users once
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Debounced customer search
 useEffect(() => {
  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

  const trimmedQuery = searchQuery.trim();

  if (trimmedQuery.length < 3) {
    dispatch(clearCustomers());
    setLocalSearchLoading(false);
    return;
  }

  setLocalSearchLoading(true); // start search

  searchDebounceRef.current = setTimeout(async () => {
    try {
      await dispatch(fetchCustomerAsync(trimmedQuery));
    } finally {
      setLocalSearchLoading(false); // search done
    }
  }, 450);

  return () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
  };
}, [searchQuery, dispatch]);


  // When selectedCustomer changes, load funnel data and reset local controls for rows
  useEffect(() => {
    if (selectedCustomer && selectedCustomer.companyName) {
      setCheckedRows({});
      setRowAssignment({});
      setRowStatus({});
      setPopupRowId(null);
      setIsSubmittingRow({});
      dispatch(loadFunneldata(1, perPage, selectedCustomer.companyName));
      setLocalPage(1);
    }
  }, [selectedCustomer, dispatch]);

  const usernameList = useMemo(() => users.map((u) => u.username), [users]);

const handleSearchChange = (e) => {
  const val = e.target.value;
  setSearchQuery(val);

  // Clear previous search results immediately
  dispatch(clearCustomers());
};

  const handleCustomerSelect = (e) => {
    const id = e.target.value;
    const cust = customers.find((c) => c._id === id) || null;
    dispatch(setSelectedCustomer(cust));
  };

  const toggleRowCheckbox = (rowId) => {
    setCheckedRows((prev) => {
      const copy = { ...prev };
      if (copy[rowId]) delete copy[rowId];
      else copy[rowId] = true;
      return copy;
    });
  };

  const handleAssignmentChange = (rowId, value) => {
    setRowAssignment((prev) => ({ ...prev, [rowId]: value }));
  };

  const handleStatusChange = (rowId, value) => {
    setRowStatus((prev) => ({ ...prev, [rowId]: value }));
  };

  const openSubmitPopup = (rowId) => {
    if (!checkedRows[rowId]) {
      toast.warn("Please check the row first before submitting.", {
                                            position: "top-right",
                                            toastClassName: "toast-warn-zfix",
                                            autoClose: 4000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: "colored", // "light", "dark", or "colored"
                                             style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                              fontSize: "14px",       // ✅ Change font size
                                              fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                              fontWeight: "bold",    // ✅ Make text bold
                                             },
                                             icon: <IoIosWarning  
                                             style={{ fontSize: '25px', color: 'white' }} />
                                        });
      return;
    }
    if (!rowAssignment[rowId] || !rowStatus[rowId]) {
      toast.warn("Please select both, User and Status before submitting.", {
                                            position: "top-right",
                                            toastClassName: "toast-warn-zfix",
                                            autoClose: 4000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: "colored", // "light", "dark", or "colored"
                                             style: { background: "rgba(187, 184, 9, 1)", color: "white", 
                                              fontSize: "14px",       // ✅ Change font size
                                              fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                              fontWeight: "bold",    // ✅ Make text bold
                                             },
                                             icon: <IoIosWarning  
                                             style={{ fontSize: '25px', color: 'white' }} />
                                        });
      return;
    }
    setPopupRowId(rowId);
  };

  const confirmSubmit = async (row) => {
  setIsSubmittingRow((s) => ({ ...s, [row._id]: true }));
  try {
    const assignedTo = rowAssignment[row._id];
    const status = rowStatus[row._id];

    const payload = {
      companyName: row.companyName,
      isEnabled: status === "enable",
      assigned_to: assignedTo,
    };

    const res = await dispatch(updateCustomerStatusAndAssignment(payload)).unwrap();
    toast.success(`Customer ${row.companyName} updated`, {
                                            position: "top-right",
                                            toastClassName: "toast-warn-zfix",
                                            autoClose: 4000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: "colored", // "light", "dark", or "colored"
                                            style: { background: "rgba(74, 163, 66, 1)", color: "white", 
                                              fontSize: "14px",       // ✅ Change font size
                                              fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                              fontWeight: "bold",    // ✅ Make text bold
                                             },
                                             icon: <BiSolidCommentCheck  
                                             style={{ fontSize: '20px', color: 'white' }} />
                                        });

    // ✅ Update Assigned By locally (so UI reflects immediately)
    const updatedFunnel = funnelData.map((item) =>      
      item._id === row._id
      ? { 
           ...item, 
           insertBy: assignedTo,
           assigned_to: assignedTo,
           isEnabled: status === "enable" // keep local status also
         } : item
    );
    dispatch({ type: "funnel/setFunnelData", payload: updatedFunnel });

    setRowAssignment((prev) => {
      const updated = { ...prev };
      delete updated[row._id];
      return updated;
    });

    setRowStatus((prev) => {
      const updated = { ...prev };
      delete updated[row._id];
      return updated;
    });
    
    // Close popup
    setPopupRowId(null);

    // ✅ Uncheck row after submit but keep selections
    setCheckedRows((prev) => {
      const updated = { ...prev };
      delete updated[row._id];
      return updated;
    });

    // Reload funnel data to reflect backend changes
    dispatch(
      loadFunneldata(localPage, perPage, selectedCustomer?.companyName || "")
    );
  } catch (err) {
    console.error("Submit error", err);
    toast.error(err || "Failed to update customer", {
                                            autoClose: 4000,
                                            toastClassName: "toast-warn-zfix",
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: "colored", // "light", "dark", or "colored"
                                            style: { background: "rgba(252, 61, 61, 0.88)", color: "white", 
                                              fontSize: "14px",       // ✅ Change font size
                                              fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                              fontWeight: "bold",    // ✅ Make text bold
                                             },
                                             icon: <BiSolidMessageRoundedError  
                                             style={{ fontSize: '20px', color: 'white' }} />
                                        });
  } finally {
    setIsSubmittingRow((s) => ({ ...s, [row._id]: false }));
  }
};

  const cancelSubmitPopup = () => setPopupRowId(null);

  const handlePrevPage = () => {
    const prev = Math.max(1, localPage - 1);
    setLocalPage(prev);
    dispatch(
      loadFunneldata(prev, perPage, selectedCustomer?.companyName || "")
    );
  };
  const handleNextPage = () => {
    const next = localPage + 1;
    setLocalPage(next);
    dispatch(
      loadFunneldata(next, perPage, selectedCustomer?.companyName || "")
    );
  };
  const handleHomePage = () => {
  setLocalPage(1);
  dispatch(
    loadFunneldata(
      1,
      perPage,
      selectedCustomer?.companyName || ""
    )
  );
};

  
useEffect(() => {
  setSelectedCustomerId(""); // reset dropdown whenever search results change
}, [customers, dispatch]);

  return (
    <div className="manage-customer-data">
      <h3>Manage Customer Data</h3>
            <ToastContainer />

      <div>
  <input
    type="text"
    className="search-field-customer-status"
    placeholder="Search by Company name"
    value={searchQuery}
    onChange={handleSearchChange}
  />
  <div className="search-field1-customer-status">
  {searchQuery.length >= 3 ? (
  localSearchLoading || customersLoading ? (
    <p className="CustomerStatusLoading">Loading...</p>
  ) : customers.length > 0 ? (
    <select
      value={selectedCustomerId}
      onChange={(e) => {
        const id = e.target.value;
        setSelectedCustomerId(id);
        handleCustomerSelect(e);
      }}
    >
      <option value="" disabled>Select a customer</option>
      {customers.map((c) => (
        <option key={c._id} value={c._id}>{c.companyName}</option>
      ))}
    </select>
  ) : (
    <p className="NoCustomerStatusFound">No customers found...</p>
  )
) : searchQuery.length > 0 && searchQuery.length < 3 ? (
  <p className="TypeMoreCustData">Type at least 3 characters to search</p>
) : null}

</div>

</div>
      {funnelLoading ? (
        <div style={{
            fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: "15px",
            color: "#026875ff",
            textAlign: "center",
            marginTop: "10%",
          }}>Loading funnel data...</div>
      ) : funnelData && funnelData.length > 0 ? (
        <>   
        {localPage > 1 && (
      <div className="pagination-home-custstatus">
        <button onClick={handleHomePage}>
          ⏮ Home
        </button>
      </div>
       )}
            <table className="customer-status-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Customer Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Assigned By</th>
                  <th>Assign To</th>
                  <th>Status</th>
                  <th>Submit</th>
                </tr>
              </thead>
              <tbody>
                {funnelData
                  .filter((item) =>
                    selectedCustomer
                      ? item.companyName === selectedCustomer.companyName
                      : true
                  )
                  .map((item) => {
                    const rowId = item._id;
                    const isChecked = !!checkedRows[rowId];
                    return (
                      <tr key={rowId} className={isChecked ? "editable" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            className="custom-checkbox-customer-status"
                            checked={isChecked}
                            onChange={() => toggleRowCheckbox(rowId)}
                          />
                        </td>
                        <td>{item.companyName}</td>
                        <td>{item.address}</td>
                        <td>{item.mobileNumber}</td>
                        <td>{item.primaryEmail}</td>
                        <td>{item.assigned_to || item.insertBy}</td>
                        <td>
                          <select
                            value={rowAssignment[rowId] || ""}
                            onChange={(e) =>
                              handleAssignmentChange(rowId, e.target.value)
                            }
                            disabled={!isChecked || usersLoading}
                            className="select-user-customer-status"
                          >
                            <option value="">-- Select user --</option>
                            {users.map((u) => (
                              <option key={u.username} value={u.username}>
                                {u.username}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <select
                            value={rowStatus[rowId] || ""}
                            onChange={(e) =>
                              handleStatusChange(rowId, e.target.value)
                            }
                            disabled={!isChecked}
                            className="select-status-customer-status"
                          >
                            <option value="">-- Select status --</option>
                            <option value="enable">Enable</option>
                            <option value="disable">Disable</option>
                          </select>
                        </td>

                        <td>
                          <button
                            className="submit-btn-customer-status"
                            onClick={() => openSubmitPopup(rowId)}
                            disabled={!isChecked || isSubmittingRow[rowId]}
                          >
                            <HiSave size={24} title="Submit" className="NewProduct" />
                          </button>

                          {popupRowId === rowId && (
                            <div className="disable-popup">
                              <div className="popup-icon">
                                <FaExclamationTriangle />
                              </div>
                              <p>
                                Are you sure you want to{" "}
                                <strong>{rowStatus[rowId]}</strong> customer{" "}
                                <strong>{item.companyName}</strong>? Shall I
                                submit?
                              </p>
                              <div className="popup-actions">
                                <button
                                  onClick={() => confirmSubmit(item)}
                                  className="popup-confirm-btn"
                                  disabled={isSubmittingRow[rowId]}
                                >
                                  <FaCheck /> Confirm
                                </button>
                                <button
                                  onClick={cancelSubmitPopup}
                                  className="popup-cancel-btn"
                                >
                                  <FaTimes /> Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <div className="pagination-controls-custstatus">
              <button onClick={handlePrevPage} disabled={localPage === 1}>
                <FaChevronLeft />
              </button>
              <span className="page-custstatus">
                Page {localPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={localPage >= (totalPages || 1)}
              >
                <FaChevronRight />
              </button>
            </div>
        </>
      ) : selectedCustomer ? (
        <p style={{
            fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: "15px",
            color: "#db6c03",
            textAlign: "center",
            marginTop: "10%",
          }}>No data available for{" "}
          {selectedCustomer.customerName || selectedCustomer.customer_name}.</p>
      ) : (
        <p style={{
            fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: "19px",
            color: "#026875ff",
            textAlign: "center",
            marginTop: "10%",
          }}>
          Search and select a customer to load their records.
        </p>
      )}
    </div>
  );
};

export default ManageCustomerData;
