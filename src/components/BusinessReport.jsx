  import React, { useState, useEffect, useRef, useMemo } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import axios from "axios";
  import { Form, Row, Col } from "react-bootstrap";
  import { LuFileCheck2 } from "react-icons/lu";
  import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import {
  fetchBusinessReport,
  resetBusinessReport,
} from "../redux/slices/reportSlice";

  import { fetchUsers } from "../redux/slices/userSlice";
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

    const BusinessReport = () => {
      const dispatch = useDispatch();
        const [chartsOpen, setChartsOpen] = useState(false);

      // Dates
      const today = new Date().toISOString().split("T")[0];
      const [startDate, setStartDate] = useState("");
      const [endDate, setEndDate] = useState("");

      // Filters
      const [selectedProductId, setSelectedProductId] = useState([]);
      const [selectedProductObj, setSelectedProductObj] = useState([]);
      const [selectedUser, setSelectedUser] = useState([]);
      const [selectedMode, setSelectedMode] = useState([]);
      const [selectedBusinessType, setSelectedBusinessType] = useState([]);


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
  businessReports = [],
  businessLoading,
  businessTotalPages = 1,
} = useSelector((state) => state.report);



      const { users = [], loading: usersLoading } = useSelector((state) => state.users);
      
      // Get current user & role if needed (keeps behavior similar to your ReportSection)
      const currentUser = useSelector((state) => state.user?.username);
      const isAdmin = useSelector((state) => state.user?.role === "admin");

      const [useReportFilters, setUseReportFilters] = useState(false);
      const [appliedFilters, setAppliedFilters] = useState({
      productId: [],
      productObj: [],
      user: [],
      mode: [],
      businessType: [],
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
      fetchBusinessReport({
        startDate,
        endDate,  
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
    productId: selectedProductId,
    productObj: selectedProductObj,
    user: selectedUser,
    mode: selectedMode,
    businessType: selectedBusinessType,
  });


      setReportGenerated(true);

      // ✅ FETCH PAGE 1
      fetchReportData(1);
    };
    useEffect(() => {
      setPage(1);
    }, [useReportFilters]);

      // When any filter changes (product/user) — auto refetch only if date range is present
    
      // Pagination handler
const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > frontendTotalPages) return;
  setPage(newPage);
};
 useEffect(() => {
  setPage(1);
}, [appliedFilters]);


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
      }, 450); 

      return () => clearTimeout(debounceProd);
    }, [searchTerm, allProducts]);


      // -----------------------
      // Derived username list for any UI needs
      // -----------------------

      const usernameList = useMemo(() => users.map((u) => u.username), [users]);
      
      const userOptions = users.map(u => ({ value: u.username, label: u.username }));

    const filteredBusinessReports  = useMemo(() => {
      let data = [...businessReports];

      // ✅ PRODUCT FILTER 
if (appliedFilters.productObj && appliedFilters.productObj.length > 0) {
  const productNames = appliedFilters.productObj.map(p => p.productName.toLowerCase());

  data = data.filter(row => 
    row["Product Description"] && productNames.some(name => row["Product Description"].toLowerCase().includes(name))
  );
}

// ✅ USER FILTER
if (appliedFilters.user && appliedFilters.user.length > 0) {
  data = data.filter(row =>
    row["User"] &&
    appliedFilters.user.includes(row["User"])
  );
}

// ✅ MODE FILTER
if (appliedFilters.mode && appliedFilters.mode.length > 0) {
  data = data.filter(row =>
    row["Mode"] &&
    appliedFilters.mode.includes(row["Mode"])
  );
}

// ✅ BUSINESS TYPE FILTER
if (appliedFilters.businessType && appliedFilters.businessType.length > 0) {
  data = data.filter(row =>
    row["Business Type"] &&
    appliedFilters.businessType.includes(row["Business Type"])
  );
}


      return data;
    }, [businessReports, appliedFilters]);

