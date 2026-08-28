import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { prescriptionApi } from '../../api/prescriptionApi';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const Prescriptions = () => {
  // Core Data States
  const [prescriptions, setPrescriptions] = useState([]);
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
  const [selectedPresc, setSelectedPresc] = useState(null);

  // Form States & Errors
  const [formValues, setFormValues] = useState({
    medicine: '',
    dosage: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load prescription records
  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await prescriptionApi.getAll();
      setPrescriptions(data || []);
    } catch (err) {
      setError(err.customMessage || 'Failed to load prescription data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  // Modal Actions
  const handleOpenAddModal = () => {
    setSelectedPresc(null);
    setFormValues({ medicine: '', dosage: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (presc) => {
    setSelectedPresc(presc);
    setFormValues({
      medicine: presc.medicine || '',
      // Support both casing patterns just in case
      dosage: presc.Dosage || presc.dosage || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDeleteConfirm = (presc) => {
    setSelectedPresc(presc);
    setIsConfirmOpen(true);
  };

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.medicine.trim()) {
      errors.medicine = 'Medicine name is required.';
    }
    if (!formValues.dosage.trim()) {
      errors.dosage = 'Dosage instructions are required.';
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
      // Create a payload that is resilient to Lombok/Jackson serialization variations
      // for "Dosage" vs "dosage".
      const payload = {
        medicine: formValues.medicine.trim(),
        Dosage: formValues.dosage.trim(), // Match exact Java entity field 'Dosage'
        dosage: formValues.dosage.trim()  // Fallback property mapping
      };

      if (selectedPresc) {
        await prescriptionApi.update(selectedPresc.prescriptionId, payload);
      } else {
        await prescriptionApi.add(payload);
      }

      setIsFormOpen(false);
      loadPrescriptions();
    } catch (err) {
      alert(err.customMessage || 'Failed to save prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Prescription
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await prescriptionApi.delete(selectedPresc.prescriptionId);
      setIsConfirmOpen(false);
      loadPrescriptions();
    } catch (err) {
      alert(err.customMessage || 'Failed to delete prescription. Make sure it is not linked to any active appointments.');
    } finally {
      setSubmitting(false);
    }
  };

  // Search Logic
  const filteredPrescriptions = prescriptions.filter(presc =>
    presc.medicine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (presc.Dosage || presc.dosage)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    presc.prescriptionId?.toString().includes(searchQuery)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrescriptions.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Prescription Management</h1>
          <p className="page-subtitle">Configure therapeutic medicines, formulas, and dosage plans.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          Add Prescription
        </Button>
      </div>

      {loading ? (
        <Loader type="table" rows={6} />
      ) : error ? (
        <ErrorState title="Database Error" message={error} onRetry={loadPrescriptions} />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          title="No Prescriptions Recorded"
          description="Click Add Prescription to enter a medicine catalog item."
          actionText="Add Prescription"
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
              placeholder="Search by medicine name or dosage..."
            />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Total Count: <strong>{filteredPrescriptions.length}</strong>
            </div>
          </div>

          {/* Table */}
          {filteredPrescriptions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No prescriptions match search filter "{searchQuery}"</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Prescription ID</th>
                      <th>Medicine Name</th>
                      <th>Recommended Dosage</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((presc) => (
                      <tr key={presc.prescriptionId}>
                        <td style={{ fontWeight: 600 }}>#{presc.prescriptionId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <FileSpreadsheet size={16} />
                            </div>
                            <span style={{ fontWeight: 500 }}>{presc.medicine}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-emerald">
                            {presc.Dosage || presc.dosage}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-icon-btn edit"
                              title="Edit prescription"
                              onClick={() => handleOpenEditModal(presc)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-icon-btn delete"
                              title="Delete prescription"
                              onClick={() => handleOpenDeleteConfirm(presc)}
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
                  Showing <span className="pagination-info">{Math.min(indexOfFirstItem + 1, filteredPrescriptions.length)}</span> to{' '}
                  <span className="pagination-info">{Math.min(indexOfLastItem, filteredPrescriptions.length)}</span> of{' '}
                  <span className="pagination-info">{filteredPrescriptions.length}</span> prescriptions
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
        title={selectedPresc ? 'Edit Prescription Details' : 'Add New Prescription'}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Medicine Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="medicine"
              className="form-input"
              value={formValues.medicine}
              onChange={handleInputChange}
              placeholder="e.g. Paracetamol, Amoxicillin 500mg"
            />
            {formErrors.medicine && <span className="form-error-msg">{formErrors.medicine}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Dosage instructions <span className="required">*</span>
            </label>
            <input
              type="text"
              name="dosage"
              className="form-input"
              value={formValues.dosage}
              onChange={handleInputChange}
              placeholder="e.g. 1 tablet every 8 hours, 5ml daily"
            />
            {formErrors.dosage && <span className="form-error-msg">{formErrors.dosage}</span>}
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedPresc ? 'Save Changes' : 'Create Prescription'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Prescription"
        message={selectedPresc ? `Are you sure you want to permanently delete the prescription for "${selectedPresc.medicine}"? This action will fail if the prescription is linked to active appointments.` : ''}
        loading={submitting}
      />
    </div>
  );
};

export default Prescriptions;
