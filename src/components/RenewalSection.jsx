  import React, { useState, useEffect, useRef, useMemo } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import axios from "axios";
  import { Form, Row, Col } from "react-bootstrap";
  import { LuFileCheck2 } from "react-icons/lu";
  import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

  import {
  fetchRenewalReport,
  resetRenewalReport,
  postRenewalComment
} from "../redux/slices/renewalSlice";

  import { fetchUsers } from "../redux/slices/userSlice";
  import { fetchCustomerAsync, clearCustomers } from "../redux/slices/customerSlice"; // adjust path/names if different
  import { setProductToEdit, updateProductAsync, fetchProductsAsync, addProductAsync } from '../redux/slices/productSlice';
  import Select from "react-select";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { ToastContainer } from "react-toastify"; 
  import { BiSolidMessageRoundedError } from "react-icons/bi";
  import { IoIosWarning } from "react-icons/io";
  import { FaEye, FaPlusSquare } from "react-icons/fa";
  import { MdOutlineCancel } from "react-icons/md";
  import { HiSave } from "react-icons/hi";
  import { FaFaceMeh } from "react-icons/fa6";  

  const RenewalReport = () => {
    const dispatch = useDispatch();
  
    // Dates
    const today = new Date().toISOString().split("T")[0];
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Filters
    const [selectedCustomerId, setSelectedCustomerId] = useState([]);
    const [selectedCustomerObj, setSelectedCustomerObj] = useState([]); // full object if you need
    const [selectedProductId, setSelectedProductId] = useState([]);
    const [selectedProductObj, setSelectedProductObj] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);

    // Search UI state - Customers
    const [searchQuery, setSearchQuery] = useState("");
    const [localSearchLoading, setLocalSearchLoading] = useState(false);
    const searchDebounceRef = useRef(null);

    // Products search state (single products only)
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedSearchValue, setSelectedSearchValue] = useState("");
    const [activeRowId, setActiveRowId] = useState(null);
    const tableRef = useRef(null);
    
    // Pagination & report
    const [page, setPage] = useState(1);
    const [reportGenerated, setReportGenerated] = useState(false);
    // Redux slices
  const {
  renewalReports = [],
  renewalLoading,
  totalCount,
  renewalError,
} = useSelector((state) => state.renewal);


    const { users = [], loading: usersLoading } = useSelector((state) => state.users);
    const { customers = [], loading: customersLoading } = useSelector(
      (state) => state.customers || {}
    ); // adjust if customers slice key differs

    // Get current user & role if needed (keeps behavior similar to your ReportSection)
    const currentUser = useSelector((state) => state.user?.username);
    const isAdmin = useSelector((state) => state.user?.role === "admin");

    const [useReportFilters, setUseReportFilters] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
    customerId: [],
    customerObj: [],
    productId:[],
    productObj: [],
    user: [],
  });

      const [modalState, setModalState] = useState({
      showComments: false,
      addComment: false,
      selectedRenewalId: null,
      commentsData: [],
    });

    const [newComment, setNewComment] = useState("");
    const commentsRef = useRef(null);
    const addCommentRef = useRef(null);
    const { renewalComments = [] } = useSelector((state) => state.renewal);

    const handleShowComments = (renewalId) => {
      const selectedRow = renewalReports.find(
        (r) =>
          `${r["Proforma #"]}_${r["Order #"]}` === renewalId
      );

      setActiveRowId(renewalId); // ⭐ highlight row

      setModalState({
        showComments: true,
        addComment: false,
        selectedRenewalId: renewalId,
        commentsData: selectedRow?.Comments || [],
      });
    };

    const handleAddComment = (renewalId) => {
      setActiveRowId(renewalId); // ⭐ highlight row

      setModalState({
        showComments: false,
        addComment: true,
        selectedRenewalId: renewalId,
      });
    };

    const handleCloseCommentsModal = () => {
    setActiveRowId(null); // ⭐ remove highlight

    setModalState({
      showComments: false,
      addComment: false,
      selectedRenewalId: null,
    });
  };

  const handleCloseAddCommentModal = () => {
    setActiveRowId(null); // ⭐ remove highlight

    setModalState({
      showComments: false,
      addComment: false,
      selectedRenewalId: null,
    });
  };

  const handleSubmitComment = (e) => {
  if (e) e.preventDefault();

  console.log("Renewal ID:", modalState.selectedRenewalId);
  console.log("Comment value:", newComment);

  if (
    modalState.selectedRenewalId &&
    newComment &&
    newComment.trim() !== ""
  ) {

    dispatch( 
      postRenewalComment({
        renewal_id: modalState.selectedRenewalId,
        comment: newComment.trim(),
      })
    );

    setNewComment("");

    setModalState({
      showComments: false,
      addComment: false,
      selectedRenewalId: null,
    });

    toast.success("Comment saved successfully!");

  } else {

    console.log("Validation failed");

    toast.error("Please enter a comment!");

  }
};

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };
  
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
    

    // Default user selection if not admin
    useEffect(() => {
      dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
      if (!selectedUser && !isAdmin && currentUser) {
        setSelectedUser(currentUser);
      }
    }, [selectedUser, isAdmin, currentUser]);

    // --- Date handlers & validations ---
    const handleStartDateChange = (e) => {
      const selected = e.target.value;
      // if (selected > today) {
      //   toast.warn("You cannot select a future Date!!", {
      //                                               position: "top-right",
      //                                               toastClassName: "toast-warn-zfix",
      //                                               autoClose: 4000,
      //                                               hideProgressBar: false,
      //                                               closeOnClick: true,
      //                                               pauseOnHover: true,
      //                                               draggable: true,
      //                                               progress: undefined,
      //                                               theme: "colored", // "light", "dark", or "colored"
      //                                                style: { background: "rgba(187, 184, 9, 1)", color: "white", 
      //                                                 fontSize: "14px",       // ✅ Change font size
      //                                                 fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
      //                                                 fontWeight: "bold",    // ✅ Make text bold
      //                                                },
      //                                                icon: <IoIosWarning  
      //                                                style={{ fontSize: '25px', color: 'white' }} />
      //                                           });
      //   return;
      // }
      setStartDate(selected);
      // Clear end date whenever start date changes (as you requested earlier)
      setEndDate("");
      // Also clear previous generated report flag
      setReportGenerated(false);

      // Also clear filters selection visual state? keep filters as is
    };

    const handleEndDateChange = (e) => {
      if (!startDate) {
        toast.warn("Please select Start Date first!", {
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
      const selected = e.target.value;
      // if (selected > today) {
      //   toast.warn("You cannot select a future Date!!", {
      //                                               position: "top-right",
      //                                               toastClassName: "toast-warn-zfix",
      //                                               autoClose: 4000,
      //                                               hideProgressBar: false,
      //                                               closeOnClick: true,
      //                                               pauseOnHover: true,
      //                                               draggable: true,
      //                                               progress: undefined,
      //                                               theme: "colored", // "light", "dark", or "colored"
      //                                                style: { background: "rgba(187, 184, 9, 1)", color: "white", 
      //                                                 fontSize: "14px",       // ✅ Change font size
      //                                                 fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
      //                                                 fontWeight: "bold",    // ✅ Make text bold
      //                                                },
      //                                                icon: <IoIosWarning  
      //                                                style={{ fontSize: '25px', color: 'white' }} />
      //                                           });
      //   return;
      // }
      if (selected < startDate) {
        toast.warn("End Date cannot be before Start Date!", {
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
      setEndDate(selected);
      setReportGenerated(false);
    };

    // --- Fetch report ---
    const fetchReportData = (pageNum = 1) => {
    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date", {
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

    setReportGenerated(true);

    dispatch(
    fetchRenewalReport({
      startDate,
      endDate,
      customerId: selectedCustomerId || undefined,
      productId: selectedProductId || undefined,
      user: selectedUser || undefined,
    })
  );

  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date", {
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

    // ✅ ALWAYS RESET TO PAGE 1
    setPage(1);

    // ✅ APPLY FILTERS
    setAppliedFilters({
      customerId: selectedCustomerId,
      customerObj: selectedCustomerObj,
      productId: selectedProductId,
      productObj: selectedProductObj,
      user: selectedUser,
    });

    setReportGenerated(true);

    // ✅ FETCH PAGE 1
    fetchReportData(1);
  };
  useEffect(() => {
    setPage(1);
  }, [useReportFilters]);

    // When any filter changes (customer/product/user) — auto refetch only if date range is present
  
    // Pagination handler
    const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > frontendTotalPages) return;
      setPage(newPage);
    };
     useEffect(() => {
      setPage(1);
    }, [appliedFilters]);

    // -----------------------
    // Customer search debounce (uses Redux slice fetchCustomerAsync & clearCustomers)
    // -----------------------
    useEffect(() => {
      const trimmedQuery = searchQuery.trim();

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }

      if (trimmedQuery.length < 3) {
        dispatch(clearCustomers());
        setLocalSearchLoading(false);
        return;
      }

      setLocalSearchLoading(true);
      searchDebounceRef.current = setTimeout(async () => {
        try {
          await dispatch(fetchCustomerAsync(trimmedQuery));
        } catch (err) {
          // swallow - slice should handle
        } finally {
          setLocalSearchLoading(false);
        }
      }, 450);

      return () => {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
          searchDebounceRef.current = null;
        }
      };
    }, [searchQuery, dispatch]);

    const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    // 🔴 IF USER CLEARS / BACKSPACES SEARCH
    if (val.trim() === "") {
      setSelectedCustomerId("");
      setSelectedCustomerObj(null);
      dispatch(clearCustomers()); // optional but good
    } else {
      dispatch(clearCustomers());
    }
  };


    const handleCustomerSelect = (e) => {
    const id = e.target.value;

    // ⛔ No dates → warn & CLEAR selection
    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date before applying Customer filter.", {
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

      setSelectedCustomerId("");
      setSelectedCustomerObj(null);
      setSearchQuery("");
      dispatch(clearCustomers());

      return;
    }

    // ✅ Dates exist → allow selection
     const cust = customers.find((c) => c._id === id);

  setSelectedCustomerId(id ? [id] : []);
  setSelectedCustomerObj(cust ? [cust] : []);
  };


  // -----------------------
  // Product search (single products only) — USING REDUX ONLY
  // -----------------------

  const { products: allProducts = [], loading: productsLoading } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProductsAsync()); // load once
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    // Filter single products only (no comboCode)
    const filtered = allProducts
      .filter((p) => !p.comboCode)
      .filter(
        (p) =>
          p.productName &&
          p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    setSearchResults(filtered);
  }, [searchTerm, allProducts]);

  const handleSelectProduct = (e) => {
    const value = e.target.value;
    const prod = searchResults.find((p) => p._id === value) || null;

    // ⛔ No dates → warn & CLEAR selection
    if (!startDate || !endDate) {
      toast.warn("Please select Start Date and End Date before applying Product filter.", {
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

      setSelectedSearchValue("");
      setSelectedProductId("");
      setSelectedProductObj(null);
      setSearchTerm("");

      return;
    }

    // ✅ Dates exist → allow selection
  setSelectedSearchValue(value);
  setSelectedProductId(prod ? [prod._id] : []);
  setSelectedProductObj(prod ? [prod] : []);
  };


  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const debounceProd = setTimeout(() => {
      const filtered = allProducts
        .filter((p) => !p.comboCode)
        .filter(
          (p) =>
            p.productName &&
            p.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setSearchResults(filtered);
      setSearchLoading(false);
    }, 450); // same debounce delay as customer search

    return () => clearTimeout(debounceProd);
  }, [searchTerm, allProducts]);


    // -----------------------
    // Derived username list for any UI needs
    // -----------------------

    const usernameList = useMemo(() => users.map((u) => u.username), [users]);
    
    const userOptions = users.map(u => ({ value: u.username, label: u.username }));

    // Dynamic table headers logic:
    // const hideCustomerColumn = !!selectedCustomerId; // hide only when customer filter applied
    // const hideProductColumn = !!selectedProductId;   // hide only when product filter applied


  const filteredRenewalReports = useMemo(() => {
    let data = [...renewalReports];

// ✅ CUSTOMER FILTER
if (appliedFilters.customerObj && appliedFilters.customerObj.length > 0) {

  const customerNames = appliedFilters.customerObj.map(c =>
    (c.companyName || "").toLowerCase()
  );

  data = data.filter(row =>
    row.Customer &&
    customerNames.some(name =>
      row.Customer.toLowerCase().includes(name)
    )
  );
}


// ✅ PRODUCT FILTER
if (appliedFilters.productObj && appliedFilters.productObj.length > 0) {

  const productNames = appliedFilters.productObj.map(p =>
    (p.productName || "").toLowerCase()
  );

  data = data.filter(row =>
    row.Product &&
    productNames.some(name =>
      row.Product.toLowerCase().includes(name)
    )
  );
}

// ✅ USER FILTER (multi-select)
if (appliedFilters.user && appliedFilters.user.length > 0) {
  const userNames = appliedFilters.user.map(u => u.toLowerCase());
  data = data.filter(row =>
    row["User"] &&
    userNames.includes(row["User"].toLowerCase())
  );
}

    return data;
  }, [renewalReports, appliedFilters]);

const perPage = 3000; // max rows per page
const frontendTotalPages = Math.ceil(filteredRenewalReports.length / perPage);

  const paginatedRenewalReports = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredRenewalReports.slice(start, end);
  }, [filteredRenewalReports, page]);

 useEffect(() => {
  return () => {
    dispatch(resetRenewalReport()); // cleanup on unmount
  };
}, []);


  const reportCustomerOptions = useMemo(() => {
    const map = new Map();

    renewalReports.forEach((row) => {
      const name = row["Customer"];
      if (name) {
        map.set(name, { value: name, label: name });
      }
    });

    return Array.from(map.values());
  }, [renewalReports]);

  const reportProductOptions = useMemo(() => {
    const map = new Map();

    renewalReports.forEach((row) => {
      const name = row["Product"];
      if (name) {
        map.set(name, { value: name, label: name });
      }
    });

    return Array.from(map.values());
  }, [renewalReports]);

  const reportUserOptions = useMemo(() => {
    const map = new Map();

    renewalReports.forEach((row) => {
      const user = row["User"];
      if (user) {
        map.set(user, { value: user, label: user });
      }
    });

    return Array.from(map.values());
  }, [renewalReports]);

  useEffect(() => {
    setSelectedCustomerId([]);
    setSelectedCustomerObj([]);
    setSelectedProductId([]);
    setSelectedProductObj([]);
    setSelectedUser([]);
    setSearchQuery("");
    setSearchTerm("");
  }, [useReportFilters]);


