import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, RefreshCw } from 'lucide-react';
import { specialityApi } from '../../api/specialityApi';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const Specialities = () => {
  // Core Data States
  const [specialities, setSpecialities] = useState([]);
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
  const [selectedSpec, setSelectedSpec] = useState(null);

  // Form States & Errors
  const [formValues, setFormValues] = useState({
    name: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load speciality records
  const loadSpecialities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await specialityApi.getAll();
      setSpecialities(data || []);
    } catch (err) {
      setError(err.customMessage || 'Failed to load speciality records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialities();
  }, []);

  // Modal Actions
  const handleOpenAddModal = () => {
    setSelectedSpec(null);
    setFormValues({ name: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (spec) => {
    setSelectedSpec(spec);
    setFormValues({
      name: spec.name || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDeleteConfirm = (spec) => {
    setSelectedSpec(spec);
    setIsConfirmOpen(true);
  };

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.name.trim()) {
      errors.name = 'Speciality name is required.';
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
        name: formValues.name.trim()
      };

      if (selectedSpec) {
        await specialityApi.update(selectedSpec.specialityId, payload);
      } else {
        await specialityApi.add(payload);
      }

      setIsFormOpen(false);
      loadSpecialities();
    } catch (err) {
      alert(err.customMessage || 'Failed to save speciality record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Speciality
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await specialityApi.delete(selectedSpec.specialityId);
      setIsConfirmOpen(false);
      loadSpecialities();
    } catch (err) {
      alert(err.customMessage || 'Failed to delete speciality. Some doctor records might depend on this speciality.');
    } finally {
      setSubmitting(false);
    }
  };

  // Search Logic
  const filteredSpecialities = specialities.filter(spec =>
    spec.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spec.specialityId?.toString().includes(searchQuery)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredSpecialities.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSpecialities.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Speciality Management</h1>
          <p className="page-subtitle">Configure clinical specialities and medical qualifications for physicians.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={loadSpecialities} 
            loading={loading} 
            title="Refresh specialities"
          >
            Refresh
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add Speciality
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader type="table" rows={6} />
      ) : error ? (
        <ErrorState title="Database Error" message={error} onRetry={loadSpecialities} />
      ) : specialities.length === 0 ? (
        <EmptyState
          title="No Specialities Created"
          description="Click Add Speciality to configure the medical qualifications in the system."
          actionText="Add Speciality"
          onAction={handleOpenAddModal}
          actionIcon={Plus}
        />
      ) : (
        <div className="card" style={{ padding: 0, maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          {/* Filter / Search Bar */}
          <div className="table-filter-bar">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search specialities by name..."
            />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Total Count: <strong>{filteredSpecialities.length}</strong>
            </div>
          </div>

          {/* Table */}
          {filteredSpecialities.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No specialities match search filter "{searchQuery}"</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Speciality Name</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((spec) => (
                      <tr key={spec.specialityId}>
                        <td style={{ fontWeight: 600 }}>#{spec.specialityId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <Award size={16} />
                            </div>
                            <span style={{ fontWeight: 500 }}>{spec.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-icon-btn edit"
                              title="Edit speciality"
                              onClick={() => handleOpenEditModal(spec)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-icon-btn delete"
                              title="Delete speciality"
                              onClick={() => handleOpenDeleteConfirm(spec)}
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
                  Showing <span className="pagination-info">{Math.min(indexOfFirstItem + 1, filteredSpecialities.length)}</span> to{' '}
                  <span className="pagination-info">{Math.min(indexOfLastItem, filteredSpecialities.length)}</span> of{' '}
                  <span className="pagination-info">{filteredSpecialities.length}</span> specialities
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
        title={selectedSpec ? 'Edit Speciality Details' : 'Add New Speciality'}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Speciality Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formValues.name}
              onChange={handleInputChange}
              placeholder="e.g. Cardiologist, Neurologist, Pediatrician"
            />
            {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedSpec ? 'Save Changes' : 'Create Speciality'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Speciality"
        message={selectedSpec ? `Are you sure you want to permanently delete the speciality "${selectedSpec.name}"? This may fail if doctor records are currently linked to it.` : ''}
        loading={submitting}
      />
    </div>
  );
};

export default Specialities;
