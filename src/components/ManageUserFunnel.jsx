import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { transferFunnel } from "../redux/slices/funnelSlice";
import { fetchUsers } from "../redux/slices/userSlice";
import "./dashboard/Dashboard.css";
import { RiUserShared2Fill } from "react-icons/ri";
import { FaSpinner} from "react-icons/fa";  // add these imports
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify"; 
import { BiSolidMessageRoundedError } from "react-icons/bi";
import { IoIosWarning } from "react-icons/io";
import { BiSolidCommentCheck } from "react-icons/bi";

const ManageUserFunnel = () => {
  const dispatch = useDispatch();
  const { users = [], loading: usersLoading, error: usersError } = useSelector(
    (state) => state.users
  );
  
  const { loading } = useSelector((state) => state.funnel);
  const [fromUser, setFromUser] = useState("");
  const [toUser, setToUser] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleFromUserChange = (e) => {
    setFromUser(e.target.value);
    setToUser(""); // reset second dropdown when fromUser changes
  };

  const handleToUserChange = (e) => {
    if (!fromUser) {
      toast.warn("Please select From User first", {
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
    setToUser(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromUser || !toUser) {
      toast.warn("Please select both From and To users before submitting!!", {
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

    dispatch(transferFunnel({ fromUser, toUser }))
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Funnel transferred successfully!", {
                                        position: "top-right",
                                        toastClassName: "toast-warn-zfix",
                                        autoClose: 4000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: "colored", // "light", "dark", or "colored"
                                        style: { background: "rgba(74, 163, 66, 1)", color: "white", 
                                          fontSize: "14px",       // ✅ Change font size
                                          fontFamily: '"Shippori Mincho B1", "Times New Roman", serif', // ✅ Custom Font
                                          fontWeight: "bold",    // ✅ Make text bold
                                         },
                                         icon: <BiSolidCommentCheck  
                                         style={{ fontSize: '20px', color: 'white' }} />
                                    });
        
        setFromUser("");
        setToUser("");
      })
      .catch((err) => {
        toast.error(err || " ⛔ Error transferring funnel", {
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
      });
  };

  return (
    <div className="transfer-funnel-container">
      <h3>Transfer User Funnel</h3>
            <ToastContainer />
      
      <form onSubmit={handleSubmit} className="create-user-funnel-transfer-form">

        <div className="form-group-user-funnel">
          <label className="required-label">From User</label>
          <select
            value={fromUser}
            onChange={handleFromUserChange}
            className="form-select-user-funnel"
          >
            <option value="">Select From User</option>
            {usersLoading ? (
              <option>Loading users...</option>
            ) : usersError ? (
              <option>Error loading users</option>
            ) : (
              users.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group-user-funnel">
          <label  className="required-label">To User</label>
          <select
            value={toUser}
            onChange={handleToUserChange}
            className="form-select-user-funnel"
          >
            <option value="">Select To User</option>
            {users
              .filter((u) => u.username !== fromUser)
              .map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
          </select>
        </div>

<button
  type="submit"
  disabled={loading}
  className="submit-button-user-funnel"
  onClick={(e) => {
    if (!fromUser || !toUser) {
      e.preventDefault();
      toast.warn("Please make sure you selected both From User and To User before submitting!!", {
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
    }
  }}
>
  {loading ? (
    <FaSpinner className="spinner" size={20} title="Transferring..." />
  ) : (
    <RiUserShared2Fill size={22} title="Transfer Funnel" className="NewProduct" />
  )}
</button>

        
      </form>
    </div>
  );
};

export default ManageUserFunnel;
