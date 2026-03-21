import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityReport, resetActivityReport } from '../redux/slices/reportSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { Form } from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import { LuFileCheck2 } from "react-icons/lu";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import Select from "react-select";
import { useMemo } from "react";
import { IoIosWarning } from "react-icons/io";
import {
  FaTasks,
  FaBuilding,
  FaUserFriends,
  FaCalendarDay
} from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdArrowRight } from "react-icons/md";
import { MdArrowLeft } from "react-icons/md";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward  } from "react-icons/io";
import { HiHome } from "react-icons/hi";

const ReportSection = () => {
  const dispatch = useDispatch();
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [appliedActivities, setAppliedActivities] = useState([]);
  const [appliedCompanyName, setAppliedCompanyName] = useState('');
  const [viewMode, setViewMode] = useState("summary");
  const [groupMode, setGroupMode] = useState("table");
  const [openPanel, setOpenPanel] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [infoPanel, setInfoPanel] = useState({
  open: false,
  x: 0,
  y: 0,
  title: "",
  items: []
});
const [panelIndex, setPanelIndex] = useState(0);
const [panelActivities, setPanelActivities] = useState([]);
const [secondPanel, setSecondPanel] = useState({
  open: false,
  x: 0,
  y: 0,
  title: "",
  items: []
});
const [companyViewMode, setCompanyViewMode] = useState("company");
const [showCompanyMenu, setShowCompanyMenu] = useState(false);

const [activeActivityType, setActiveActivityType] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [reportGenerated, setReportGenerated] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [reportType] = useState('detailed');
  const [user, setUser] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 1000;

  const { activities, loading, totalPages, totalCount, error } = useSelector(state => state.report);
  const { users = [], loading: usersLoading, error: usersError } = useSelector(state => state.users);

  const currentUser = useSelector(state => state.user?.username);
  const isAdmin = useSelector(state => state.user?.role === 'admin');

  const activityOptions = useMemo(() => {
  const map = new Map();

  activities.forEach(act => {
    if (act.activity_type) {
      map.set(act.activity_type, {
        value: act.activity_type,
        label: act.activity_type,
      });
    }
  });

  return Array.from(map.values());
}, [activities]);


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
      
      dispatch(fetchActivityReport({
        startDate,
        endDate,
        reportType,
        user,
        page: pageNum,
        perPage
      }));
      setReportGenerated(true);
    }
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedActivities(selectedActivities);
    setAppliedCompanyName(companyName);
    
    setReportGenerated(true);

    fetchReportData(1);
    
    setViewMode("summary");   // 👈 Summary opens first
    setGroupMode("table");   // table still default inside View
  };

  // Pagination handler
  // const handlePageChange = (newPage) => {
  //   if (newPage < 1 || newPage > totalPages) return;
  //   setPage(newPage);
  //   fetchReportData(newPage);
  // };

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
// const filteredActivities = activities.filter(act => {
//   if (!companyName) return true; // no filter applied
//   return act.company_name?.toLowerCase().includes(companyName.toLowerCase());
// }); removed to add activity report filter

const filteredActivities = useMemo(() => {
  let data = [...activities];

  if (appliedCompanyName) {
    data = data.filter(act =>
      act.company_name
        ?.toLowerCase()
        .includes(appliedCompanyName.toLowerCase())
    );
  }

  if (appliedActivities.length > 0) {
    const selectedTypes = appliedActivities.map(a => a.value);
    data = data.filter(act =>
      selectedTypes.includes(act.activity_type)
    );
  }

  return data;
}, [activities, appliedCompanyName, appliedActivities]);

const summaryData = useMemo(() => {
  if (!reportGenerated || filteredActivities.length === 0) return null;

  const totalActivities = filteredActivities.length;

  const uniqueCompanies = new Set(
    filteredActivities
      .map(a => a.company_name)
      .filter(Boolean)
  ).size;

  const uniqueUsers = new Set(
    filteredActivities
      .map(a => a.insertBy)
      .filter(Boolean)
  ).size;

let totalQuoteCost = 0;
let totalInvoiceCost = 0;

filteredActivities.forEach(activity => {
  if (!activity.details) return;

  const parts = activity.details.split(",");

  let currentType = null;
  let currentAmount = 0;

  parts.forEach(raw => {
    const text = raw.trim();

    // Detect Quote
    if (text.startsWith("Quote ID:")) {
      currentType = "quote";
    }

    // Detect Invoice
    if (text.startsWith("Invoice Number:")) {
      currentType = "invoice";
    }

    // Capture Total Amount
    if (text.startsWith("Total Amount:")) {
      const amount = parseFloat(
        text.replace("Total Amount:", "").replace(/[^0-9.]/g, "")
      );

      if (!isNaN(amount)) {
        currentAmount = amount;

        if (currentType === "quote") {
          totalQuoteCost += currentAmount;
        }

        if (currentType === "invoice") {
          totalInvoiceCost += currentAmount;
        }
      }
    }
  });
});

  // Date range in days (inclusive)
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days =
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return {
    totalActivities,
    uniqueCompanies,
    uniqueUsers,
    totalQuoteCost,
    totalInvoiceCost,
    days
  };
}, [filteredActivities, reportGenerated, startDate, endDate]);

