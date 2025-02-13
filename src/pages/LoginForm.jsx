import { useDispatch } from 'react-redux';
import React, { useState } from "react";
import './LoginForm.css';
import { FaUser, FaLock  } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useNavigate } from 'react-router-dom';  // Updated to useNavigate
import { loginUser } from "../redux/slices/authSlice";  


const Login = () => 
{
    const dispatch = useDispatch();
    const [username, Username] = useState("");
    const [password, Password] = useState("");
    const [err, setError] = useState("");
    const navigate = useNavigate(); // Use useNavigate for routing in React Router v6

    const handleLogin = (e) => 
        {
          e.preventDefault();
          setError(""); 
          dispatch(loginUser(username, password))  // ✅ This now returns a Promise
         .then((data) => 
            {
              console.log("User logged in successfully!", data);
              navigate('/dashboardPage');  // Use navigate instead of history.push
            })
         .catch((err) => 
            {
              console.log("Error logging in:", err);
              setError("Invalid username or password."); // Show error on failure
            });
        };
                      
    return(
       <div className='loginpage'>
        <div className="wrapper">
            <div className='logo'>
               <img src={logo} alt="Company Logo" width="100" />
            </div>
            <form action="">
                <h1>Sign in</h1>
                <div className="input-box">
                <input type="text"  placeholder="username" value={username} onChange={(e) => Username(e.target.value)} required/>
                    <FaUser className="icon"/>
                </div>
                <div className="input-box">
                <input type="password"  placeholder="password" value={password} onChange={(e) => Password(e.target.value)} required />
                    <FaLock className="icon"/>
                </div>

                {/* 🔴 Show error message if login fails */}
                {err && <p className="error-message">{err}</p>}

                <button onClick={handleLogin}>LOGIN</button>
            </form>
        </div>
        </div>
    );
};

export default Login;