import { useDispatch } from 'react-redux';
import React, { useState } from "react";
import { loginUser } from "../redux/slices/authSlice";  
import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";
import logo from "../assets/logo.png"; 
import { useNavigate } from 'react-router-dom';  // Updated to useNavigate

const Login = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState(""); // Fix variable naming to be consistent
  const [password, setPassword] = useState(""); // Fix variable naming to be consistent
  const [err, setError] = useState("");
  const navigate = useNavigate(); // Use useNavigate for routing in React Router v6

  const handleLogin = (e) => {
    e.preventDefault();
    setError(""); 
    dispatch(loginUser(username, password))  // This now returns a Promise
      .then((data) => {
        console.log("User logged in successfully!", data);
        navigate('/dashboardPage');  // Use navigate instead of history.push
      })
      .catch((err) => {
        console.log("Error logging in:", err);
        setError("Invalid username or password."); // Show error on failure
      });
  };

  return (
    <div className="wrapper">
      <div className="logo">
        <img src={logo} alt="Company Logo" width="100" />
      </div>
      <form onSubmit={handleLogin}>
        <h1>Sign in</h1>
        <div className="input-box">
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <FaLock className="icon" />
        </div>

        {/* 🔴 Show error message if login fails */}
        {err && <p className="error-message">{err}</p>}

        <button type="submit">LOGIN</button>
      </form>
    </div>
  );
};

export default Login;
