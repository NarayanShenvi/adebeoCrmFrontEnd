import React, { useState } from 'react';
import './dashboard/Dashboard.css'; // Import the CSS fil

const CreateUsers = () => {
  const [formData, setFormData] = useState({
    userName: '',
    personalEmail: '',
    mobile: '',
    officialEmail: '',
    address: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { userName, personalEmail, mobile, password } = formData;

    if (!userName || !personalEmail || !mobile || !password) {
      alert('Please fill in all required fields.');
      return;
    }

    // You can send formData to your backend here
    console.log('Submitted User Data:', formData);
    alert('User created successfully!');

    // Reset form
    setFormData({
      userName: '',
      personalEmail: '',
      mobile: '',
      officialEmail: '',
      address: '',
      password: ''
    });
  };

  return (
    <div className="create-user-container">
      <h2>Create New Employee</h2>
      <form className="create-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User Name *</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Personal Email *</label>
          <input
            type="email"
            name="personalEmail"
            value={formData.personalEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mobile Number *</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Official Email</label>
          <input
            type="email"
            name="officialEmail"
            value={formData.officialEmail}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit">Create User</button>
        </div>
      </form>
    </div>
  );
};

export default CreateUsers;
