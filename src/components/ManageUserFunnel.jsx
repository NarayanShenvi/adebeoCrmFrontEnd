import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ProductCustomerLineChart = () => {
  const [chartData, setChartData] = useState([]);

 
      axios.all([
  axios.get("https://crm-dev-backend.onrender.com/getall_adebeo_products"),
  axios.get("https://crm-dev-backend.onrender.com/funnel_users")
])
.then(
  axios.spread((productsRes, purchaseRes) => {
    const products = Array.isArray(productsRes.data)
      ? productsRes.data
      : productsRes.data.data || [];

    const purchaseOrders = Array.isArray(purchaseRes.data)
      ? purchaseRes.data
      : purchaseRes.data.data || [];

    console.log("✅ Products:", products);
    console.log("✅ Purchases:", purchaseOrders);
    
    // continue with your monthMap logic here...
  })
)
.catch((err) => {
  console.error("API Error:", err);
});

  return (
    <div className="p-4">
      <h5 className="mb-3">📊 Products Created vs Purchases (Monthly)</h5>
      {chartData.length === 0 ? (
        <p>No data available to display chart.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="products" stroke="#8884d8" name="Products Created" />
            <Line type="monotone" dataKey="purchases" stroke="#82ca9d" name="Products Purchased" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductCustomerLineChart;