// ✅ FRONTEND pagination only (Business Report has no backend pagination)
const perPage = 1000; // max rows per page
const frontendTotalPages = Math.ceil(filteredBusinessReports.length / perPage);

    const paginatedBusinessReports  = useMemo(() => {
      const start = (page - 1) * perPage;
      const end = start + perPage;
      return filteredBusinessReports .slice(start, end);
    }, [filteredBusinessReports , page]);

  useEffect(() => {
    return () => {
      dispatch(resetBusinessReport()); // cleanup on unmount
    };
  }, []);


    const reportProductOptions = useMemo(() => {
      const map = new Map();

      businessReports.forEach((row) => {
        const name = row["Product Description"];
        if (name) {
          map.set(name, { value: name, label: name });
        }
      });

      return Array.from(map.values());
    }, [businessReports]);

    const reportUserOptions = useMemo(() => {
      const map = new Map();

      businessReports.forEach((row) => {
        const user = row["User"];
        if (user) {
          map.set(user, { value: user, label: user });
        }
      });

      return Array.from(map.values());
    }, [businessReports]);
    
  const reportModeOptions = useMemo(() => {
  const map = new Map();

  businessReports.forEach((row) => {
    const mode = row["Mode"];
    if (mode) {
      map.set(mode, { value: mode, label: mode });
    }
  });

  return Array.from(map.values());
}, [businessReports]);

  const reportBusinessTypeOptions = useMemo(() => {
  const map = new Map();

  businessReports.forEach((row) => {
    const type = row["Business Type"];
    if (type) {
      map.set(type, { value: type, label: type });
    }
  });

  return Array.from(map.values());
}, [businessReports]);

    useEffect(() => {
      setSelectedProductId([]);
      setSelectedProductObj([]);
      setSelectedUser([]);
      setSearchTerm("");
      setSelectedMode([]);
      setSelectedBusinessType([]);
    }, [useReportFilters]);

  const { businessError } = useSelector((state) => state.report);

  useEffect(() => {
    if (!businessError ) return;

    // 🌐 Network error
    if (
      businessError  === "Failed to fetch business report" || "Rejected" ||
      businessError.toLowerCase().includes("network") || businessError.toLowerCase().includes("Token has expired")
    ) {
      toast.error(
      businessError.toLowerCase().includes("Token has expired")
        ? "Session expired!! Please log in again."
        : "Rejected!! Network error. Please check your internet connection or Re-login", {
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
  toast.error(businessError , {
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
  }, [businessError]);


  const businessLineChartData  = useMemo(() => {
    const map = {};

    filteredBusinessReports .forEach((row) => {
      const date = row["Invoice Date"];
      const profit = Number(String(row["Profit (INR)"] || 0).replace(/,/g, ""));
      const profitPercent = Number(String(row["Profit %"] || 0));


      if (!date) return;

      if (!map[date]) {
      map[date] = { date, profit: 0, profitPercent: 0 };
    }

     map[date].profit += isNaN(profit) ? 0 : profit;
     map[date].profitPercent = profitPercent; // optional: last value or average if needed
  });

  return Object.values(map);
}, [filteredBusinessReports]);

  const businessBarChartData = useMemo(() => {
    const map = {};

    filteredBusinessReports .forEach((row) => {
   const customer = row["Customer"] || "Unknown";
      const profit = Number(
        String(row["Profit (INR)"] || 0).replace(/,/g, "")
      );

      if (!map[customer]) {
      map[customer] = { customer, profit: 0, profitPercentage: 0 };
    }

    map[customer].profit += isNaN(profit) ? 0 : profit;
    map[customer].profitPercentage = map[customer].profitPercentage + (row["Profit %"] || 0); // optional: if you want %
  });

  return Object.values(map);
}, [filteredBusinessReports]);

  const productCombinedChartData = useMemo(() => {
    const map = {};

    filteredBusinessReports.forEach((row) => {
    const product = row["Product Description"] || "Unknown";  
    const profit = Number(String(row["Profit (INR)"] || 0).replace(/,/g, ""));

    if (!map[product]) {
      map[product] = { product, profit: 0, profitPercentage: 0 };
    }

    map[product].profit += isNaN(profit) ? 0 : profit;
    map[product].profitPercentage =
      map[product].profitPercentage + (row["Profit %"] || 0); // optional %
  });

  return Object.values(map);
}, [filteredBusinessReports]);


  // Total based on filtered rows (so it updates when filters change)
  const totalSaleAmount = useMemo(() => {
  if (!filteredBusinessReports || filteredBusinessReports.length === 0) return 0;

  return filteredBusinessReports.reduce((sum, row) => {
    const amount = Number(
      String(row["Sale Amount (INR)"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
}, [filteredBusinessReports]);

const totalProfitAmount = useMemo(() => {
  if (!filteredBusinessReports || filteredBusinessReports.length === 0) return 0;

  return filteredBusinessReports.reduce((sum, row) => {
    const profit = Number(
      String(row["Profit (INR)"] || 0).replace(/,/g, "")
    );
    return sum + (isNaN(profit) ? 0 : profit);
  }, 0);
}, [filteredBusinessReports]);

const formattedTotalSaleAmount = useMemo(() => {
  return totalSaleAmount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}, [totalSaleAmount]);

const formattedTotalProfitAmount = useMemo(() => {
  return totalProfitAmount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}, [totalProfitAmount]);


  // bar chart
  const CustomCustomerTick  = ({ x, y, payload }) => {
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
  const chartHeight = Math.max(300, businessBarChartData.length * rowHeight);

  // Dynamic Pie Size Logic
  const productCount = productCombinedChartData?.length || 0;
  
  const sortedProductData = useMemo(() => {
  return [...productCombinedChartData].sort(
    (a, b) => b.profit - a.profit
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

  
const formatAmountWithRounded = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return null;
  }

  // keep original value to 2 decimals WITHOUT rounding
  const truncated = Math.trunc(amount * 100) / 100;

  return {
    formatted: truncated.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    rounded: Math.round(amount).toLocaleString("en-IN"),
  };
};

// ✅ Overall Profit %
const overallProfitPercentage = useMemo(() => {
  if (!totalSaleAmount || totalSaleAmount === 0) return 0;
  return ((totalProfitAmount / totalSaleAmount) * 100);
}, [totalSaleAmount, totalProfitAmount]);

// ✅ Average Profit % (row-wise average)
const averageProfitPercentage = useMemo(() => {
  if (!filteredBusinessReports || filteredBusinessReports.length === 0)
    return 0;

  const totalPercent = filteredBusinessReports.reduce((sum, row) => {
    const percent = Number(row["Profit %"] || 0);
    return sum + (isNaN(percent) ? 0 : percent);
  }, 0);

  return totalPercent / filteredBusinessReports.length;
}, [filteredBusinessReports]);

const formattedOverallProfitPercentage =
  overallProfitPercentage.toFixed(2) + "%";

const formattedAverageProfitPercentage =
  averageProfitPercentage.toFixed(2) + "%";

useEffect(() => {
  const profitElements = document.querySelectorAll(".profit-value");

  profitElements.forEach((el) => {
    const value = parseFloat(el.innerText.replace("%", ""));
    el.classList.remove("positive", "negative");

    if (!isNaN(value)) {
      el.classList.add(value >= 0 ? "positive" : "negative");
    }
  });
}, [formattedOverallProfitPercentage, formattedAverageProfitPercentage]);

useEffect(() => {
  const counters = document.querySelectorAll(".countup");

  counters.forEach((counter) => {
    const text = counter.innerText.replace(/[₹,]/g, "");
    const target = parseFloat(text);

    if (isNaN(target)) return;

    let start = 0;
    const duration = 3000;
    const stepTime = 16;
    const increment = target / (duration / stepTime);

    counter.innerText = "₹ 0";

    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        counter.innerText = `₹ ${target.toLocaleString()}`;
        clearInterval(interval);
      } else {
        counter.innerText = `₹ ${Math.floor(start).toLocaleString()}`;
      }
    }, stepTime);
  });
}, [reportGenerated]);



 return (
      <div className="BusinessReport-section">
        <h3>Business Report</h3>
        <ToastContainer />

        <Form onSubmit={handleSubmit} className="filter-form-business">
          {/* Date row */}
<Row className="g-4 mt-3 business-filter-row justify-content-center text-center">
  {/* Start Date */}
  <Col md={3} >
    <Form.Label className="required-label" style={{ display: "block", textAlign: "left" }}>Start Date:</Form.Label>
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
    <Form.Label className="required-label" style={{ display: "block", textAlign: "left" }}>End Date:</Form.Label>
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
      className="custom-checkbox-business"
    />
    </Col>
{/* 
<Col md={3}>
    {reportGenerated && (
  <div className="total-amount-text-business">
<div>
  <span>Total Sales:</span>
  <strong className="wrap-amount">{formattedTotalSaleAmount}</strong>
</div>

<div>
  <span>Total Profit:</span>
  <strong className="wrap-amount">{formattedTotalProfitAmount}</strong>
</div>

  </div>
)}
  </Col> */}
</Row>

<Row className="g-4 mt-3">
  
          {/* Product search (single products only) */}
  <Col md={3}>
    <Form.Group className="form-group">
    <Form.Label>
      Product {useReportFilters ? "(from report)" : "(search)"}
    </Form.Label>

    {useReportFilters ? (
      // ✅ PRODUCT DROPDOWN FROM REPORT DATA
      <Select
  className="BusinessReport-select"
  classNamePrefix="BusinessReport"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
  options={reportProductOptions} // must be [{ value, label }]
  value={selectedProductObj.map(p => ({ value: p._id, label: p.productName }))}
  onChange={(selected) => {
    if (!selected || selected.length === 0) {
      setSelectedProductId([]);
      setSelectedProductObj([]);
      return;
    }
    setSelectedProductId(selected.map(p => p.value)); // array of IDs
    setSelectedProductObj(selected.map(p => ({ _id: p.value, productName: p.label })));
  }}
  isClearable
  isMulti // ✅ important for multi-select
  placeholder="Select product (s) from report"
/>

    ) : (
      // 🔴 EXISTING PRODUCT SEARCH UI — UNCHANGED
      <>
        <input
          className="search-field-product-name-business form-control"
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

        <div className="search-field1-product-name-business mt-1">
          {searchTerm.length >= 3 ? (
            searchLoading ? (
              <p className="ProductNameLoadingBusiness">Loading...</p>
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
              <p className="NoProductNameFoundBusiness">No products found...</p>
            )
          ) : searchTerm.length > 0 && searchTerm.length < 3 ? (
            <p className="TypeMoreProdBusiness">
              Type at least 3 characters to search
            </p>
          ) : null}
        </div>
      </>
    )}
  </Form.Group>

  </Col>

            {/* User select */}
          <Col md={2}>
  <Form.Group className="form-group">
    <Form.Label>User</Form.Label>

    <Select
  className="BusinessReport-select"
  classNamePrefix="BusinessReport"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
  options={useReportFilters ? reportUserOptions : userOptions}
  value={selectedUser.map(u => ({ value: u, label: u }))}
  onChange={(selected) => {
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

setSelectedUser(selected ? selected.map(s => s.value) : []);
  }}
  isClearable
  isSearchable
    isMulti
  placeholder={
    useReportFilters
      ? "Select user"
      : "Search User"
  }
/>
  </Form.Group>

  </Col>

  <Col md={3}>
  <Form.Group className="form-group">
    <Form.Label>Mode</Form.Label>

    <Select
      className="BusinessReport-select"
      classNamePrefix="BusinessReport"
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      options={reportModeOptions}
      value={selectedMode.map(m => ({ value: m, label: m }))}
      onChange={(selected) =>
        setSelectedMode(selected ? selected.map(s => s.value) : [])
      }
      isClearable
      isMulti
      placeholder="Select Mode"
    />
  </Form.Group>
</Col>

  <Col md={3}>
  <Form.Group className="form-group">
    <Form.Label>Business Type</Form.Label>

    <Select
  className="BusinessReport-select"
  classNamePrefix="BusinessReport"
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: base => ({ ...base, zIndex: 9999 })
  }}
  options={reportBusinessTypeOptions}
  value={selectedBusinessType.map(bt => ({ value: bt, label: bt }))}
  onChange={(selected) => {
    setSelectedBusinessType(selected ? selected.map(s => s.value) : []);
  }}
  isClearable
  isMulti
  placeholder="Select Business Type"
/>
  </Form.Group>
</Col>

            {/* Submit button */}
            <Col md={1}>
              <Form.Group className="form-group">
                <Form.Label className="invisible">&nbsp;</Form.Label>
                <button type="submit" className="report-button-business" title="Generate Business Report">
                  <LuFileCheck2 className="filecheck" />
                </button>
              </Form.Group>
            </Col>
</Row>

{/* 🔥 TOTAL SUMMARY ROW WITH ANIMATION */}
{reportGenerated && (
  <Row className="justify-content-center text-center mt-3">
    <Col md={8}>
      <div className="total-summary-animated-business-report">

        {/* LEFT SIDE */}
        <div className="total-left-business-report slide-from-left">
          <div>
            <span>Total Sales</span>
            <strong className="countup">{formattedTotalSaleAmount}</strong>
          </div>

          <div>
            <span>Total Profit</span>
            <strong className="countup">{formattedTotalProfitAmount}</strong>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="total-right-business-report slide-from-right">
          <div>
            <span>Overall Profit %</span>
            <strong className="profit-value-business-report overall-profit-business-report">{formattedOverallProfitPercentage}</strong>
          </div>

          <div>
            <span>Average Profit %</span>
            <strong  className="profit-value-business-report average-profit-business-report">{formattedAverageProfitPercentage}</strong>
          </div>
        </div>

      </div>
    </Col>
  </Row>
)}

        </Form>

        <br />

        {/* Loading & Error */}
    {businessLoading  && (
    <div className="loading-container-report-business">
      <div className="loading-spinner-report-business"></div>
      <p className="loading-message-report-business">Loading business report...</p>
    </div>
  )}

  {businessError  && businessError !== "Rejected" && (
  <div className="error-container-report-business">
    <p className="error-message-report-business">{businessError}</p>
  </div>
)}

{/* Report Table */}
{/* Home button (top) */}
{page > 1 && (
  <div className="pagination-home-businessreport">
    <button onClick={() => handlePageChange(1)}>
      ⏮ Home
    </button>
  </div>
)}
      <div className="BusinessReport-table">
    {paginatedBusinessReports .length > 0 ? (
      <table>
        <thead>
  <tr>
    <th>Customer Name</th>
    <th>Product Name</th>
    <th>Invoice Number</th>
    <th>Invoice Date</th>
    <th>Mode</th>
    <th>Business Type</th>
    <th>PO Number</th>
    <th>Purchase Cost (INR)</th>
    <th>Sale Amount (INR)</th>
    <th>Profit (INR)</th>
    <th>Profit %</th>
  </tr>
</thead>

<tbody>
  {paginatedBusinessReports.map((row, idx) => (
    <tr key={idx}>
      <td>{row["Customer"] || "-"}</td>
      <td>{row["Product Description"] || "-"}</td>
      <td>{row["Invoice #"] || "-"}</td>
      <td>{row["Invoice Date"] || "-"}</td>
      <td>{row["Mode"] || "-"}</td>
      <td>{row["Business Type"] || "-"}</td>
      <td>{row["PO Number"] || "-"}</td>

      {/* Purchase Cost */}
<td>
  {row["Purchase Cost (INR)"] ? (() => {
    const amount = formatAmountWithRounded(row["Purchase Cost (INR)"]);

    return (
      <>
        <div>₹ {amount.formatted}</div>
        {/* <div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            (Rounded:
          </div>
          <div style={{ fontWeight: 600, fontSize: "12px", color: "#666" }}>
            ₹ {amount.rounded})
          </div>
        </div> */}
      </>
    );
  })() : "-"}
</td>


      {/* Sale Amount */}
      <td>
        {row["Sale Amount (INR)"]
          ? `₹ ${row["Sale Amount (INR)"]}`
          : "-"}
      </td>

      {/* Profit */}
      <td>
        {row["Profit (INR)"]
          ? `₹ ${row["Profit (INR)"]}`
          : "-"}
      </td>

      {/* Profit % */}
      <td>
        {row["Profit %"] !== undefined && row["Profit %"] !== null
          ? `${row["Profit %"]}%`
          : "-"}
      </td>
    </tr>
  ))}
</tbody>

      </table>
    ) : (
      reportGenerated &&
      !businessLoading  && (
        <p className="no-business-message">NO RESULTS FOUND...</p>
      )
    )}

{/* Pagination */}
    {filteredBusinessReports.length > perPage && frontendTotalPages > 1 && (
  <div className="pagination-controls-businessreport">
    <button
      onClick={() => handlePageChange(page - 1)}
      disabled={page === 1}
    >
      <FaChevronLeft />
    </button>

    <span className="page-businessreport">
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
{filteredBusinessReports .length > 0 && (
  <div className="charts-collapsible-businessreport mt-4">
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
        <div className="business-report-charts mt-3">
          {/* --- Line Chart --- */}
         <div className="business-line-chart">
  <h5 className="text-center mb-3"> Business Profit Trend (Date-wise)</h5>

  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={businessLineChartData}  margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
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
    value="  Profit (₹) ➜ "
    angle={-90}
    position="outsideLeft"
    dx={-40}  
       style={{ fill: "#0a3d62", fontSize: 12, fontWeight: 600, fontFamily: "Shippori Mincho B1, Times New Roman, serif"
    }}
  />
  </YAxis>

  <Tooltip formatter={(value, name, props) => {
       const profitPercent = props?.payload?.profitPercent || 0;
       return [`₹ ${value} (${profitPercent}%)`, "Profit"];
        }}
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
        dataKey="profit"
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
           <div className="business-bar-chart">
  <h5 className="business-bar-chart-head">Customer-wise Business Profit:</h5>

  <ResponsiveContainer width="100%" height={chartHeight}>
    <BarChart
      data={businessBarChartData}
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
  tick={<CustomCustomerTick  />}
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
          value=" Profit (₹) ➜"
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
       formatter={(value, name, props) => {
    const percent = props.payload.profitPercentage
      ? ` (${props.payload.profitPercentage.toFixed(1)}%)`
      : "";

    return [`₹ ${value}${percent}`, "Profit"]; // ✅ value + % together
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
        dataKey="profit"
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

<h5 className="business-pie-chart-head">
  Product-wise Business Profit:
</h5>

<ResponsiveContainer width="100%" height={piechartHeight}>
  <PieChart margin={{ top: 20, right: 180, bottom: 20, left: 20 }}>
    <Pie
      data={productCombinedChartData}
      dataKey="profit"
      nameKey="product"
      cx="45%"
      cy="50%"
      outerRadius={safeOuterRadius}
      label={showSliceLabels
        ? ({ cx, cy, midAngle, outerRadius, payload }) => {
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
                  ({payload.profitPercentage.toFixed(1)}%)
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

    {/* Tooltip remains unchanged */}
    <Tooltip
      content={({ active, payload }) => {
        if (!active || !payload?.length) return null;

        const { product, profit, profitPercentage } =
          payload[0]?.payload || {};

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
              whiteSpace: "pre-line",
          border: "none"
            }}
          >
            <div style={{ marginBottom: "6px" ,
                      color: "#f7fbfcfd",
                      fontFamily: "Shippori Mincho B1, Times New Roman, serif",
                      fontWeight: 600,
        }}>
              {wrapped}
            </div>
            <div>
              Total Profit:&nbsp;&nbsp;
              <strong>₹ {profit}</strong>{" "}
              <span style={{
              fontSize: "16px",
              fontWeight: 900,
              color: "#fffffffd",
            }}>
                ({profitPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        );
      }}
    />

   <Legend
  layout="vertical"
  align="right"
  verticalAlign="middle"
  wrapperStyle={{
    right: -7,   // 👉 increase this value to push legend right
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

  export default BusinessReport;
