import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchComboProductsAsync } from "../redux/slices/productSlice"; 
// adjust path if needed

const QuoteProductSelection = () => {
  const dispatch = useDispatch();

  // Local state
  const [selectionType, setSelectionType] = useState("single"); // single or combo
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCombo, setSelectedCombo] = useState("");

  // Redux state
  const products = useSelector((state) => state.products?.products || []);
  const combos = useSelector((state) => state.products?.comboProducts || []);
  const loading = useSelector((state) => state.products?.loading || false);

  // Derive categories from products (including uncategorized)
  const categories = useMemo(() => {
    const catMap = {};
    const uncategorized = { _id: "uncat", categoryName: "Uncategorized", products: [] };

    products.forEach((p) => {
      const catId = p.categoryId || p.categoryCode; // adjust based on your product structure
      const catName = p.categoryName || "Unnamed Category";

      if (catId) {
        if (!catMap[catId]) {
          catMap[catId] = { _id: catId, categoryName: catName, products: [] };
        }
        catMap[catId].products.push(p);
      } else {
        uncategorized.products.push(p);
      }
    });

    const finalCategories = Object.values(catMap);
    if (uncategorized.products.length) finalCategories.push(uncategorized);

    return finalCategories;
  }, [products]);

  // Products for the selected category
  const productsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const catObj = categories.find((c) => c._id === selectedCategory);
    return catObj?.products || [];
  }, [selectedCategory, categories]);

  // Fetch combos on mount
  useEffect(() => {
    dispatch(fetchComboProductsAsync());
  }, [dispatch]);

  return (
    <div className="quote-product-selection">
      {/* Selection toggle */}
      <div className="selection-toggle">
        <label>
          <input
            type="radio"
            name="selectionType"
            value="single"
            checked={selectionType === "single"}
            onChange={() => setSelectionType("single")}
          />
          Single Product
        </label>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            name="selectionType"
            value="combo"
            checked={selectionType === "combo"}
            onChange={() => setSelectionType("combo")}
          />
          Combo Product
        </label>
      </div>

      {/* Single Product Selection */}
      {selectionType === "single" && (
        <div className="single-product-selection" style={{ marginTop: "10px" }}>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedProduct(""); // reset product
            }}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          {productsForCategory.length > 0 && (
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              <option value="">Select Product</option>
              {productsForCategory.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.productName} (Code: {prod.productCode})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Combo Product Selection */}
      {selectionType === "combo" && (
        <div className="combo-product-selection" style={{ marginTop: "10px" }}>
          {loading ? (
            <p>Loading combos...</p>
          ) : (
            <select
              value={selectedCombo}
              onChange={(e) => setSelectedCombo(e.target.value)}
            >
              <option value="">Select Combo</option>
              {combos.map((combo) => (
                <option key={combo.comboCode} value={combo.comboCode}>
                  {combo.comboDisplayName} (Code: {combo.comboCode})
                </option>
              ))}
            </select>
          )}

          {/* Show nested products of selected combo */}
          {selectedCombo && (
            <div style={{ marginTop: "10px" }}>
              <h5>Combo Products:</h5>
              <ul>
                {combos.find((c) => c.comboCode === selectedCombo)?.products?.map(
                  (p) => (
                    <li key={p.productId}>
                      {p.productName} (Code: {p.productCode}) - Qty: {p.quantity}
                    </li>
                  )
                ) || <li>No products in this combo</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteProductSelection;
