import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { addAdminUserAsync } from '../redux/slices/adminUserSlice';
import { Form, Row, Col } from 'react-bootstrap';
import { HiSave } from "react-icons/hi";
import { FaSpinner } from 'react-icons/fa';
import './dashboard/Dashboard.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify"; 
import { BiSolidMessageRoundedError } from "react-icons/bi";
import { IoIosWarning } from "react-icons/io";
import { BiSolidCommentCheck } from "react-icons/bi";

const CreateUsers = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const formRef = useRef(null);

  const initialState = {
  userName: '',
  personalEmail: '',
  mobile: '',
  officialEmail: '',
  address: '',
  password: '',
  role: ''
};

const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const resetForm = () => {
    setFormData({ ...initialState }); // trigger re-render by cloning the object
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { userName, password, role } = formData;

    if (!userName || !password || !role) {
      toast.warn('Please fill in all required fields.', {
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
      setLoading(false);
      return;
    }

    try {
      const action = await dispatch(
        addAdminUserAsync({
          username: userName,
          password,
          role
        })
      );
      unwrapResult(action);

      toast.success('User created successfully!', {
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

            resetForm(); // clear form

    } catch (err) {
      let msg = '';
      if (typeof err === 'string') {
        msg = err;
      } else if (err?.message) {
        msg = err.message;
      } else if (err?.payload) {
        if (typeof err.payload === 'string') msg = err.payload;
        else if (err.payload.message) msg = err.payload.message;
      } else {
        msg = 'Request failed with status code 400';
      }

      if (/status code 400/i.test(msg) || /request failed with status code 400/i.test(msg)) {
        toast.error('User already exists.', {
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
      } else if (/(already\s*exists|duplicate|user\s*exists)/i.test(msg)) {
        toast.error('User already exists.', {
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
      } else {
        toast.error(msg, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-section" >
      <h3>Create New User</h3>
      <ToastContainer />
      
      <Form className="create-user-form" onSubmit={handleSubmit} ref={formRef}>
        <Form.Group className="form-group-user">
          <Form.Label className="required-label">User Name </Form.Label>
          <Form.Control
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Enter user name"
            required
          />
        </Form.Group>

        <Form.Group className="form-group-user">
          <Form.Label>Personal Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter personal email address"
            name="personalEmail"
            value={formData.personalEmail}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="form-group-user">
          <Form.Label>Official Email</Form.Label>
          <Form.Control
            type="email"
            name="officialEmail"
            placeholder="Enter official email address"
            value={formData.officialEmail}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="form-group-user">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="tel"
            name="mobile"
            placeholder="Enter phone number"
            value={formData.mobile}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="form-group-user">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            placeholder="Enter address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="form-group-user">
          <Form.Label className="required-label">User Password </Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter user password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="form-group-user">
          <Form.Label className="required-label">Role</Form.Label>
          <Form.Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select User Type</option>
            <option value="User">User</option>
            <option value="Tech">Tech</option>
          </Form.Select>
        </Form.Group>

        <button type="submit" disabled={loading} className="submit-button-user">
          {loading ? (
            <FaSpinner className="spinner" size={20} title="Submitting..." />
          ) : (
            <HiSave size={24} title="Create User" className="NewProduct" />
          )}
        </button>
      </Form>
    </div>
  );
};

export default CreateUsers;
