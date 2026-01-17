  import React, { useState, useEffect, useRef, useMemo } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import axios from "axios";
  import { Form, Row, Col } from "react-bootstrap";
  import { LuFileCheck2 } from "react-icons/lu";
  import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

  import { fetchSalesReport, resetSalesReport } from "../redux/slices/reportSlice";
  import { fetchUsers } from "../redux/slices/userSlice";
  import { fetchCustomerAsync, clearCustomers } from "../redux/slices/customerSlice"; // adjust path/names if different
  import { setProductToEdit, updateProductAsync, fetchProductsAsync, addProductAsync } from '../redux/slices/productSlice';
  import Select from "react-select";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { ToastContainer } from "react-toastify"; 
  import { BiSolidMessageRoundedError } from "react-icons/bi";
  import { IoIosWarning } from "react-icons/io";
  import { BiSolidCommentCheck } from "react-icons/bi";
  import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  ComposedChart,   
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { Collapse, Button } from "react-bootstrap";

  const SalesReport = () => {
    const dispatch = useDispatch();
      const [chartsOpen, setChartsOpen] = useState(false);

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

    // Pagination & report
    const [page, setPage] = useState(1);
    const [reportGenerated, setReportGenerated] = useState(false);

    // Redux slices
  const {
    salesReports = [],
    salesLoading,
  } = useSelector((state) => state.report);

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
      if (selected > today) {
        toast.warn("You cannot select a future Date!!", {
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
      if (selected > today) {
        toast.warn("You cannot select a future Date!!", {
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
    fetchSalesReport({
      startDate,
      endDate,
      page: pageNum,
      perPage,
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
    setSelectedCustomerId(id);
    const cust = customers.find((c) => c._id === id) || null;
    setSelectedCustomerObj(cust);
  };


  //   // --- Load all customers initially ---
  // // --- Load all customers initially ---
  // useEffect(() => {
  //   // Fetch all customers once on mount
  //   const fetchAllCustomers = async () => {
  //     try {
  //       setLocalSearchLoading(true); // show spinner while loading
  //       await dispatch(fetchCustomerAsync("")); // empty string fetches all
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLocalSearchLoading(false);
  //     }
  //   };

  //   fetchAllCustomers();
  // }, [dispatch]);

  // // --- Prepare options ---
  // const customerOptions = customers.map(c => ({
  //   value: c._id,
  //   label: c.companyName || c.company_name || c.company
  // }));


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
    setSelectedProductId(prod ? prod._id : "");
    setSelectedProductObj(prod);
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


  const filteredSalesReports = useMemo(() => {
    let data = [...salesReports];

    // ✅ CUSTOMER FILTER (multi-select)
if (appliedFilters.customerObj && appliedFilters.customerObj.length > 0) {
  const customerNames = appliedFilters.customerObj.map(c =>
    (c.companyName || c.company_name || c.company || "").toLowerCase()
  );

  data = data.filter(row =>
    row["Customer Name"] &&
    customerNames.some(name =>
      row["Customer Name"].toLowerCase().includes(name)
    )
  );
}

// ✅ PRODUCT FILTER (multi-select)
if (appliedFilters.productObj && appliedFilters.productObj.length > 0) {
  const productNames = appliedFilters.productObj.map(p =>
    p.productName.toLowerCase()
  );

  data = data.filter(row =>
    row["Description"] &&
    productNames.some(name =>
      row["Description"].toLowerCase().includes(name)
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
  }, [salesReports, appliedFilters]);

const perPage = 1000; // max rows per page
const frontendTotalPages = Math.ceil(filteredSalesReports.length / perPage);

  const paginatedSalesReports = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredSalesReports.slice(start, end);
  }, [filteredSalesReports, page]);

 useEffect(() => {
  return () => {
    dispatch(resetSalesReport()); // cleanup on unmount
  };
}, []);


  const reportCustomerOptions = useMemo(() => {
    const map = new Map();

    salesReports.forEach((row) => {
      const name = row["Customer Name"];
      if (name) {
        map.set(name, { value: name, label: name });
      }
    });

    return Array.from(map.values());
  }, [salesReports]);

  const reportProductOptions = useMemo(() => {
    const map = new Map();

    salesReports.forEach((row) => {
      const name = row["Description"];
      if (name) {
        map.set(name, { value: name, label: name });
      }
    });

    return Array.from(map.values());
  }, [salesReports]);

  const reportUserOptions = useMemo(() => {
    const map = new Map();

    salesReports.forEach((row) => {
      const user = row["User"];
      if (user) {
        map.set(user, { value: user, label: user });
      }
    });

    return Array.from(map.values());
  }, [salesReports]);

  useEffect(() => {
    setSelectedCustomerId([]);
    setSelectedCustomerObj([]);
    setSelectedProductId([]);
    setSelectedProductObj([]);
    setSelectedUser([]);
    setSearchQuery("");
    setSearchTerm("");
  }, [useReportFilters]);

//   const totalAmountBilled = useMemo(() => {
//   if (!salesReports || salesReports.length === 0) return 0;

//   return salesReports.reduce((sum, row) => {
//     const amount = Number(
//       String(row["Amount Billed (INR)"] || 0).replace(/,/g, "")
//     );
//     return sum + (isNaN(amount) ? 0 : amount);
//   }, 0);
// }, [salesReports]);

// const formattedTotalAmount = useMemo(() => {
//   return totalAmountBilled.toLocaleString("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 2,
//   });
// }, [totalAmountBilled]);

const { salesError } = useSelector((state) => state.report);

useEffect(() => {
  if (!salesError) return;

  // 🌐 Network error
 if (
       salesError  === "Failed to fetch business report" || "Rejected" ||
       salesError.toLowerCase().includes("network") || salesError.toLowerCase().includes("Token has expired")
     ) {
       toast.error(
       salesError.toLowerCase().includes("Token has expired")
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
toast.error(salesError, {
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
}, [salesError]);


const salesLineChartData = useMemo(() => {
  const map = {};

  filteredSalesReports.forEach((row) => {
    const date = row["Invoice Date"];
    const amount = Number(
      String(row["Amount Billed (INR)"] || 0).replace(/,/g, "")
    );

    if (!date) return;

    if (!map[date]) {
      map[date] = { date, amount: 0 };
    }

    map[date].amount += isNaN(amount) ? 0 : amount;
  });

  return Object.values(map);
}, [filteredSalesReports]);

const salesBarChartData = useMemo(() => {
  const map = {};

  filteredSalesReports.forEach((row) => {
    const customer = row["Customer Name"] || "Unknown";
    const amount = Number(
      String(row["Amount Billed (INR)"] || 0).replace(/,/g, "")
    );

    if (!map[customer]) {
      map[customer] = { customer, amount: 0 };
    }

    map[customer].amount += isNaN(amount) ? 0 : amount;
  });

  return Object.values(map);
}, [filteredSalesReports]);

const productCombinedChartData = useMemo(() => {
  const map = {};

  filteredSalesReports.forEach((row) => {
    const product = row["Description"] || "Unknown";
    const qty = Number(row["Qty"] || 0);
    const amount = Number(
      String(row["Amount Billed (INR)"] || 0).replace(/,/g, "")
    );

    if (!map[product]) {
      map[product] = {
        product,
        quantity: 0,
        amount: 0,
      };
    }

    map[product].quantity += isNaN(qty) ? 0 : qty;
    map[product].amount += isNaN(amount) ? 0 : amount;
  });

  return Object.values(map);
}, [filteredSalesReports]);

// Total based on filtered rows (so it updates when filters change)
const totalAmountBilled = useMemo(() => {
  if (!filteredSalesReports || filteredSalesReports.length === 0) return 0;

  return filteredSalesReports.reduce((sum, row) => {
    const amount = Number(
      String(row["Amount Billed (INR)"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
}, [filteredSalesReports]);
const formattedTotalAmount = useMemo(() => {
  return totalAmountBilled.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}, [totalAmountBilled]);

 // bar chart
const CustomCustomerTick = ({ x, y, payload }) => {
  let text = payload.value || "";

  // 1️⃣ Trim name to 50% length
  const half = Math.ceil(text.length / 2);
  const trimmed = text.length > 12 ? text.slice(0, half) + "…" : text;

  // 2️⃣ Wrap into 2 lines (every ~10 chars)
  const words = trimmed.match(/.{1,12}/g) || [trimmed];

  return (
    <g transform={`translate(${x - 90},${y})`}>
      {words.map((line, i) => (
        <text
          key={i}
          dy={i * 12}
          fill="#585757ff"
          fontSize={12}
          fontWeight={600}
          fontFamily="Shippori Mincho B1, Times New Roman, serif"
        >
          {line}
        </text>
      ))}
    </g>
  );
};
const rowHeight = 40; // space per bar
const chartHeight = Math.max(300, salesBarChartData.length * rowHeight);

// Dynamic Pie Size Logic
const productCount = productCombinedChartData?.length || 0;
    
    const sortedProductData = useMemo(() => {
    return [...productCombinedChartData].sort(
      (a, b) => b.amount - a.amount
    );
  }, [productCombinedChartData]);
  
    const COLORS = [
      "#0a8181",
      "#f39c12",
      "#e74c3c",
      "#9b59b6",
      "#3498db",
      "#2ecc71",
      "#1abc9c",
      "#8e44ad",
      "#34495e",
      "#c0392b",
    ];
  
    const generateColors = (count) =>
    Array.from({ length: count }, (_, i) => {
      const hue = (i * 137.508) % 360;
      return `hsl(${hue}, 60%, 50%)`;
    });
  
  const remainingColors = generateColors(
    Math.max(0, sortedProductData.length - COLORS.length)
  );
  
  const finalColors = [
    ...COLORS,
    ...remainingColors,
  ]; 
  
  const cx = "35%";   // leave room for legend
  const cy = "50%";   // stable center
  const MAX_LABEL_PRODUCTS = 6;
  const showSliceLabels = productCombinedChartData.length <= MAX_LABEL_PRODUCTS;
  
  const safeOuterRadius = Math.min(
    160,
    Math.max(
      150,                        // minimum size
      80 + productCount * 6      // 🔥 grows with product count
    )
  );
  const piechartHeight = Math.max(
    360,
    productCount * 28
  );
  
  const TwoColumnPieLegend = ({ payload }) => {
    if (!payload || payload.length === 0) return null;
  
    const mid = Math.ceil(payload.length / 2);
    const col1 = payload.slice(0, mid);
    const col2 = payload.slice(mid);
  
    const renderItem = (entry, index) => {
      const name = entry.value || "";
      const wrapped = name.match(/.{1,26}/g)?.join("\n") || name;
  
      return (
        <div
          key={index}
          style={{
                  display: "flex",
                  alignItems: "center",
                  color: entry.color,
                  marginBottom: "10px",
                  whiteSpace: "pre-line", // ⭐ enables wrapping
                  fontFamily: "Shippori Mincho B1, Times New Roman, serif",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
        >
          <span
            style={{
                    width: "30px",      // ⭐ wider box
                    height: "15px",
                    borderRadius: "2px",
                    backgroundColor: entry.color,
                    marginRight: "9px",
                  }}
          />
          <span>{wrapped}</span>
        </div>
      );
    };
  
    return (
      <div
        style={{
          display: "flex",
          gap: "22px",
          padding: "8px 10px",
          maxHeight: "420px",
          overflowY: "auto",
        }}
      >
        <div>{col1.map(renderItem)}</div>
        <div>{col2.map(renderItem)}</div>
      </div>
    );
  };


    return (
      <div className="SalesReport-section">
        <h3>Sales Report</h3>
        <ToastContainer />

        <Form onSubmit={handleSubmit} className="filter-form-sales">
          {/* Date row */}
<Row className="g-4 mt-3 sales-filter-row">
  {/* Start Date */}
  <Col md={3}>
    <Form.Label className="required-label">Start Date:</Form.Label>
    <Form.Control
      type="date"
      value={startDate}
      onChange={handleStartDateChange}
      required
      max={today}
      className="dates"
    />
  </Col>

  {/* End Date */}
  <Col md={3}>
    <Form.Label className="required-label">End Date:</Form.Label>
    <Form.Control
      type="date"
      value={endDate}
      onChange={handleEndDateChange}
      required
      max={today}
      min={startDate || ""}
      className="dates"
    />
  </Col>

  {/* Checkbox + Amount */}
  <Col md={3}>
    <Form.Check
      type="checkbox"
      label="Filter from generated report"
      checked={useReportFilters}
      onChange={(e) => setUseReportFilters(e.target.checked)}
      disabled={!reportGenerated}
      className="custom-checkbox-sales"
    />
    </Col>

<Col md={3}>
    {reportGenerated && (
      <div className="total-amount-text">
        <span>Total Amount:</span>
        <strong className="wrap-amount">
        {formattedTotalAmount} {/* This already has ₹ symbol & formatting */}
      </strong>
      </div>
    )}
  </Col>
</Row>


          <Row className="g-4 mt-3">
            {/* Customer search */}
            {<Col md={4}>
              <Form.Group className="form-group">
    <Form.Label>
      Customer {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ DROPDOWN FROM GENERATED REPORT DATA
      <Select
  className="SalesReport-select"
  classNamePrefix="SalesReport"
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
          className="search-field-customer-name form-control"
          placeholder="Search by Company Name"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="search-field1-customer-name mt-1">
          {searchQuery.length >= 3 ? (
            localSearchLoading || customersLoading ? (
              <p className="CustomerNameLoading">Loading...</p>
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
              <p className="NoCustomerNameFound">No customers found...</p>
            )
          ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
            <p className="TypeMoreCustData">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>
            </Col> }
            {/* <Col md={4}>
    <Form.Group className="form-group">
      <Form.Label>Customer</Form.Label>
    <Select
    options={customerOptions}
    value={
      selectedCustomerId && selectedCustomerObj
        ? { value: selectedCustomerId, label: selectedCustomerObj.companyName || selectedCustomerObj.company_name || selectedCustomerObj.company }
        : null
    }
    onInputChange={(inputValue) => {
      setSearchQuery(inputValue);

      // Only search after 3+ characters
      if (inputValue.trim().length >= 3) {
        setLocalSearchLoading(true);
        dispatch(fetchCustomerAsync(inputValue.trim()))
          .finally(() => setLocalSearchLoading(false));
      } else {
        // If less than 3 chars, show all customers (already fetched)
        setLocalSearchLoading(false);
      }
    }}
    onChange={(selected) => {
      setSelectedCustomerId(selected?.value || "");
      const cust = customers.find(c => c._id === selected?.value) || null;
      setSelectedCustomerObj(cust);

      if (!startDate || !endDate) {
        toast.warn("Please select Start Date and End Date before applying customer filter.");
      }
    }}
    isClearable
    isSearchable
    placeholder="Select or search customer"
    isLoading={localSearchLoading} // only show spinner while searching
    noOptionsMessage={() =>
      searchQuery.length >= 3 ? "No customers found" : "Start typing to search"
    }
  />

    </Form.Group>
  </Col> */}


          {/* Product search (single products only) */}
  <Col md={4}>
    <Form.Group className="form-group">
    <Form.Label>
      Product {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ PRODUCT DROPDOWN FROM REPORT DATA
      <Select
  className="SalesReport-select"
  classNamePrefix="SalesReport"
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
          className="search-field-product-name form-control"
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

        <div className="search-field1-product-name mt-1">
          {searchTerm.length >= 3 ? (
            searchLoading ? (
              <p className="ProductNameLoading">Loading...</p>
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
              <p className="NoProductNameFound">No products found...</p>
            )
          ) : searchTerm.length > 0 && searchTerm.length < 3 ? (
            <p className="TypeMoreProd">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>

  </Col>

            {/* User select */}
          <Col md={3}>
  <Form.Group className="form-group">
    <Form.Label>User</Form.Label>

    <Select
  className="SalesReport-select"
  classNamePrefix="SalesReport"
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

  </Col>

            {/* Submit button */}
            <Col md={1}>
              <Form.Group className="form-group">
                <Form.Label className="invisible">&nbsp;</Form.Label>
                <button type="submit" className="report-button-sales" title="Generate Sales Report">
                  <LuFileCheck2 className="filecheck" />
                </button>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        <br />

        {/* Loading & Error */}
      {salesLoading && (
    <div className="loading-container-report-sales">
      <div className="loading-spinner-report-sales"></div>
      <p className="loading-message-report-sales">Loading sales report...</p>
    </div>
  )}

  {salesError && salesError !== "Rejected" && (
  <div className="error-container-report-sales">
    <p className="error-message-report-sales">{salesError}</p>
  </div>
)}

{/* Report Table */}
      <div className="SalesReport-table">
    {paginatedSalesReports.length > 0 ? (
      <table>
        <thead>
  <tr>
    <th>Customer Name</th>
    <th>Product Name</th>
    <th>Product Qty</th>
    <th>Invoice Number</th>
    <th>Invoice Date</th>
    <th>Mode</th>
    <th>Business Type</th>
    <th>Amount Billed (INR)</th>
    <th>PO Number</th>
  </tr>
</thead>


        <tbody>
          {paginatedSalesReports.map((row, idx) => (
            <tr key={idx}>
  <td>{row["Customer Name"] || "-"}</td>
  <td>{row["Description"] || "-"}</td>
  <td>{row["Qty"] || "-"}</td>

  <td>{row["Invoice #"] || "-"}</td>
  <td>{row["Invoice Date"] || "-"}</td>

  {/* 👉 NEW COLUMNS */}
  <td>{row["Mode"] || "-"}</td>
  <td>{row["Business Type"] || "-"}</td>

  <td>
    {row["Amount Billed (INR)"]
      ? `₹ ${row["Amount Billed (INR)"]}`
      : "-"
    }
  </td>

  <td>{row["PO Number"] || "-"}</td>
</tr>

          ))}
        </tbody>
      </table>
    ) : (
      reportGenerated &&
      !salesLoading && (
        <p className="no-sales-message">NO SALES FOUND...</p>
      )
    )}
    
    {/* Pagination */}
    {filteredSalesReports.length > perPage && frontendTotalPages > 1 && (
      <div className="pagination-controls-salesreport">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <FaChevronLeft />
        </button>

        <span className="page-salesreport">
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

    {/* ================== CHARTS ================== */}
{/* --- Collapsible Charts Section --- */}
{filteredSalesReports.length > 0 && (
  <div className="charts-collapsible mt-4">
    <Button
      onClick={() => setChartsOpen(!chartsOpen)}
      aria-controls="charts-collapse"
      aria-expanded={chartsOpen}
      variant="outline-primary"
      className={`mb-3 ${chartsOpen ? "open" : ""}`} // ✅ add class for arrow rotation
    >
      <span className="arrow">{chartsOpen ? "▼" : "►"}</span>
  {chartsOpen ? " Hide Charts & Analysis" : " View Charts & Analysis"}
</Button>

    <Collapse in={chartsOpen}>
      <div
        id="charts-collapse"
        className={chartsOpen ? "show" : ""}
      >
        <div className="sales-report-charts mt-3">
          {/* --- Line Chart --- */}
         <div className="sales-line-chart">
  <h5 className="text-center mb-3">Sales Trend (Date-wise)</h5>

  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={salesLineChartData}  margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        interval={0}
        angle={-45}
        textAnchor="end"
        height={70}
        axisLine={{ stroke: "#888888ff", strokeWidth: 1 }}
        tick={{
    fill: "#585757ff",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "Shippori Mincho B1, Times New Roman, serif"
  }}
    >
      <Label
    value="Date ➜"
    position="insideBottom"
    offset={-5}
    style={{ fill: "#0a3d62", fontSize: 13, fontWeight: 600, fontFamily: "Shippori Mincho B1, Times New Roman, serif"
 }}
  />
  </XAxis>

  <YAxis
  axisLine={{ stroke: "#888888ff", strokeWidth: 1 }}
   tick={{
    fill: "#585757ff",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "Shippori Mincho B1, Times New Roman, serif"
  }}>
  <Label
    value="  Sales Amount (₹) ➜"
    angle={-90}
    position="outsideLeft"
    dx={-40}  
       style={{ fill: "#0a3d62", fontSize: 12, fontWeight: 600, fontFamily: "Shippori Mincho B1, Times New Roman, serif"
    }}
  />
  </YAxis>

  <Tooltip formatter={(value) => [`₹ ${value}`, "Total Amount"]}  
    wrapperStyle={{
    borderRadius: "2px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  }}
  contentStyle={{
    backgroundColor: "#2d7174ff",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    padding: "8px 12px", 
    fontSize: "12px",
    fontFamily: "Shippori Mincho B1, Times New Roman, serif",
  }}
  itemStyle={{ color: "#fff",  fontFamily: "Shippori Mincho B1, Times New Roman, serif", fontWeight: 600
 }}
  labelStyle={{
    color: "#fff",
    fontWeight: 600,
        fontFamily: "Shippori Mincho B1, Times New Roman, serif"
  }}
  cursor={{ stroke: "#0a8181", strokeWidth: 2, fill: "rgba(10,129,129,0.1)" }}/>
    
      <Line
        type="monotone"
        dataKey="amount"
        stroke="#0a8181"
        strokeWidth={3}
        dot={{ r: 4 }}
        style={{ cursor: "pointer" }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
<br></br>
<br></br>
<br></br>

          {/* --- Bar Chart --- */}
           <div className="sales-bar-chart">
  <h5 className="sales-bar-chart-head">Customer-wise Sales:</h5>

  <ResponsiveContainer width="100%" height={chartHeight}>
    <BarChart
      data={salesBarChartData}
      layout="vertical"
      wrapperStyle={{ overflow: "visible" }} 
      margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
    >
      <CartesianGrid strokeDasharray="3 3" />

      {/* Y Axis → Customer Names */}
      <YAxis
  dataKey="customer"
  type="category"
  width={180}      // 👈 This is the correct prop
  axisLine={{ stroke: "#888888ff", strokeWidth: 1 }}
  tick={<CustomCustomerTick />}
><Label
    value="Customers ➜"
    angle={-90}
    position="outsideLeft"
    dx={-40}  
       style={{ fill: "#0a3d62", fontSize: 13, fontWeight: 600, fontFamily: "Shippori Mincho B1, Times New Roman, serif"
    }}
  />
  </YAxis>

      {/* X Axis → Amount */}
      <XAxis
        type="number"
        axisLine={{ stroke: "#888888ff", strokeWidth: 1 }}
        tick={{
          fill: "#585757ff",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "Shippori Mincho B1, Times New Roman, serif",
        }}
      >
        <Label
          value=" Sales Amount (₹) ➜"
          position="insideBottom"
          offset={-20}
          style={{
            fill: "#0a3d62",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Shippori Mincho B1, Times New Roman, serif",
          }}
        />
      </XAxis>

      {/* Tooltip same look as line chart */}
      <Tooltip
      labelFormatter={(label) => {
    const wrapped = label.match(/.{1,55}/g)?.join("\n") || label;
    return wrapped;
  }}
        formatter={(value) => [`₹ ${value}`, "Total Sales"]}
        wrapperStyle={{
          borderRadius: "2px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
        contentStyle={{
              whiteSpace: "pre-line",
          backgroundColor: "#f7fbfcfd",
          color: "#1b5d61ff",
          border: "none",
          borderRadius: "3px",
          padding: "8px 12px",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "Shippori Mincho B1, Times New Roman, serif",
        }}
        itemStyle={{
          color: "#1b5d61ff",
          fontFamily: "Shippori Mincho B1, Times New Roman, serif",
          fontWeight: 600,
        }}
        labelStyle={{
              whiteSpace: "pre-line",
          color: "#1b5d61ff",
          fontWeight: 600,
          fontFamily: "Shippori Mincho B1, Times New Roman, serif",
        }}
        cursor={{ fill: "rgba(10,129,129,0.15)" }}
      />

      {/* Bars */}
      <Bar
        dataKey="amount"
        fill="#0a8181"
        radius={[0, 4, 4, 0]}
        barSize={20}
        style={{ cursor: "pointer" }}
      />
    </BarChart>
  </ResponsiveContainer>
</div>
<br></br><br></br>
<br></br><br></br>

          {/* --- Pie Chart --- */}

<h5 className="sales-pie-chart-head">
  Product-wise Sales Percentage:
</h5>

<ResponsiveContainer width="100%" height={piechartHeight}>
  <PieChart margin={{ top: 20, right: 180, bottom: 20, left: 20 }}>
    <Pie
      data={productCombinedChartData}
      dataKey="amount"
      nameKey="product"
      cx="45%"
      cy="50%"
      outerRadius={safeOuterRadius}
      label={showSliceLabels
        ? ({ cx, cy, midAngle, outerRadius, payload, percent }) => {
            const RAD = Math.PI / 180;
            const radius = outerRadius + 18;
            const x = cx + radius * Math.cos(-midAngle * RAD);
            const y = cy + radius * Math.sin(-midAngle * RAD);

            const name = payload.product || "";
            const short =
              name.length > 22 ? name.slice(0, 22) + "…" : name;

            return (
              <text
                x={x}
                y={y}
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fill="#585757ff"
                fontSize={12}
                fontWeight={600}
                fontFamily="Shippori Mincho B1, Times New Roman, serif"
              >
                {short}
                <tspan
                  dx={4}
                  fill="#026464ff"
                  fontSize={14}
                  fontWeight={700}
                >
                  ({(percent * 100).toFixed(1)}%)
                </tspan>
              </text>
            );
          }
        : false}
    >
      {sortedProductData.map((entry, index) => (
        <Cell key={index} fill={finalColors[index]} />
      ))}
    </Pie>

    {/* Tooltip */}
    <Tooltip
      content={({ active, payload }) => {
        if (!active || !payload?.length) return null;

        const { product, amount } = payload[0]?.payload || {};

        const total = productCombinedChartData.reduce(
          (sum, i) => sum + i.amount,
          0
        );

        const percentage = total
          ? ((amount / total) * 100).toFixed(1)
          : 0;

        const wrapped =
          product?.match(/.{1,30}/g)?.join("\n") || product;

        return (
          <div
            style={{
              whiteSpace: "pre-line",
              backgroundColor: "#1b5d61ff",
              color: "#f7fbfcfd",
              borderRadius: "3px",
              padding: "8px 12px",
              fontFamily:
                "Shippori Mincho B1, Times New Roman, serif",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
            }}
          >
            {/* Product Name */}
            <div
              style={{
                marginBottom: "6px",
                fontWeight: 600,
              }}
            >
              {wrapped}
            </div>

            {/* Sales + % */}
            <div>
              Total Sales:&nbsp;&nbsp;
              <strong>₹ {amount}</strong>{" "}
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  color: "#fffffffd",
                }}
              >
                ({percentage}%)
              </span>
            </div>
          </div>
        );
      }}
    />

    {/* Legend */}
    <Legend
      layout="vertical"
      align="right"
      verticalAlign="middle"
      wrapperStyle={{
        right: -7,
      }}
      content={<TwoColumnPieLegend />}
    />
  </PieChart>
</ResponsiveContainer>

        </div>
      </div>
    </Collapse>
  </div>
)}
  </div>

      </div>
    );
  };

  export default SalesReport;
