import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { transferFunnel } from "../redux/slices/funnelSlice";
import { fetchUsers } from "../redux/slices/userSlice";
import "./dashboard/Dashboard.css";
import { RiUserShared2Fill } from "react-icons/ri";
import { FaSpinner} from "react-icons/fa";  // add these imports

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
      alert("💡 Please select From User first");
      return;
    }
    setToUser(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromUser || !toUser) {
      alert(" ⚠️ Please select both From and To users before submitting!!");
      return;
    }

    dispatch(transferFunnel({ fromUser, toUser }))
      .unwrap()
      .then((res) => {
        alert(res.message || " ✅ Funnel transferred successfully!");
        setFromUser("");
        setToUser("");
      })
      .catch((err) => {
        alert(err || " ⛔ Error transferring funnel");
      });
  };

  return (
    <div className="transfer-funnel-container">
      <h3>Transfer User Funnel</h3>
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
            onClick={() => {
              if (!fromUser) {
                alert("💡 Please select From User first");
              }
            }}
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
      alert("⚠️ Please make sure you selected both From User and To User before submitting!!");
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