useEffect(() => {
  if (!renewalError) return;

  // 🌐 Network error
 if (
       renewalError  === "Failed to fetch business report" || "Rejected" ||
       renewalError.toLowerCase().includes("network") || renewalError.toLowerCase().includes("Token has expired")
     ) {
       toast.error(
       renewalError.toLowerCase().includes("Token has expired")
         ? "Session expired!! Please log in again."
         : "Rejected!! Network error. Please check your internet connection or Re-login",  {
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
  }
  // ❌ Auth / backend / validation error
  else {
toast.error(renewalError, {
  autoClose: 4000,
  toastClassName: "toast-warn-zfix",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  style: {
    background: "rgba(252, 61, 61, 0.88)",
    color: "white",
    fontSize: "14px",
    fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
    fontWeight: "bold",
  },
  icon: (
    <BiSolidMessageRoundedError
      style={{ fontSize: "20px", color: "white" }}
    />
  ),
});  }
}, [renewalError]);

// Total based on filtered rows (so it updates when filters change)
const totalOriginalQty = useMemo(() => {
  if (!filteredRenewalReports || filteredRenewalReports.length === 0) return 0;

  return filteredRenewalReports.reduce((sum, row) => {
    const qty = Number(
      String(row["Original Quantity"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);
}, [filteredRenewalReports]);

const totalRenewedQty = useMemo(() => {
  if (!filteredRenewalReports || filteredRenewalReports.length === 0) return 0;

  return filteredRenewalReports.reduce((sum, row) => {
    const qty = Number(
      String(row["Renewed Quantity"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);
}, [filteredRenewalReports]);

const formattedTotalOriginalQty = useMemo(() => {
  return totalOriginalQty.toLocaleString("en-IN");
}, [totalOriginalQty]);

const formattedTotalRenewedQty = useMemo(() => {
  return totalRenewedQty.toLocaleString("en-IN");
}, [totalRenewedQty]);

// Build renewal_id from Proforma # and Order #
const getRenewalId = (row) => {

  const proforma = row["Proforma #"] || "";
  const order = row["Order #"] || "";

  const renewalId = `${proforma}_${order}`;

  console.log("Generated renewal_id:", renewalId); // debug

  return renewalId;
};

useEffect(() => {

  const handleClickOutside = (event) => {

    if (
      tableRef.current &&
      !tableRef.current.contains(event.target)
    ) {
      setActiveRowId(null);
    }

  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };

}, []);

    return (
      <div className="RenewalReport-section">
        <h3>Renewals Report</h3>
        <ToastContainer />

        <Form onSubmit={handleSubmit} className="filter-form-renewal">
          {/* Date row */}
<Row className="g-4 mt-3 renewal-filter-row align-items-center">
  
  {/* Start Date */}
  <Col md={3} className="d-flex flex-column justify-content-center">
    <Form.Label className="required-label">
      Start Date:
    </Form.Label>
    <Form.Control
      type="date"
      value={startDate}
      onChange={handleStartDateChange}
      required
      className="dates"
    />
  </Col>

  {/* End Date */}
  <Col md={3} className="d-flex flex-column justify-content-center">
    <Form.Label className="required-label">
      End Date:
    </Form.Label>
    <Form.Control
      type="date"
      value={endDate}
      onChange={handleEndDateChange}
      required
      min={startDate || ""}
      className="dates"
    />
  </Col>

  {/* Totals */}
<Col md={6} className="d-flex align-items-center justify-content-center">
  {reportGenerated && (
    <div className="total-amount-text-renewal d-flex">

      <div className="total-box total-original">
        <span>Total Original Qty:&nbsp;</span>
        <strong className="wrap-amount">
          {formattedTotalOriginalQty}
        </strong>
      </div>

      <div className="total-box total-renewed">
        <span>Total Renewed Qty:&nbsp;</span>
        <strong className="wrap-amount">
          {formattedTotalRenewedQty}
        </strong>
      </div>

    </div>
  )}
</Col>
</Row>

<Row className="g-4 mt-3">

{/* Checkbox + Amount */}
  <Col md={3}>
    <Form.Check
      type="checkbox"
      label="Filter from generated report"
      checked={useReportFilters}
      onChange={(e) => setUseReportFilters(e.target.checked)}
      disabled={!reportGenerated}
      className="custom-checkbox-renewal"
    />
    </Col>


            {/* Customer search */}
            {<Col md={4}>
              <Form.Group className="form-group">
    <Form.Label>
      Customer {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ DROPDOWN FROM GENERATED REPORT DATA
      <Select
  className="RenewalReport-select"
  classNamePrefix="RenewalReport"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
  options={reportCustomerOptions}
  value={selectedCustomerObj.map(c => ({ value: c.companyName, label: c.companyName }))}
  onChange={selected => {
    setSelectedCustomerObj(selected ? selected.map(s => ({ companyName: s.value })) : []);
    setSelectedCustomerId(selected ? selected.map(s => s.value) : []);
  }}
  isMulti
  isClearable
  placeholder="Select customer from report"
/>
    ) : (
      // 🔴 EXISTING SEARCH UI — UNCHANGED
      <>
        <input
          type="text"
          className="search-field-customer-name-renewal form-control"
          placeholder="Search by Company Name"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="search-field1-customer-name-renewal mt-1">
          {searchQuery.length >= 3 ? (
            localSearchLoading || customersLoading ? (
              <p className="CustomerNameLoading-renewal">Loading...</p>
            ) : customers.length > 0 ? (
              <select
                value={selectedCustomerId || ""}
                onChange={handleCustomerSelect}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName || c.company_name || c.company}
                  </option>
                ))}
              </select>
            ) : (
              <p className="NoCustomerNameFound-renewal">No customers found...</p>
            )
          ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
            <p className="TypeMoreCustData-renewal">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>
            </Col> }
            

          {/* Product search (single products only) */}
  <Col md={4}>
    <Form.Group className="form-group">
    <Form.Label>
      Product {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ PRODUCT DROPDOWN FROM REPORT DATA
      <Select
  className="RenewalReport-select"
  classNamePrefix="RenewalReport"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
  options={reportProductOptions}
  value={selectedProductObj.map(p => ({ value: p.productName, label: p.productName }))}
  onChange={selected => {
    setSelectedProductObj(selected ? selected.map(s => ({ productName: s.value })) : []);
    setSelectedProductId(selected ? selected.map(s => s.value) : []);
  }}
  isMulti
  isClearable
  placeholder="Select product from report"
/>

    ) : (
      // 🔴 EXISTING PRODUCT SEARCH UI — UNCHANGED
      <>
        <input
          className="search-field-product-name-renewal form-control"
          type="text"
          placeholder="Search by Product Name"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);

            // 🔴 CLEAR PRODUCT FILTER WHEN INPUT CLEARED
            if (value.trim() === "") {
              setSelectedSearchValue("");
              setSelectedProductId("");
              setSelectedProductObj(null);
            }
          }}
        />

        <div className="search-field1-product-name-renewal mt-1">
          {searchTerm.length >= 3 ? (
            searchLoading ? (
              <p className="ProductNameLoading-renewal">Loading...</p>
            ) : searchResults.length > 0 ? (
              <select
                onChange={handleSelectProduct}
                value={selectedSearchValue}
              >
                <option value="">Select a product</option>
                {searchResults.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.productName} (Code: {product.productCode})
                  </option>
                ))}
              </select>
            ) : (
              <p className="NoProductNameFound-renewal">No products found...</p>
            )
          ) : searchTerm.length > 0 && searchTerm.length < 3 ? (
            <p className="TypeMoreProd-renewal">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>

  </Col>

            {/* User select */}
          {/* <Col md={3}> 
  <Form.Group className="form-group"> 
    <Form.Label>User</Form.Label>

    <Select
  className="RenewalReport-select"
  classNamePrefix="RenewalReport"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
  options={useReportFilters ? reportUserOptions : userOptions}
  value={selectedUser.map(u => ({ value: u, label: u }))}
  onChange={selected => {
    if (!selected) {
      setSelectedUser([]);
      return;
    }

    if (!useReportFilters && (!startDate || !endDate)) {
      toast.warn("Please select Start Date and End Date before applying User filter.", {
        position: "top-right",
        toastClassName: "toast-warn-zfix",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { background: "rgba(187, 184, 9, 1)", color: "white",
          fontSize: "14px",
          fontFamily: '"Shippori Mincho B1", "Times New Roman", serif',
          fontWeight: "bold",
        },
        icon: <IoIosWarning style={{ fontSize: '25px', color: 'white' }} />
      });
      return;
    }

    setSelectedUser(selected.map(s => s.value));
  }}
  isMulti
  isClearable
  isSearchable
  placeholder={
    useReportFilters ? "Select user from report" : "Search or select User"
  }
/>

  </Form.Group>

  </Col> */}

            {/* Submit button */}
            <Col md={1}>
              <Form.Group className="form-group">
                <Form.Label className="invisible">&nbsp;</Form.Label>
                <button type="submit" className="report-button-renewal" title="Generate Renewal Report">
                  <LuFileCheck2 className="filecheck" />
                </button>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        <br />

        {/* Loading & Error */}
      {renewalLoading && (
    <div className="loading-container-report-renewal">
      <div className="loading-spinner-report-renewal"></div>
      <p className="loading-message-report-renewal">Loading renewals...</p>
    </div>
  )}

  {renewalError && renewalError !== "Rejected" && (
  <div className="error-container-report-renewal">
    <p className="error-message-report-renewal">{renewalError}</p>
  </div>
)}

{/* Report Table */}
{/* Home button (top) */}
{page > 1 && (
  <div className="pagination-home-renewalreport">
    <button onClick={() => handlePageChange(1)}>
      ⏮ Home
    </button>
  </div>
)}

      <div className="RenewalReport-table" ref={tableRef}>
    {paginatedRenewalReports.length > 0 ? (
      <table>
        <thead>
  <tr>
    <th>Customer</th>
    <th>Product</th>
    <th>Vendor</th>
    <th>Validity</th>
    <th>Order #</th>
    <th>Original Qty</th>
    <th>Renewed Qty</th>
    <th>Completion %</th>
    <th>Completion Date</th>
    <th>Status</th>
    <th>Comments</th>
  </tr>
</thead>


        <tbody>
          {paginatedRenewalReports.map((row, idx) => (
<tr
  key={idx}
  className={
    activeRowId === getRenewalId(row)
      ? "active-renewal-row"
      : ""
  }
  onClick={() =>
    setActiveRowId(getRenewalId(row))
  }
>

<td>{row.Customer || "-"}</td>
<td>{row.Product || "-"}</td>
<td>{row.Vendor || "-"}</td>
<td>{row.Validity || "-"}</td>
<td>{row["Order #"] || "-"}</td>
<td>{row["Original Quantity"] ?? "-"}</td>
<td>{row["Renewed Quantity"] ?? "-"}</td>
<td>{row["Completion %"] ?? "0"}%</td>
<td>{row["Completion Date"] ?? "-"}</td>
<td>{row.Status || "-"}</td>
<td >
  <span className="icon-container-renewal">
    <FaEye
      className="action-icon-renewal"
      onClick={(e) => {
        e.stopPropagation();
        handleShowComments(getRenewalId(row));
      }}
      title="View Comments"
    />

    <FaPlusSquare
      className="action-icon-renewal"
      onClick={(e) => {
        e.stopPropagation();
        handleAddComment(getRenewalId(row));
      }}
      title="Add Comment"
    />
  </span>
</td>
</tr>

          ))}
        </tbody>
      </table>
    ) : (
      reportGenerated &&
      !renewalLoading && (
        <p className="no-renewal-message">NO RENEWALS FOUND...</p>
      )
    )}
    
    {/* Pagination */}
    {filteredRenewalReports.length > perPage && frontendTotalPages > 1 && (
      <div className="pagination-controls-renewalreport">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <FaChevronLeft />
        </button>

        <span className="page-renewalreport">
          {page} of {frontendTotalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === frontendTotalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    )}

  </div>

{/* Show Comments Modal */}
{modalState.showComments && !modalState.addComment && (
  <div className="comments-modal-container-renewal" ref={commentsRef}>
    <div className="comments-modal-renewal">
      <h4>Customer Comments - Renewal</h4>

      {Array.isArray(modalState.commentsData) && modalState.commentsData.length > 0 ? (
        <>
          <p className="displaycomments-renewal">
            Displaying {modalState.commentsData.length} comments
          </p>

      <div className="comments-list-renewal">

          {modalState.commentsData.map((c, i) => (

            <div key={i} className="comment-card-renewal">

              <div className="comment-header-renewal">

                <span className="comment-user-renewal">
                  {c.insertBy || "Unknown"}
                </span>

                <span className="comment-date-renewal">
                  {c.insertDate
                    ? new Date(c.insertDate).toLocaleString()
                    : "-"}
                </span>

              </div>

              <div className="comment-body-renewal">
                {c.comment}
              </div>

            </div>

          ))}

     </div>
        </>
      ) : (
        <p className="nocomments-renewal">
          No comments available... <FaFaceMeh />
        </p>
      )}

      <div className="cancel-renewal">
        <MdOutlineCancel
          onClick={handleCloseCommentsModal}
          className="cancelcomment-renewal"
          title='Cancel'
        />
      </div>
    </div>
  </div>
)}

{/* Add Comments Modal */}
{modalState.addComment && !modalState.showComments && (
  <div className="comment-edit-modal-container-renewal" ref={addCommentRef}>
    <div className="comment-edit-modal-renewal">
      <h4>Add Comment</h4>

      <textarea
        value={newComment}
        onChange={handleCommentChange}
        placeholder="Enter your comment here..."
        rows="5"
      />

      <div>
        <MdOutlineCancel
          onClick={handleCloseAddCommentModal}
          className="cancelcomment-renewal"
          title='Cancel'
        />

        <HiSave
          onClick={handleSubmitComment}
          className="submitcomment-renewal"
          title="Submit"
        />
      </div>
    </div>
  </div>
)}

      </div>
    );
  };

  export default RenewalReport;
