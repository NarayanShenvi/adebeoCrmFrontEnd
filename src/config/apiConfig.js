import axios from "axios";

// Get the token from localStorage using the correct key "Access_Token"
const token = localStorage.getItem("Access_Token"); 

// Set default headers for Axios requests
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
  // Optionally, handle the case where no token is found
  delete axios.defaults.headers.common["Authorization"];
}

export default axios;