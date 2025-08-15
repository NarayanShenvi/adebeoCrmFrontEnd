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
import { addProductCategoryAsync, updateProductCategoryAsync } from '../redux/slices/addProductCategoy';

const CategorySection = () => {
  const [mode, setMode] = useState('add');
  const [formData, setFormData] = useState({
    Category_Name: '',
    type: '',
    Category_description: '',
    Category_Code: '',
    _id: '',
    isEnabled: true, // default from start
  });

  // Separate search term (typed text)
  const [searchTerm, setSearchTerm] = useState('');

  // 🔑 NEW: keep the dropdown's own selected value separate from formData._id
  // This avoids the select being "stuck" and also allows unique values even when _id is missing
  const [selectedSearchValue, setSelectedSearchValue] = useState('');

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
      Category_description: '',
      Category_Code: '',
      _id: '',
      isEnabled: true,
    });
    // Also reset the search dropdown selection
    setSelectedSearchValue('');
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
    setSearchTerm('');
  };

  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term); // keep search term separate

    if (term.length >= 3) {
      try {
        setSearchLoading(true);
        setSearchError('');
        const response = await axios.get(`${API}/getAllCategories`, {
          params: { name: term }
        });
        const data = response?.data?.data ?? response?.data ?? [];
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchError('Unable to fetch categories.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
      setSearchError('');
    }
  };

  // Helper to generate a UNIQUE option value per row
  // Guarantees <select> change event will fire for every distinct row
  const makeOptionValue = (cat, idx) => {
    const id = cat?._id;
    const code = cat?.Category_Code;
    if (id !== undefined && id !== null && String(id).trim() !== '') return `id:${String(id)}`;
    if (code !== undefined && code !== null && String(code).trim() !== '') return `code:${String(code)}`;
    return `idx:${idx}`; // last-resort unique fallback
  };

  // Parse the unique option value back to find the actual selected item
  const findSelectedByValue = (value) => {
    if (!value) return undefined;
    if (value.startsWith('id:')) {
      const id = value.slice(3);
      return searchResults.find(c => String(c?._id) === id);
    }
    if (value.startsWith('code:')) {
      const code = value.slice(5);
      return searchResults.find(c => String(c?.Category_Code) === code);
    }
    if (value.startsWith('idx:')) {
      const idx = Number(value.slice(4));
      return searchResults[idx];
    }
    return undefined;
  };

  // Select category by unique encoded value (id / code / index)
  const handleSelectCategory = (e) => {
    const selectedValue = e.target.value;
    setSelectedSearchValue(selectedValue); // keep dropdown controlled by its own state

    const selected = findSelectedByValue(selectedValue);
    if (selected) {
      setFormData({
        _id: selected._id || '',
        Category_Name: selected.Category_Name || '',
        type: selected.type || '',
        Category_description: selected.Category_description || '',
        Category_Code: selected.Category_Code || '',
        isEnabled: selected.isEnabled !== undefined ? !!selected.isEnabled : true,
      });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFormLoading(true);

  try {
    if (mode === 'edit') {
      if (!formData.Category_Code) {
        alert("Category Code is required for update");
        setFormLoading(false);
        return;
      }

      // Dispatch the slice async thunk for update
      const action = await dispatch(updateProductCategoryAsync({
        categoryCode: formData.Category_Code,
        updateData: formData
      }));

      if (updateProductCategoryAsync.fulfilled.match(action)) {
        alert(action.payload?.message || "Category updated successfully");
        resetForm();
      } else if (updateProductCategoryAsync.rejected.match(action)) {
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
          alert('Category with this code already exists');
        } else {
          alert(msg);
        }
      }
    } else {
      // Add mode remains same
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
          alert('Category with this code already exists');
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
      alert('Category with this code already exists');
    } else {
      alert(msg);
    }
  } finally {
    setFormLoading(false);
  }
};


  const handleCatChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <div className='search-field1-cat'>
            {searchLoading ? (
              <p className='CategoriesLoading'>⏳ Loading...</p>
            ) : searchError ? (
              <p className='NoCategoriesFound'>{searchError}</p>
            ) : searchResults.length > 0 ? (
              <select
                onChange={handleSelectCategory}
                value={selectedSearchValue} // 🔑 use independent select state, not formData._id
              >
                <option value="" disabled>Select category</option>
                {searchResults.map((cat, idx) => {
                  const optionValue = makeOptionValue(cat, idx);
                  return (
                    <option
                      key={cat._id || cat.Category_Code || `${cat.Category_Name}-${idx}`}
                      value={optionValue}
                    >
                      {cat.Category_Name} ({cat.Category_Code})
                    </option>
                  );
                })}
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
            value={formData.Category_Name || ''}
            onChange={handleChange}
            required
            placeholder="Enter category name"
          />
        </Form.Group>

        <Form.Group className="form-group-cat">
          <Form.Label >Category Type:</Form.Label>
          <Form.Control
            as="select"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            
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
            name="Category_description"
            value={formData.Category_description || ''}
            onChange={handleChange}
            placeholder="Enter category description"
            required
          />
        </Form.Group>

        <Form.Group className="form-group-cat">
  <Form.Label className="required-label">Category Code:</Form.Label>
  <Form.Control
  
    type="text"
    name="Category_Code"
    value={formData.Category_Code || ''}
    onChange={handleChange}
    required
    placeholder="Enter category code"
    disabled={mode === "edit"}
  />
</Form.Group>


        <Form.Group className="form-group-cat mt-4 custom-checkbox-cat" controlId="categoryEnabled">
          <Form.Check
            type="checkbox"
            label="Category Enabled"
            name="isEnabled"
            checked={!!formData.isEnabled}
            onChange={handleCatChange}
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
