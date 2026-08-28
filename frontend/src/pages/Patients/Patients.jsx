import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, User, Calendar, Phone, RefreshCw } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const Patients = () => {
  const location = useLocation();

  // Core Data States
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Selection States
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Form States & Errors
  const [formValues, setFormValues] = useState({
    patientName: '',
    age: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load patient records
  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientApi.getAll();
      setPatients(data || []);
    } catch (err) {
      setError(err.customMessage || 'Failed to load patient records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Handle Quick Action navigation trigger from Dashboard
  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenAddModal();
      // Clear location state history so it doesn't trigger on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Modal Actions
  const handleOpenAddModal = () => {
    setSelectedPatient(null);
    setFormValues({ patientName: '', age: '', phone: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormValues({
      patientName: patient.patientName || '',
      age: patient.age || '',
      phone: patient.phone || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDetailModal = (patient) => {
    setSelectedPatient(patient);
    setIsDetailOpen(true);
  };

  const handleOpenDeleteConfirm = (patient) => {
    setSelectedPatient(patient);
    setIsConfirmOpen(true);
  };

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.patientName.trim()) {
      errors.patientName = 'Patient name is required.';
    }
    
    if (!formValues.age) {
      errors.age = 'Age is required.';
    } else {
      const parsedAge = parseInt(formValues.age);
      if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 125) {
        errors.age = 'Please enter a valid age (1-125).';
      }
    }

    if (!formValues.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else {
      const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
      if (!phoneRegex.test(formValues.phone)) {
        errors.phone = 'Please enter a valid phone number (7-15 digits).';
      }
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
        patientName: formValues.patientName.trim(),
        age: parseInt(formValues.age),
        phone: formValues.phone.trim()
      };

      if (selectedPatient) {
        // Edit mode
        await patientApi.update(selectedPatient.patientId, payload);
      } else {
        // Add mode
        await patientApi.add(payload);
      }
      
      setIsFormOpen(false);
      loadPatients();
    } catch (err) {
      alert(err.customMessage || 'Failed to save patient record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Patient
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await patientApi.delete(selectedPatient.patientId);
      setIsConfirmOpen(false);
      loadPatients();
    } catch (err) {
      alert(err.customMessage || 'Failed to delete patient record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Search and Filter Logic
  const filteredPatients = patients.filter(patient =>
    patient.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId?.toString().includes(searchQuery)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    // Reset to page 1 on search change
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Patient Management</h1>
          <p className="page-subtitle">Add, edit, view details, and manage hospital patient registrations.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          Register Patient
        </Button>
      </div>

      {loading ? (
        <Loader type="table" rows={6} />
      ) : error ? (
        <ErrorState title="Database Error" message={error} onRetry={loadPatients} />
      ) : patients.length === 0 ? (
        <EmptyState 
          title="No Patients Registered" 
          description="Click Register Patient to create your first record."
          actionText="Register Patient"
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
              placeholder="Search patients by name or ID..."
            />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Total Count: <strong>{filteredPatients.length}</strong>
            </div>
          </div>

          {/* Table */}
          {filteredPatients.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No patients match search filter "{searchQuery}"</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Patient Name</th>
                      <th>Age</th>
                      <th>Phone Number</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((patient) => (
                      <tr key={patient.patientId}>
                        <td style={{ fontWeight: 600 }}>#{patient.patientId}</td>
                        <td>{patient.patientName}</td>
                        <td>{patient.age} yrs</td>
                        <td>{patient.phone}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-icon-btn view"
                              title="View details"
                              onClick={() => handleOpenDetailModal(patient)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="action-icon-btn edit"
                              title="Edit patient"
                              onClick={() => handleOpenEditModal(patient)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-icon-btn delete"
                              title="Delete patient"
                              onClick={() => handleOpenDeleteConfirm(patient)}
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
                  Showing <span className="pagination-info">{Math.min(indexOfFirstItem + 1, filteredPatients.length)}</span> to{' '}
                  <span className="pagination-info">{Math.min(indexOfLastItem, filteredPatients.length)}</span> of{' '}
                  <span className="pagination-info">{filteredPatients.length}</span> patients
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
        title={selectedPatient ? 'Edit Patient Record' : 'Register New Patient'}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Patient Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="patientName"
              className="form-input"
              value={formValues.patientName}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
            />
            {formErrors.patientName && <span className="form-error-msg">{formErrors.patientName}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Age (Years) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="age"
                className="form-input"
                value={formValues.age}
                onChange={handleInputChange}
                placeholder="e.g. 34"
                min="1"
              />
              {formErrors.age && <span className="form-error-msg">{formErrors.age}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="phone"
                className="form-input"
                value={formValues.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1 555-0199"
              />
              {formErrors.phone && <span className="form-error-msg">{formErrors.phone}</span>}
            </div>
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedPatient ? 'Save Changes' : 'Register'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Patient Details"
        size="sm"
      >
        {selectedPatient && (
          <div className="confirm-dialog-content" style={{ textAlign: 'left', alignItems: 'flex-start', padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', width: '100%' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'
              }}>
                <User size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{selectedPatient.patientName}</h4>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Patient Record #{selectedPatient.patientName ? selectedPatient.patientId : ''}</span>
              </div>
            </div>

            <div className="detail-grid" style={{ width: '100%', gap: '16px 24px' }}>
              <div className="detail-item">
                <span className="detail-label">Patient ID</span>
                <span className="detail-value">#{selectedPatient.patientId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Patient Name</span>
                <span className="detail-value">{selectedPatient.patientName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age</span>
                <span className="detail-value">{selectedPatient.age} Years</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{selectedPatient.phone}</span>
              </div>
            </div>

            <div className="form-actions" style={{ width: '100%', marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Close Window
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Patient Record"
        message={selectedPatient ? `Are you sure you want to permanently delete patient "${selectedPatient.patientName}"? All active appointments will be canceled.` : ''}
        loading={submitting}
      />
    </div>
  );
};

export default Patients;
