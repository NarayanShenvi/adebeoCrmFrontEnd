import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductsAsync, fetchComboProductsAsync } from "../redux/slices/productSlice";

const QuoteProductSelection = ({ onProductSelect }) => {
  const dispatch = useDispatch();
  const wrapperRef = useRef(null);

  // Local UI state
  const [selectionType, setSelectionType] = useState("single"); // "single" | "combo"
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hover / click control
  const [hoveredCatId, setHoveredCatId] = useState(null); // category currently hovered
  const [activeCatId, setActiveCatId] = useState(null); // category clicked/tapped (persist)
  const hideTimerRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCombo, setSelectedCombo] = useState("");

  // Redux state (safe selectors)
  const products = useSelector((s) => s.products?.products || []);
  const combos = useSelector((s) => s.products?.comboProducts || []);
  const loading = useSelector((s) => s.products?.loading || false);

  // Fetch data
  useEffect(() => {
    dispatch(fetchProductsAsync());
    dispatch(fetchComboProductsAsync());
  }, [dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
        clearHideTimer();
        setHoveredCatId(null);
        setActiveCatId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helpers for hide timer
  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };
  const startHideTimer = (delay = 250) => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setHoveredCatId(null);
      hideTimerRef.current = null;
    }, delay);
  };

  // Build categories from products (categoryCode or "Uncategorized")
  const categories = useMemo(() => {
    const map = {};
    const unc = { _id: "uncat", categoryName: "Uncategorized", products: [] };

    products.forEach((p) => {
      const code = p.categoryCode && String(p.categoryCode).trim() !== "" ? String(p.categoryCode) : null;
      const name = p.categoryName || p.category || code || "Uncategorized";

      if (code) {
        if (!map[code]) map[code] = { _id: code, categoryName: name, products: [] };
        map[code].products.push(p);
      } else {
        unc.products.push(p);
      }
    });

    const arr = Object.values(map);
    if (unc.products.length) arr.push(unc);
    return arr;
  }, [products]);

  // Which category's products are shown (hover or click)
  const currentCatId = hoveredCatId ?? activeCatId ?? null;
  const currentProducts = useMemo(() => {
    const cat = categories.find((c) => c._id === currentCatId);
    return cat?.products || [];
  }, [categories, currentCatId]);

  // pick product handler
  const pickProduct = (prod) => {
    setSelectedProduct(prod);
    setDropdownOpen(false);
    setHoveredCatId(null);
    setActiveCatId(null);
    clearHideTimer();
    if (typeof onProductSelect === "function") onProductSelect(prod);
  };

  // category mouse handlers
  const onCategoryMouseEnter = (catId) => {
    clearHideTimer();
    setHoveredCatId(catId);
  };
  const onCategoryMouseLeave = () => {
    startHideTimer(200);
  };

  // submenu mouse handlers
  const onSubmenuMouseEnter = (catId) => {
    clearHideTimer();
    setHoveredCatId(catId);
  };
  const onSubmenuMouseLeave = () => {
    startHideTimer(200);
  };

  // category click
  const onCategoryClick = (catId) => {
    setActiveCatId((prev) => (prev === catId ? null : catId));
    setDropdownOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ fontFamily: "inherit" }}>
      {/* radio toggle */}
      {/* selection dropdown */}
<div style={{ marginBottom: 10 }}>
  <select
    value={selectionType}
    onChange={(e) => {
      const val = e.target.value;
      setSelectionType(val);
      if (val === "single") {
        setSelectedCombo("");
        setSelectedProduct(null);
      } else if (val === "combo") {
        setDropdownOpen(false);
        setSelectedProduct(null);
      }
    }}
    style={{ padding: "6px 10px", minWidth: 200 }}
  >
    <option value="single">Single Product</option>
    <option value="combo">Combo Product</option>
  </select>
</div>


      {/* SINGLE: dropdown */}
      {selectionType === "single" && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              minWidth: 340,
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {selectedProduct
                ? `${selectedProduct.productName} (Code: ${selectedProduct.productCode})`
                : "Select Category → Product"}
            </span>
            <span style={{ marginLeft: 12, opacity: 0.6 }}>▾</span>
          </button>

          {dropdownOpen && (
            <div
              role="dialog"
              aria-modal="false"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                display: "flex",
                gap: 8,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              {/* categories */}
              <div
                style={{ minWidth: 220, maxHeight: 360, overflow: "auto", borderRight: "1px solid #f1f1f1" }}
              >
                {categories.length === 0 ? (
                  <div style={{ padding: 12, color: "#666" }}>No products loaded</div>
                ) : (
                  categories.map((cat) => {
                    const isOpen = currentCatId === cat._id;
                    return (
                      <div
                        key={cat._id}
                        onMouseEnter={() => onCategoryMouseEnter(cat._id)}
                        onMouseLeave={() => onCategoryMouseLeave()}
                        onClick={() => onCategoryClick(cat._id)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          background: isOpen ? "#f8f8fb" : "transparent",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          userSelect: "none",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{cat.categoryName}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{cat.products.length}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* products (only show if category selected/hovered) */}
              {currentCatId && (
                <div
                  style={{ minWidth: 360, maxHeight: 360, overflow: "auto" }}
                  onMouseEnter={() => {
                    if (currentCatId) onSubmenuMouseEnter(currentCatId);
                  }}
                  onMouseLeave={() => {
                    onSubmenuMouseLeave();
                  }}
                >
                  {currentProducts.length === 0 ? (
                    <div style={{ padding: 12, color: "#666" }}>No products in this category</div>
                  ) : (
                    currentProducts.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => pickProduct(p)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 14px",
                          border: 0,
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.productName}</div>
                            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{p.ProductDisplay || ""}</div>
                          </div>
                          <div style={{ textAlign: "right", fontSize: 13, color: "#333" }}>
                            Code: {p.productCode}
                            <div style={{ fontSize: 12, color: "#666" }}>Qty: {p.quantity || 1}</div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMBO */}
      {selectionType === "combo" && (
        <div style={{ marginTop: 8 }}>
          {loading ? (
            <div>Loading combos...</div>
          ) : combos.length === 0 ? (
            <div>No combos available</div>
          ) : (
            <div>
              <select
                value={selectedCombo}
                onChange={(e) => setSelectedCombo(e.target.value)}
                style={{ minWidth: 360, padding: "8px 10px" }}
              >
                <option value="">Select Combo</option>
                {combos.map((c) => (
                  <option key={c.comboCode} value={c.comboCode}>
                    {c.comboDisplayName} (Code: {c.comboCode})
                  </option>
                ))}
              </select>

              {selectedCombo && (
                <div style={{ marginTop: 10 }}>
                  <strong>Combo Products:</strong>
                  <ul style={{ marginTop: 8 }}>
                    {combos.find((c) => c.comboCode === selectedCombo)?.products?.map((p) => (
                      <li key={p.productId}>
                        {p.productName} — Qty: {p.quantity}
                      </li>
                    )) || <li>No products in this combo</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* show selected product below */}
      <div style={{ marginTop: 12 }}>
        <strong>Selected:</strong>{" "}
        {selectedProduct ? (
          <span>
            {selectedProduct.productName} (Code: {selectedProduct.productCode})
          </span>
        ) : selectedCombo ? (
          <span>Combo: {selectedCombo}</span>
        ) : (
          <span>—</span>
        )}
      </div>
    </div>
  );
};

export default QuoteProductSelection;
