import { useDispatch } from 'react-redux';
import React, { useState } from "react";
import './LoginForm.css';
import { FaUser, FaLock  } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useNavigate } from 'react-router-dom';  // Updated to useNavigate
import { loginUser } from "../redux/slices/authSlice";  

import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { MdOutlineWifiOff } from "react-icons/md";

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
            dispatch(loginUser(username, password))  // ✅ This now returns a Promise
            .then((data) => 
            {
                console.log("User logged in successfully!", data);
                navigate('/dashboardPage');  // Use navigate instead of history.push
            })
            
            .catch((err) => 
            {
                console.log("Error logging in:", err);
                if (err.response) {
                    toast.error("Invalid username or password.", {
                        position: "top-center",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored", // "light", "dark", or "colored"
                        style: { background: "rgba(226, 70, 70, 0.87)", color: "white", 
                          fontSize: "13px",       // ✅ Change font size
                          fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                          fontWeight: "bold",    // ✅ Make text bold
                         }
                    });
                  } else if (err.request) {
                    toast.error("Network error. Please check your internet connection.", {
                        position: "top-center",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored", // "light", "dark", or "colored"
                        style: { background: "rgba(78, 121, 202, 0.87)", color: "white", 
                          fontSize: "14px",       // ✅ Change font size
                          fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                          fontWeight: "bold",    // ✅ Make text bold
                         },
                         icon: <MdOutlineWifiOff
                         style={{ fontSize: '20px', color: 'white' }} />
                    });
                  } else {
                    toast.error("An unexpected error occurred. Please refresh and try again.", {
                        position: "top-center",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored", // "light", "dark", or "colored"
                        style: { background: "rgba(226, 70, 70, 0.87)", color: "white", 
                          fontSize: "13px",       // ✅ Change font size
                          fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                          fontWeight: "bold",    // ✅ Make text bold
                         }
                    });
                }
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

                
                <button onClick={handleLogin}>LOGIN</button>
            </form>
        </div>
         {/* Add ToastContainer to show toasts */}
         <ToastContainer />
        </div>
        
    );
};

export default Login;
