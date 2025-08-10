import React, { useEffect, useState, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { FaSpinner } from 'react-icons/fa';
import { HiSave } from 'react-icons/hi';
import { FaCheckToSlot } from "react-icons/fa6";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { HiSquaresPlus } from "react-icons/hi2";
import axios from "../config/apiConfig";
import API from "../config/config";
import { useDispatch } from 'react-redux';
import { addProductCategoryAsync } from '../redux/slices/addProductCategoy';

const CategorySection = () => {
  const [mode, setMode] = useState('add');
  const [formData, setFormData] = useState({
    Category_Name: '',
    type: '',
    description: '',
    Category_Code: '',
    _id: ''
  });

  const [formLoading, setFormLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const dispatch = useDispatch();
  const searchTimeoutRef = useRef(null);
  const cancelTokenRef = useRef(null);

  const resetForm = () => {
    setFormData({
      Category_Name: '',
      type: '',
      description: '',
      Category_Code: '',
      _id: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModeToggle = () => {
    setMode(prev => prev === 'add' ? 'edit' : 'add');
    resetForm();
    setSearchResults([]);
    setSearchError('');
  };

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setFormData(prev => ({ ...prev, Category_Name: keyword }));

    clearTimeout(searchTimeoutRef.current);

    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New search initiated');
    }

    if (keyword.length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setSearchLoading(true);
          setSearchError('');

          cancelTokenRef.current = axios.CancelToken.source();

          const res = await axios.get(`${API}/dummy_category_search`, {
            params: { name: keyword },
            cancelToken: cancelTokenRef.current.token
          });

          setSearchResults(res.data.data || []);
        } catch (err) {
          if (!axios.isCancel(err)) {
            setSearchError(err.response?.data?.message || 'Unable to fetch categories.');
            setSearchResults([]);
          }
        } finally {
          setSearchLoading(false);
        }
      }, 400);
    } else {
      setSearchResults([]);
      setSearchError('');
    }
  };

  const handleSelectCategory = (e) => {
    const selected = searchResults.find(cat => cat._id === e.target.value);
    if (selected) {
      setFormData({
        Category_Name: selected.categoryName || selected.Category_Name || '',
        type: selected.type || '',
        description: selected.description || '',
        Category_Code: selected.code || '',
        _id: selected._id
      });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFormLoading(true);

  const { Category_Name, type, Category_Code } = formData;

  if (!Category_Name || !type || !Category_Code) {
    alert('Please fill in all required fields.');
    setFormLoading(false);
    return;
  }

  try {
    if (mode === 'edit') {
      const res = await axios.post(`${API}/dummy_update_category`, formData);
      alert(res.data?.message || "Category updated successfully");
      resetForm();
    } else {
      const action = await dispatch(addProductCategoryAsync(formData));

      if (addProductCategoryAsync.fulfilled.match(action)) {
        alert(action.payload?.message || "Category added successfully");
        resetForm();
      } else if (addProductCategoryAsync.rejected.match(action)) {
        let msg = '';
        if (typeof action.payload === 'string') {
          msg = action.payload;
        } else if (action.payload?.message) {
          msg = action.payload.message;
        } else if (action.error?.message) {
          msg = action.error.message;
        } else {
          msg = 'Request failed with status code 400';
        }

        if (/status code 400/i.test(msg) || /(already\s*exists|duplicate|category\s*exists)/i.test(msg)) {
          alert('Category with this name or code already exists');
        } else {
          alert(msg);
        }
      }
    }
  } catch (err) {
    let msg = '';
    if (typeof err === 'string') {
      msg = err;
    } else if (err?.message) {
      msg = err.message;
    } else if (err?.response?.data?.message) {
      msg = err.response.data.message;
    } else {
      msg = 'Error during save. Please try again.';
    }

    if (/status code 400/i.test(msg) || /(already\s*exists|duplicate|category\s*exists)/i.test(msg)) {
      alert('Category with this name or code already exists');
    } else {
      alert(msg);
    }
  } finally {
    setFormLoading(false);
  }
};


  return (
    <div className="category-section">
      <h3>{mode === 'add' ? 'Add New Category' : 'Edit Category'}</h3>

      <div onClick={handleModeToggle}>
        {mode === 'add' ? (
          <BiSolidMessageSquareEdit title="Switch to Edit Mode" className="toggle-icon-cat" />
        ) : (
          <HiSquaresPlus title="Switch to Add Mode" className="toggle-icon-cat" />
        )}
      </div>

      {mode === 'edit' && (
        <div>
          <input
            className='search-field-cat'
            type="text"
            placeholder="Search Category Name"
            value={formData.Category_Name || ''}
            onChange={handleSearchChange}
          />
          <div className='search-field1-cat'>
            {searchLoading ? (
              <p className='CategoriesLoading'>⏳ Loading...</p>
            ) : searchError ? (
              <p className='NoCategoriesFound'>{searchError}</p>
            ) : searchResults.length > 0 ? (
              <select onChange={handleSelectCategory} value={formData._id || ''}>
                <option value="" disabled>Select category</option>
                {searchResults.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName || cat.Category_Name} ({cat.code})
                  </option>
                ))}
              </select>
            ) : (
              <p className='NoCategoriesFound'>No categories found...</p>
            )}
          </div>
        </div>
      )}

      <Form onSubmit={handleSubmit} className="category-form">
        <Form.Group className="form-group-cat">
          <Form.Label className="required-label">Category Name:</Form.Label>
          <Form.Control
            type="text"
            name="Category_Name"
            value={formData.Category_Name}
            onChange={handleChange}
            required
            placeholder="Enter category name"
          />
        </Form.Group>

        <Form.Group className="form-group-cat">
          <Form.Label className="required-label">Category Type:</Form.Label>
          <Form.Control
            as="select"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Architectural">Architectural</option>
            <option value="Interior">Interior</option>
            <option value="Constructions">Constructions</option>
            <option value="Consultants">Consultants</option>
            <option value="Manufacturers">Manufacturers</option>
            <option value="Others">Others</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="form-group-cat">
          <Form.Label className="required-label">Description:</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter category description"
          />
        </Form.Group>

        <Form.Group className="form-group-cat">
          <Form.Label className="required-label">Category Code:</Form.Label>
          <Form.Control
            type="text"
            name="Category_Code"
            value={formData.Category_Code}
            onChange={handleChange}
            required
            placeholder="Enter category code"
          />
        </Form.Group>

        <button type="submit" className="submit-button-cat" disabled={formLoading}>
          {formLoading ? (
            <FaSpinner className="spinner" size={20} />
          ) : mode === 'edit' ? (
            <FaCheckToSlot size={24} title='Save Update' className='SaveUpdateCat' />
          ) : (
            <HiSave size={24} title='Save New Category' className='NewCat' />
          )}
        </button>
      </Form>
    </div>
  );
};

export default CategorySection;