const groupedByUser = useMemo(() => {
  return filteredActivities.reduce((acc, item) => {
    if (!item.insertBy) return acc;
    acc[item.insertBy] = acc[item.insertBy] || [];
    acc[item.insertBy].push(item);
    return acc;
  }, {});
}, [filteredActivities]);

const groupedByCompany = useMemo(() => {
  return filteredActivities.reduce((acc, item) => {
    if (!item.company_name) return acc;
    acc[item.company_name] = acc[item.company_name] || [];
    acc[item.company_name].push(item);
    return acc;
  }, {});
}, [filteredActivities]);

const getUniqueCount = (arr, field) =>
  new Set(arr.map(a => a[field]).filter(Boolean)).size;

const getLastActivityGap = (arr) => {
  if (!arr || arr.length === 0) return "";

  const latestDate = arr
    .map(a => new Date(a.insertDate))
    .sort((a, b) => b - a)[0];

  const now = new Date();
  const diffMs = now - latestDate;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours   = Math.floor(diffMinutes / 60);
  const diffDays    = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return `${diffSeconds} sec${diffSeconds !== 1 ? "s" : ""} ago`;
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hr${diffHours !== 1 ? "s" : ""} ago`;
  }

  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
};

const extractDetailedIds = (activities, mode = "user") => {
  const quotes = [];
  const proformas = [];
  const invoices = [];

  activities.forEach(activity => {
    if (!activity.details) return;

    const parts = activity.details.split(",");

    let quoteId = null;
    let quoteTag = "-";

    let proformaId = null;
    let proformaTag = "-";

    let invoiceId = null;
    let invoiceTag = "-";

    let amount = "-";

    parts.forEach(raw => {
      const text = raw.trim();

      if (text.startsWith("Quote ID:"))
        quoteId = text.replace("Quote ID:", "").trim();

      if (text.startsWith("Quote Tag:"))
        quoteTag = text.replace("Quote Tag:", "").trim();

      if (text.startsWith("Proforma ID:") || text.startsWith("Proforma Number:"))
        proformaId = text.replace(/Proforma (ID|Number):/, "").trim();

      if (text.startsWith("Proforma Tag:"))
        proformaTag = text.replace("Proforma Tag:", "").trim();

      if (text.startsWith("Invoice Number:"))
        invoiceId = text.replace("Invoice Number:", "").trim();

      if (text.startsWith("Invoice Status:"))
        invoiceTag = text.replace("Invoice Status:", "").trim();

      if (text.startsWith("Total Amount:"))
        amount = text.replace("Total Amount:", "").trim();
    });

    if (quoteId) {
      quotes.push({
        id: quoteId,
        tag: quoteTag,
        amount,
        meta: mode === "user" ? activity.company_name : activity.insertBy
      });
    }

    if (proformaId) {
      proformas.push({
        id: proformaId,
        tag: proformaTag,
        amount,
        meta: mode === "user" ? activity.company_name : activity.insertBy
      });
    }

    if (invoiceId) {
      invoices.push({
        id: invoiceId,
        tag: invoiceTag,
        amount,
        meta: mode === "user" ? activity.company_name : activity.insertBy
      });
    }
  });

  return { quotes, proformas, invoices };
};

const countQuotesAndProformas = (items, mode) => {
  const { quotes, proformas, invoices } =
    extractDetailedIds(items, mode);

  return {
    totalQuotes: quotes.length,
    totalProformas: proformas.length,
    totalInvoices: invoices.length
  };
};

useEffect(() => {
  setSelectedActivities([]);
  setAppliedActivities([]);
  setReportGenerated(false);
  setOpenPanel(null);
  setGroupMode("table");
  setExpandedGroup(null);
}, [startDate, endDate]);

const guardDates = () => {
  if (!startDate || !endDate) {
    toast.warn("Please select Start Date and End Date, before applying the filter!", {
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
    return false;
  }
  return true;
};

useEffect(() => {
  return () => {
    dispatch(resetActivityReport());
  };
}, [dispatch]);


const groupByDate = (items) => {
  return items.reduce((acc, item) => {
    const dateKey = new Date(item.insertDate).toLocaleDateString();
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(item);
    return acc;
  }, {});
};

const formatDateRange = (start, end) => {
  if (!start || !end) return "";
  return `${new Date(start).toLocaleDateString()} → ${new Date(end).toLocaleDateString()}`;
};


const openInfoPanel = (e, title, items) => {
  e.stopPropagation();

  if (infoPanel.open && infoPanel.title === title) {
    setInfoPanel(prev => ({ ...prev, open: false }));
    return;
  }

  const PANEL_WIDTH = 280;
  const PANEL_HEIGHT = 320;
  const OFFSET = 12;

  // 🔥 IMPORTANT: get scroll container
  const container = document.querySelector(".report-section");
  const containerRect = container.getBoundingClientRect();

  // click position relative to container
  let x = e.clientX - containerRect.left + container.scrollLeft + OFFSET;
  let y = e.clientY - containerRect.top + container.scrollTop + OFFSET;

  // container visible area
  const viewRight = container.scrollLeft + container.clientWidth;
  const viewBottom = container.scrollTop + container.clientHeight;

  if (x + PANEL_WIDTH > viewRight) {
    x = x - PANEL_WIDTH - OFFSET * 2;
  }

  if (y + PANEL_HEIGHT > viewBottom) {
    y = y - PANEL_HEIGHT - OFFSET * 2;
  }

  const normalizedItems = items.map(item =>
    typeof item === "string"
      ? { label: "", value: item }
      : item
  );

  setInfoPanel({
    open: true,
    x,
    y,
    title,
    items: normalizedItems
  });
};

useEffect(() => {
  const close = () => {
   if (secondPanel.open) {
    setSecondPanel(prev => ({ ...prev, open: false }));
    setActiveActivityType(null);   // 🔥 reset highlight
  } else {
    setInfoPanel(prev => ({ ...prev, open: false }));
    setActiveActivityType(null);
  }
  };

  if (infoPanel.open || secondPanel.open) {
    window.addEventListener("click", close);
  }

  return () => window.removeEventListener("click", close);
}, [infoPanel.open, secondPanel.open]);

const closeAllPanels = () => {
  setInfoPanel(prev => ({ ...prev, open: false }));
  setSecondPanel(prev => ({ ...prev, open: false }));
  setActiveActivityType(null);
};

useEffect(() => {
  setExpandedGroup(null);
}, [groupMode]);

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
          <Col md={5}>
            <Form.Group className="form-group">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Company Name"
                value={companyName}
                onChange={(e) => {
                if (!guardDates()) return;
                setCompanyName(e.target.value);
              }}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="form-group">
              <Form.Label>User Name</Form.Label>
              <Form.Select
                value={user}
                onChange={(e) => {
                if (!guardDates()) return;
                setUser(e.target.value);
              }}
              >
                <option value="" disabled>Select User</option>
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
              <Col md={3}>
      <Form.Group className="form-group">
        <Form.Label>
          Activity Type
        </Form.Label>

        <Select
          isMulti
          isClearable       
          className="Report-select"
          classNamePrefix="Report"
          options={activityOptions}
          value={selectedActivities}
          onChange={(selected) => {
          if (!guardDates()) return;
          setSelectedActivities(selected || []);
        }}
          
          placeholder= "Select Activity Type(s)"
          menuPortalTarget={document.body}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9999 })
          }}
          noOptionsMessage={() =>
          reportGenerated
            ? "No activities found"
            : "No options yet — generate report first"
        }
        />
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
{reportGenerated && !loading && (
  <div className="panel-toggle-row">

    {/* SUMMARY BUTTON */}
   <button
    className={`panel-btn ${openPanel === "summary" ? "active" : ""}`}
    onClick={() => {
    const isClosing = openPanel === "summary";

    setOpenPanel(isClosing ? null : "summary");

    // ✅ RESET view state when summary opens
    if (!isClosing) {
      setGroupMode("table");
      setViewMode("summary");
      setExpandedGroup(null);
    }
  }}
>
  <span className="btn-text">Summary</span>
  <span className="btn-icon">
    {openPanel === "summary" ? <MdArrowLeft /> : <MdArrowRight /> }
  </span>
</button>

    {/* VIEW BUTTON */}
  <button
    className={`panel-btn ${openPanel === "view" ? "active" : ""}`}
    onClick={() => {
      setOpenPanel(openPanel === "view" ? null : "view");
      setViewMode("table"); 
    }}
  >
  <span className="btn-text">View</span>
  <span className="btn-icon">
    {openPanel === "view" ? <MdArrowLeft />  : <MdArrowRight /> }
  </span>
</button>

  </div>
)}

{openPanel === "summary" && (
<div className="summary-panel">
{reportGenerated && !loading && summaryData && viewMode === "summary" && (
  <div className="report-summary-bar">

    <span
      className="summary-item clickable"
      onClick={(e) => {
        if (infoPanel.open && infoPanel.title === "Activity Types") {
          // clicking again closes both
          setInfoPanel(prev => ({ ...prev, open: false }));
          setSecondPanel(prev => ({ ...prev, open: false }));
          setActiveActivityType(null);
          return;
        }
        
        closeAllPanels();
        const typeCountMap = {};

        filteredActivities.forEach(a => {
          if (a.activity_type) {
            typeCountMap[a.activity_type] =
              (typeCountMap[a.activity_type] || 0) + 1;
          }
        });

        const items = Object.entries(typeCountMap).map(([type, count]) => ({
          label: type,
          value: count
        }));

        openInfoPanel(e, "Activity Types", items);
        setSecondPanel(prev => ({ ...prev, open: false }));
        setActiveActivityType(null);
      }}
    >
      <FaTasks className="summary-icon pulse" />
      Activities <b>{summaryData.totalActivities}</b>
    </span>

   <span
      className="summary-item clickable"
      onClick={(e) =>
        {
        closeAllPanels();
        openInfoPanel(
          e,
          "Companies",
          [...new Set(filteredActivities.map(a => a.company_name).filter(Boolean))]
        )
      }}
    >
      <FaBuilding className="summary-icon float" />
      Companies <b>{summaryData.uniqueCompanies}</b>
    </span>

    <span
      className="summary-item clickable"
      onClick={(e) =>
        {
        closeAllPanels();
        openInfoPanel(
          e,
          "Users",
          [...new Set(filteredActivities.map(a => a.insertBy).filter(Boolean))]
        )
      }}
    >
      <FaUserFriends className="summary-icon pulse-delayed" />
      Users <b>{summaryData.uniqueUsers}</b>
    </span>

    <span className="summary-item">
    <FaArrowTrendUp className="summary-icon pulse" />
    Quotes Cost <b>₹ {summaryData.totalQuoteCost.toLocaleString()}</b>
    </span>

    <span className="summary-item">
      <FaArrowTrendUp className="summary-icon pulse" />
      Invoices Cost <b>₹ {summaryData.totalInvoiceCost.toLocaleString()}</b>
    </span>

    <span className="summary-item">
      <FaCalendarDay className="summary-icon float-delayed" />
      Days <b>{summaryData.days}</b>
    </span>
  </div>
)}
</div>
)}

{openPanel === "view" && !loading &&  (
  <div className="attached-panel view-panel">

    <div className="inner-view-toggle">
      <button
        className={groupMode === "table" ? "active" : ""}
        onClick={() => setGroupMode("table")}
      >
        Table
      </button>

      <button
        className={groupMode === "user" ? "active" : ""}
        onClick={() => setGroupMode("user")}
      >
        User
      </button>
<div
  className="company-menu-wrapper"
  onMouseEnter={() => setShowCompanyMenu(true)}
  onMouseLeave={() => {
    if (!companyViewMode) setShowCompanyMenu(false);
  }}
>
       <button
        className={groupMode === "company" ? "active" : ""}
        onClick={() => setShowCompanyMenu(true)}
      >
        Company
      </button>

  {showCompanyMenu && (
    <div className="company-submenu">
     <div
      className={`submenu-item ${
        groupMode === "company" && companyViewMode === "company" ? "active-submenu" : ""
      }`}
      onClick={() => {
        setGroupMode("company");
        setCompanyViewMode("company");
      }}
    >
      By Company
    </div>

    <div
      className={`submenu-item ${
        groupMode === "company" && companyViewMode === "date" ? "active-submenu" : ""
      }`}
      onClick={() => {
        setGroupMode("company");
        setCompanyViewMode("date");
      }}
    >
      By Date
    </div>
    </div>
  )}
  </div>
  </div>
  </div>
)}

{/* Home button (top) */}
{filteredActivities.length > 0 && page > 1 && (
  <div className="pagination-home-report">
    <button onClick={handleHomePage}>
      ⏮ Home
    </button>
  </div>
)}


{reportGenerated && groupMode === "table" && (
<div className="report-table">
  {filteredActivities.length > 0 ? (
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
  ) : reportGenerated && !loading && totalCount > 0 ? (
  // ✅ NEW: frontend filter removed everything
  <p className="no-activity-message">
    No matching activities for applied filters.
  </p>
) : reportGenerated && !loading && totalCount === 0 ? (
  // ✅ backend returned nothing
  <p className="no-activity-message">
    NO ACTIVITIES FOUND...
  </p>
) : null}

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

</div> )}

{/* User Mode */}
{reportGenerated && !loading && groupMode === "user" && (
 filteredActivities.length > 0 ? (
    <div className="grouped-container">
    {Object.entries(groupedByUser).map(([groupName, items]) => {
      const isOpen = expandedGroup === groupName; 

      return (
        <div key={groupName}  className={`group-card ${isOpen ? "active-group glass" : ""}`}>
  
  <div className="group-header">
    
    <h4 className="group-title">
      {groupName}
      <span className="group-date-range">
        {formatDateRange(startDate, endDate)}
      </span>
    </h4>

    <span
      className={`toggle-text ${isOpen ? "open" : ""}`}
      onClick={() =>
        setExpandedGroup(isOpen ? null : groupName)
      }
    >
      {isOpen ? (
        <>
          <MdArrowDropUp  className="toggle-icon" />
          Hide activities
        </>
      ) : (
        <>
          <MdArrowDropDown  className="toggle-icon" />
          Show {items.length} activities
        </>
      )}
    </span>
  </div>

  <div className="group-metrics">
  {(() => {
    const { totalQuotes, totalProformas, totalInvoices } =
      countQuotesAndProformas(items, "user");

    return (
      <>
        <div>
          Total Activities <b>{items.length}</b>
        </div>

        {/* ✅ keep this – USER needs companies */}
        <div
        className="metric-clickable"
        onClick={(e) =>
          openInfoPanel(
            e,
            "Companies",
            [...new Set(items.map(i => i.company_name).filter(Boolean))]
          )
        }
      >
        Unique Companies <b>{getUniqueCount(items, "company_name")}</b>
      </div>

        {/* ✅ new */}
        <div>
          Quotes <b>{totalQuotes}</b>
        </div>

        {/* ✅ new */}
        <div>
           Proformas <b>{totalProformas}</b>
        </div>

        <div>
           Invoices <b>{totalInvoices}</b>
        </div>

        <div
        className="metric-clickable"
        onClick={(e) => {
          const sortedItems = items
            .slice()
            .sort((a, b) => new Date(b.insertDate) - new Date(a.insertDate));

          setPanelActivities(sortedItems);
          setPanelIndex(0);

          openInfoPanel(
          e,
          "Last Activity",
          [
            { label: "Activity", value: sortedItems[0].activity_type },
            { label: "User", value: sortedItems[0].insertBy },
            { label: "Company", value: sortedItems[0].company_name },
            { label: "Date", value: new Date(sortedItems[0].insertDate).toLocaleString() },
            {
              label: "Details",
              value: sortedItems[0].details.split(",").map(d => d.trim())
            }
          ]
        );
        }}
      >
        Last Activity <b>{getLastActivityGap(items)}</b>
      </div>
      </>
    );
  })()}
</div>

          {isOpen && (
            <div className="group-details">
              {Object.entries(groupByDate(items)).map(([date, dayItems]) => {
  const { quotes, proformas, invoices } =
    extractDetailedIds(dayItems, "user");

  return (
    <div key={date} className="day-block">

{(() => {
  const { quotes, proformas, invoices } =
    extractDetailedIds(dayItems, "user");

  return (
    <h5 className="day-title">
      {date}
      <span className="day-counts">
        Quotes: <b>{quotes.length}</b> {" "}|{" "} 
        Proformas: <b>{proformas.length}</b> {" "}|{" "} 
        Invoices: <b>{invoices.length}</b>
      </span>
    </h5>
  );
})()}

      {quotes.length > 0 && (
        <table className="mini-table">
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Tag</th>
              <th>Amount</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q, i) => (
              <tr key={i}>
                <td>{q.id}</td>
                <td>{q.tag}</td>
                <td>₹ {q.amount}</td>
                <td>{q.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {proformas.length > 0 && (
        <table className="mini-table">
          <thead>
            <tr>
              <th>Proforma ID</th>
              <th>Tag</th>
              <th>Amount</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            {proformas.map((p, i) => (
              <tr key={i}>
                <td>{p.id}</td>
                <td>{p.tag}</td>
                <td>₹ {p.amount}</td>
                <td>{p.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {invoices.length > 0 && (
      <table className="mini-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Tag</th>
            <th>Amount</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={i}>
              <td>{inv.id}</td>
              <td>{inv.tag}</td>
              <td>₹ {inv.amount}</td>
              <td>{inv.meta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    </div>
  );
})}
            </div>
          )}
        </div>
      );
    })}
  </div>
): totalCount === 0 ? (
    <p className="no-activity-message-panel">
      NO ACTIVITIES FOUND...
    </p>
  ) : (
    <p className="no-activity-message-panel">
      No matching activities for applied filters.
    </p>
  )
)}

{/* Company Mode */}
{reportGenerated && !loading && groupMode === "company" && companyViewMode && (
 filteredActivities.length > 0 ? (
      <div
        key={`${groupMode}-${companyViewMode}`}
        className="company-view-wrapper view-transition"
      >
      {groupMode === "company" && companyViewMode === "company" && (
      <div className="grouped-container">

      {Object.entries(groupedByCompany).map(([groupName, items]) => {

      const isOpen = expandedGroup === groupName;

      return (

      <div key={groupName} className={`group-card ${isOpen ? "active-group glass" : ""}`}>

      {/* Header */}
      <div
      className="group-header"
      onClick={() => setExpandedGroup(isOpen ? null : groupName)}
      >

      <h4 className="group-title">
      {groupName}
      <span className="group-date-range">
      {formatDateRange(startDate,endDate)}
      </span>
      </h4>

      <span className={`toggle-text ${isOpen ? "open" : ""}`}>
      {isOpen ? (
      <>
      <MdArrowDropUp className="toggle-icon"/>
      Hide activities
      </>
      ) : (
      <>
      <MdArrowDropDown className="toggle-icon"/>
      Show {items.length} activities
      </>
      )}
      </span>

      </div>


      {/* Metrics SAME AS DATE MODE */}
      <div className="group-metrics">

      {(() => {

      const { totalQuotes,totalProformas, totalInvoices } =
      countQuotesAndProformas(items,"company");

      return (

      <>
      <div>
      Total Activities <b>{items.length}</b>
      </div>

      <div
      className="metric-clickable"
      onClick={(e)=>
      openInfoPanel(
      e,
      "Users",
      [...new Set(items.map(i=>i.insertBy).filter(Boolean))]
      )
      }
      >
      Unique Users <b>{getUniqueCount(items,"insertBy")}</b>
      </div>

      <div>
      Quotes <b>{totalQuotes}</b>
      </div>

      <div>
      Proformas <b>{totalProformas}</b>
      </div>
      
      <div>
      Invoices <b>{totalInvoices}</b>
      </div>

      <div
      className="metric-clickable"
      onClick={(e)=>{

      const sortedItems =
      items.slice().sort((a,b)=> new Date(b.insertDate)-new Date(a.insertDate));

      setPanelActivities(sortedItems);
      setPanelIndex(0);

      openInfoPanel(
      e,
      "Last Activity",
      [
      {label:"Activity",value:sortedItems[0].activity_type},
      {label:"User",value:sortedItems[0].insertBy},
      {label:"Company",value:sortedItems[0].company_name},
      {label:"Date",value:new Date(sortedItems[0].insertDate).toLocaleString()},
      {
      label:"Details",
      value:sortedItems[0].details.split(",").map(d=>d.trim())
      }
      ]
      );

      }}
      >
      Last Activity <b>{getLastActivityGap(items)}</b>
      </div>

      </>

      );

      })()}

      </div>


      {/* EXPANDED SECTION */}
      {isOpen && (

      <div className="group-details">

      {(() => {

      const tagMap = {};

      items.forEach(item => {

      if(!item.details) return;

      const parts = item.details.split(",");

      let quote=null;
      let proforma=null;
      let invoice=null;
      let tag=null;
      let amount=null;

      parts.forEach(p=>{

      const text=p.trim();

      if(text.startsWith("Quote ID:"))
      quote=text.replace("Quote ID:","").trim();

      if(text.startsWith("Quote Tag:"))
      tag=text.replace("Quote Tag:","").trim();

      if(text.startsWith("Proforma ID:") || text.startsWith("Proforma Number:"))
      proforma=text.replace(/Proforma (ID|Number):/,"").trim();

      if(text.startsWith("Proforma Tag:"))
      tag=text.replace("Proforma Tag:","").trim();

      if(text.startsWith("Invoice Number:"))
      invoice=text.replace("Invoice Number:","").trim();

      if(text.startsWith("Invoice Status:"))
      tag=text.replace("Invoice Status:","").trim();

      if(text.startsWith("Total Amount:"))
      amount=text.replace("Total Amount:","").trim();

      });

      const safeTag = tag || "NO TAG";

      if(!tagMap[safeTag])
      tagMap[safeTag] = { quotes:[], proformas:[], invoices:[] };

      const meta={
        amount,
        timestamp:new Date(item.insertDate).toLocaleString(),
        user:item.insertBy
      };

      if(quote) tagMap[safeTag].quotes.push({id:quote,...meta});
      if(proforma) tagMap[safeTag].proformas.push({id:proforma,...meta});
      if(invoice) tagMap[safeTag].invoices.push({id:invoice,...meta});
      });


      const sortedTags =
      Object.entries(tagMap).sort((a,b)=>{

      const getLatest=(x)=>
      Math.max(...[
      ...x.quotes,
      ...x.proformas,
      ...x.invoices
      ].map(i=>new Date(i.timestamp)));

      return getLatest(b[1])-getLatest(a[1]);

      });


      return (

      <table className="company-view-table">

      <thead>
      <tr>
      <th>Tag</th>
      <th>Quote</th>
      <th>Proforma</th>
      <th>Invoice</th>
      </tr>
      </thead>

      <tbody>

      {sortedTags.map(([tag,data])=>(
      <tr key={tag}>

      <td className="tag-cell"><strong>{tag}</strong></td>

      <td>
      {data.quotes.map((q,i)=>(
      <div key={i} className="doc-cell">
      <b className="doc-id">{q.id}</b>
      <div className="doc-tag">{tag}</div>
      <div className="doc-price">{q.amount}</div>
      <div className="doc-meta">
        <span className="meta-date">{q.timestamp}</span>
        <span className="meta-user">{q.user}</span>
      </div>
      </div>
      ))}
      </td>

      <td>
      {data.proformas.map((p,i)=>(
      <div key={i} className="doc-cell">
      <b className="doc-id">{p.id}</b>
      <div className="doc-tag">{tag}</div>
      <div className="doc-price">{p.amount}</div>
      <div className="doc-meta">
        <span className="meta-date">{p.timestamp}</span>
        <span className="meta-user">{p.user}</span></div>
      </div>
      ))}
      </td>

      <td>
      {data.invoices.map((inv,i)=>(
      <div key={i} className="doc-cell">
      <b className="doc-id">{inv.id}</b>
      <div className="doc-tag">{tag}</div>
      <div className="doc-price">{inv.amount}</div>
      <div className="doc-meta">
        <span className="meta-date">{inv.timestamp}</span>
        <span className="meta-user">{inv.user}</span>
      </div>
      </div>
      ))}
      </td>

      </tr>
      ))}

      </tbody>

      </table>

      );

      })()}

      </div>

      )}

      </div>

      );

      })}

      </div>
      )}
  
{groupMode === "company" && companyViewMode === "date" && (
    <div className="grouped-container">
    {Object.entries(groupedByCompany).map(([groupName, items]) => {
      const isOpen = expandedGroup === groupName; 
      return (
        <div key={groupName}  className={`group-card ${isOpen ? "active-group glass" : ""}`}>
          <div
            className="group-header"
            onClick={() =>
              setExpandedGroup(isOpen ? null : groupName)
            }
          >
            <h4 className="group-title">
      {groupName}
      <span className="group-date-range">
        {formatDateRange(startDate, endDate)}
      </span>
    </h4>

           <span className={`toggle-text ${isOpen ? "open" : ""}`}>
        {isOpen ? (
          <>
            <MdArrowDropUp className="toggle-icon" />
            Hide activities
          </>
        ) : (
          <>
            <MdArrowDropDown className="toggle-icon" />
            Show {items.length} activities
          </>
        )}
      </span>

          </div>

          <div className="group-metrics">
  {(() => {
    const { totalQuotes, totalProformas, totalInvoices } =
      countQuotesAndProformas(items, "company");

    return (
      <>
        <div>
          Total Activities <b>{items.length}</b>
        </div>

        <div
        className="metric-clickable"
        onClick={(e) =>
          openInfoPanel(
            e,
            "Users",
            [...new Set(items.map(i => i.insertBy).filter(Boolean))]
          )
        }
      >
        Unique Users <b>{getUniqueCount(items, "insertBy")}</b>
      </div>
          
        <div>
          Quotes <b>{totalQuotes}</b>
        </div>

        <div>
          Proformas <b>{totalProformas}</b>
        </div>
  
        <div>
        Invoices <b>{totalInvoices}</b>
        </div>

        <div
        className="metric-clickable"
        onClick={(e) => {
          const sortedItems = items
            .slice()
            .sort((a, b) => new Date(b.insertDate) - new Date(a.insertDate));

          setPanelActivities(sortedItems);
          setPanelIndex(0);

          openInfoPanel(
          e,
          "Last Activity",
          [
            { label: "Activity", value: sortedItems[0].activity_type },
            { label: "User", value: sortedItems[0].insertBy },
            { label: "Company", value: sortedItems[0].company_name },
            { label: "Date", value: new Date(sortedItems[0].insertDate).toLocaleString() },
            {
              label: "Details",
              value: sortedItems[0].details.split(",").map(d => d.trim())
            }
          ]
        );
        }}
      >
        Last Activity <b>{getLastActivityGap(items)}</b>
      </div>
      </>
    );
  })()}
</div>

          {isOpen && (
            <div className="group-details">
              {Object.entries(groupByDate(items)).map(([date, dayItems]) => {
  const { quotes, proformas, invoices } =
    extractDetailedIds(dayItems, "company");

  return (
    <div key={date} className="day-block">

{(() => {
  const { quotes, proformas, invoices  } =
    extractDetailedIds(dayItems, "company");

  return (
    <h5 className="day-title">
      {date}
      <span className="day-counts">
        Quotes: <b>{quotes.length}</b>  {" "}|{" "} 
        Proformas: <b>{proformas.length}</b>  {" "}|{" "} 
        Invoices: <b>{invoices.length}</b>
      </span>
    </h5>
  );
})()}

      {quotes.length > 0 && (
        <table className="mini-table-company">
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Tag</th>
              <th>Amount</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q, i) => (
              <tr key={i}>
                <td>{q.id}</td>
                <td>{q.tag}</td>
                <td>₹ {q.amount}</td>
                <td>{q.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {proformas.length > 0 && (
        <table className="mini-table-company">
          <thead>
            <tr>
              <th>Proforma ID</th>
              <th>Tag</th>
              <th>Amount</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {proformas.map((p, i) => (
              <tr key={i}>
                <td>{p.id}</td>
                <td>{p.tag}</td>
                <td>₹ {p.amount}</td>
                <td>{p.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {invoices.length > 0 && (
        <table className="mini-table-company">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Tag</th>
              <th>Amount</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i}>
                <td>{inv.id}</td>
                <td>{inv.tag}</td>
                <td>₹ {inv.amount}</td>
                <td>{inv.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
})}
            </div>
          )}
        </div>
      );
    })}
  </div> 
  )}
  </div>
) : totalCount === 0 ? (
    <p className="no-activity-message-panel">
      NO ACTIVITIES FOUND...
    </p>
  ) : (
    <p className="no-activity-message-panel">
      No matching activities for applied filters.
    </p>
  )
)}

{infoPanel.open && (
  <div
   className={`floating-info-panel ${
      infoPanel.title === "Last Activity" ? "" : "wide-panel"
    }`}
    style={{
      top: infoPanel.y,
      left: infoPanel.x,
      width: infoPanel.title === "Activity Types" ? "280px" :
             infoPanel.title === "Last Activity" ? "420px" :
             "300px"
    }}
  onClick={(e) => e.stopPropagation()}
>
    <div className="info-panel-header">
      {infoPanel.title}
    </div>

{infoPanel.title !== "Activity Records" && (
    <ul className="info-panel-list">
    {infoPanel.items.map((item, idx) => (
     <li
      key={idx}
      className={`clickable-row ${
        activeActivityType === item.label ? "active-row" : ""
      }`}
       style={{
        cursor:
          infoPanel.title === "Activity Types"
            ? "pointer"
            : "default"
      }}
      onClick={(e) => {
        if (infoPanel.title !== "Activity Types") return;

        e.stopPropagation();

        const selectedType = item.label;

        // 🔥 If clicking same type again → close second panel
        if (activeActivityType === selectedType) {
          setSecondPanel(prev => ({ ...prev, open: false }));
          setActiveActivityType(null);
          return;
        }

        setActiveActivityType(selectedType);

        const matchingRecords = filteredActivities.filter(
          a => a.activity_type === selectedType
        );

        const detailedRows = matchingRecords.map(a => {

        let id = "-";
        let tag = "-";
        let amount = "-";

        if (a.details) {
          const parts = a.details.split(",");

          parts.forEach(p => {
            const text = p.trim();

            /* QUOTE */
            if (text.startsWith("Quote ID:"))
              id = text.replace("Quote ID:", "").trim();

            if (text.startsWith("Quote Tag:"))
              tag = text.replace("Quote Tag:", "").trim();

            /* PROFORMA */
            if (text.startsWith("Proforma Number:") || text.startsWith("Proforma ID:"))
              id = text.replace(/Proforma (Number|ID):/, "").trim();

            if (text.startsWith("Proforma Tag:"))
              tag = text.replace("Proforma Tag:", "").trim();

            /* INVOICE */
            if (text.startsWith("Invoice Number:"))
              id = text.replace("Invoice Number:", "").trim();

            if (text.startsWith("Invoice Status:"))
              tag = text.replace("Invoice Status:", "").trim();

            /* AMOUNT */
            if (text.startsWith("Total Amount:"))
              amount = text.replace("Total Amount:", "").trim();
          });
        }

        return {
          id,
          tag,
          amount,
          company: a.company_name,
          user: a.insertBy
        };
      });

        setSecondPanel({
          open: true,
          x: infoPanel.x + 300,
          y: infoPanel.y,
          title: `${selectedType} Records`,
          items: detailedRows
        });
      }}
    >
      {infoPanel.title === "Activity Types" ? (
  <>
    <strong>{item.label}</strong> &nbsp; — &nbsp; {item.value}
  </>
) : (
  <>
    {item.label && (
      <strong className="info-label">{item.label}:</strong>
    )}

    {Array.isArray(item.value) ? (
      <div className="info-multi-lines">
        {item.value.map((v, i) => (
          <div key={i}>{v}</div>
        ))}
      </div>
    ) : (
      <span>{item.value}</span>
    )}
  </>
)}
    </li>
    ))}
  </ul>
)}

    {/* ⬅ / ➡ Navigation ONLY for Last Activity */}
{infoPanel.title === "Last Activity" && panelActivities.length > 1 && (
  <>
    {/*HOME (top center) */}
    <button
      className={`panel-home-btn ${panelIndex === 0 ? "disabled" : ""}`}
      disabled={panelIndex === 0}
      title="Go to first activity"
      onClick={() => {
        if (panelIndex === 0) return;

        setPanelIndex(0);
        setInfoPanel(prev => ({
          ...prev,
          items: [
                  { label: "Activity", value: panelActivities[0].activity_type },
                  { label: "User", value: panelActivities[0].insertBy },
                  { label: "Company", value: panelActivities[0].company_name },
                  { label: "Date", value: new Date(panelActivities[0].insertDate).toLocaleString() },
                  {
                    label: "Details",
                    value: panelActivities[0].details.split(",").map(d => d.trim())
                  }
                ]
        }));
      }}
    >
    <HiHome />
    </button>

    {/* ⬅ LEFT (vertically centered) */}
    <button
      className="panel-arrow left"
      onClick={() => {
        const newIndex =
          (panelIndex - 1 + panelActivities.length) %
          panelActivities.length;

        setPanelIndex(newIndex);
        setInfoPanel(prev => ({
          ...prev,
          items: [
                  { label: "Activity", value: panelActivities[newIndex].activity_type },
                  { label: "User", value: panelActivities[newIndex].insertBy },
                  { label: "Company", value: panelActivities[newIndex].company_name },
                  { label: "Date", value: new Date(panelActivities[newIndex].insertDate).toLocaleString() },
                  {
                    label: "Details",
                    value: panelActivities[newIndex].details.split(",").map(d => d.trim())
                  }
                ]
        }));
      }}
    >
    <IoIosArrowBack />
    </button>

    {/* ➡ RIGHT (vertically centered) */}
    <button
      className="panel-arrow right"
      onClick={() => {
        const newIndex =
          (panelIndex + 1) % panelActivities.length;

        setPanelIndex(newIndex);
        setInfoPanel(prev => ({
          ...prev,
          items: [
                  { label: "Activity", value: panelActivities[newIndex].activity_type },
                  { label: "User", value: panelActivities[newIndex].insertBy },
                  { label: "Company", value: panelActivities[newIndex].company_name },
                  { label: "Date", value: new Date(panelActivities[newIndex].insertDate).toLocaleString() },
                  {
                    label: "Details",
                    value: panelActivities[newIndex].details.split(",").map(d => d.trim())
                  }
                ]
        }));
      }}
    >
    <IoIosArrowForward />
    </button>

    {/* 🔢 EXISTING COUNTER (UNCHANGED LOGIC) */}
    <div className="panel-page-indicator">
      {panelIndex + 1} / {panelActivities.length}
    </div>
  </>
)}
  </div>
)}


{secondPanel.open && (
  <div
    className="floating-info-panel wide-panel"
    style={{ top: secondPanel.y, left: secondPanel.x }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="info-panel-header">
      {secondPanel.title}
    </div>

    <div className="activity-records-table">
      <table className="second-panel-table-for-activity">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tag</th>
            <th>Amount</th>
            <th>Company</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {secondPanel.items.map((row, i) => (
            <tr key={i}>
              <td>{row.id}</td>
              <td>{row.tag}</td>
              <td>₹ {row.amount}</td>
              <td>{row.company}</td>
              <td>{row.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

    </div>
  );
};

export default ReportSection;