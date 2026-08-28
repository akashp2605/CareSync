import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, MapPin, Building2, RefreshCw } from 'lucide-react';
import { departmentApi } from '../../api/departmentApi';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const Departments = () => {
  const location = useLocation();

  // Core Data States
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Selection States
  const [selectedDept, setSelectedDept] = useState(null);

  // Form States & Errors
  const [formValues, setFormValues] = useState({
    deptName: '',
    deptLocation: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load department records
  const loadDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await departmentApi.getAll();
      setDepartments(data || []);
    } catch (err) {
      setError(err.customMessage || 'Failed to load department records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Handle Quick Action navigation trigger from Dashboard
  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenAddModal();
      // Clear location state history
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Modal Actions
  const handleOpenAddModal = () => {
    setSelectedDept(null);
    setFormValues({ deptName: '', deptLocation: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setSelectedDept(dept);
    setFormValues({
      deptName: dept.deptName || '',
      deptLocation: dept.deptLocation || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDeleteConfirm = (dept) => {
    setSelectedDept(dept);
    setIsConfirmOpen(true);
  };

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.deptName.trim()) {
      errors.deptName = 'Department name is required.';
    }
    if (!formValues.deptLocation.trim()) {
      errors.deptLocation = 'Department location is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        deptName: formValues.deptName.trim(),
        deptLocation: formValues.deptLocation.trim()
      };

      if (selectedDept) {
        // Edit mode
        await departmentApi.update(selectedDept.deptId, payload);
      } else {
        // Add mode
        await departmentApi.add(payload);
      }

      setIsFormOpen(false);
      loadDepartments();
    } catch (err) {
      alert(err.customMessage || 'Failed to save department record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Department
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await departmentApi.delete(selectedDept.deptId);
      setIsConfirmOpen(false);
      loadDepartments();
    } catch (err) {
      alert(err.customMessage || 'Failed to delete department. Some doctor records might depend on this department.');
    } finally {
      setSubmitting(false);
    }
  };

  // Search Logic
  const filteredDepartments = departments.filter(dept =>
    dept.deptName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.deptLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.deptId?.toString().includes(searchQuery)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Department Management</h1>
          <p className="page-subtitle">Manage hospital departments, wings, and administrative locations.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          Add Department
        </Button>
      </div>

      {loading ? (
        <Loader type="table" rows={6} />
      ) : error ? (
        <ErrorState title="Database Error" message={error} onRetry={loadDepartments} />
      ) : departments.length === 0 ? (
        <EmptyState
          title="No Departments Created"
          description="Click Add Department to set up your first clinical department."
          actionText="Add Department"
          onAction={handleOpenAddModal}
          actionIcon={Plus}
        />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {/* Filter / Search Bar */}
          <div className="table-filter-bar">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search departments by name or location..."
            />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Total Count: <strong>{filteredDepartments.length}</strong>
            </div>
          </div>

          {/* Table */}
          {filteredDepartments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No departments match search filter "{searchQuery}"</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Dept ID</th>
                      <th>Department Name</th>
                      <th>Location / Wing</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((dept) => (
                      <tr key={dept.deptId}>
                        <td style={{ fontWeight: 600 }}>#{dept.deptId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <Building2 size={16} />
                            </div>
                            <span style={{ fontWeight: 500 }}>{dept.deptName}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                            <span>{dept.deptLocation}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-icon-btn edit"
                              title="Edit department"
                              onClick={() => handleOpenEditModal(dept)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-icon-btn delete"
                              title="Delete department"
                              onClick={() => handleOpenDeleteConfirm(dept)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination */}
              <div className="table-footer">
                <div>
                  Showing <span className="pagination-info">{Math.min(indexOfFirstItem + 1, filteredDepartments.length)}</span> to{' '}
                  <span className="pagination-info">{Math.min(indexOfLastItem, filteredDepartments.length)}</span> of{' '}
                  <span className="pagination-info">{filteredDepartments.length}</span> departments
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ margin: '0 8px', fontWeight: 500 }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Form Modal (Add / Edit) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedDept ? 'Edit Department Details' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Department Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="deptName"
              className="form-input"
              value={formValues.deptName}
              onChange={handleInputChange}
              placeholder="e.g. Cardiology, Pediatrics"
            />
            {formErrors.deptName && <span className="form-error-msg">{formErrors.deptName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Location / Building / Wing <span className="required">*</span>
            </label>
            <input
              type="text"
              name="deptLocation"
              className="form-input"
              value={formValues.deptLocation}
              onChange={handleInputChange}
              placeholder="e.g. Building A, 3rd Floor"
            />
            {formErrors.deptLocation && <span className="form-error-msg">{formErrors.deptLocation}</span>}
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={selectedDept ? `Are you sure you want to permanently delete the department "${selectedDept.deptName}"? This may fail if doctors or appointments are currently linked to this department.` : ''}
        loading={submitting}
      />
    </div>
  );
};

export default Departments;
