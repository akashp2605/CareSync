import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Stethoscope, Award, Building2, RefreshCw } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { departmentApi } from '../../api/departmentApi';
import { specialityApi } from '../../api/specialityApi';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const Doctors = () => {
  const location = useLocation();

  // Core Data States
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Selection States
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form States & Errors
  const [formValues, setFormValues] = useState({
    doctorName: '',
    specialization: '',
    phone: '',
    deptId: '',
    selectedSpecialityIds: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch all doctors, departments, and specialities in parallel
  const loadPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsData, deptsData, specsData] = await Promise.all([
        doctorApi.getAll(),
        departmentApi.getAll(),
        specialityApi.getAll()
      ]);
      setDoctors(docsData || []);
      setDepartments(deptsData || []);
      setSpecialities(specsData || []);
    } catch (err) {
      setError(err.customMessage || 'Failed to load doctor database from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  // Handle Quick Action navigation trigger from Dashboard
  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenAddModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, departments, specialities]); // Ensure dropdowns are loaded before modal opens

  // Modal Actions
  const handleOpenAddModal = () => {
    setSelectedDoctor(null);
    setFormValues({
      doctorName: '',
      specialization: '',
      phone: '',
      deptId: departments[0]?.deptId || '',
      selectedSpecialityIds: []
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormValues({
      doctorName: doctor.doctorName || '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      deptId: doctor.dept?.deptId || '',
      selectedSpecialityIds: doctor.speciality?.map(s => s.specialityId) || []
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDetailModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailOpen(true);
  };

  const handleOpenDeleteConfirm = (doctor) => {
    setSelectedDoctor(doctor);
    setIsConfirmOpen(true);
  };

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.doctorName.trim()) {
      errors.doctorName = 'Doctor name is required.';
    }
    if (!formValues.specialization.trim()) {
      errors.specialization = 'Primary specialization text is required.';
    }
    if (!formValues.phone.trim()) {
      errors.phone = 'Mobile phone number is required.';
    } else {
      const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
      if (!phoneRegex.test(formValues.phone)) {
        errors.phone = 'Please enter a valid phone number (7-15 digits).';
      }
    }
    if (!formValues.deptId) {
      errors.deptId = 'Please select a clinical department.';
    }
    if (formValues.selectedSpecialityIds.length === 0) {
      errors.selectedSpecialityIds = 'Please select at least one speciality qualification.';
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

  // Handle Speciality Checkbox toggle
  const handleSpecialityToggle = (specId) => {
    setFormValues(prev => {
      const currentIds = prev.selectedSpecialityIds;
      const updatedIds = currentIds.includes(specId)
        ? currentIds.filter(id => id !== specId)
        : [...currentIds, specId];
      
      const newErrors = { ...formErrors };
      if (updatedIds.length > 0) {
        delete newErrors.selectedSpecialityIds;
      }
      setFormErrors(newErrors);

      return {
        ...prev,
        selectedSpecialityIds: updatedIds
      };
    });
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Map form values to JPA nested object payload structure
      const payload = {
        doctorName: formValues.doctorName.trim(),
        specialization: formValues.specialization.trim(),
        phone: formValues.phone.trim(),
        dept: {
          deptId: parseInt(formValues.deptId)
        },
        speciality: formValues.selectedSpecialityIds.map(id => ({
          specialityId: id
        }))
      };

      if (selectedDoctor) {
        await doctorApi.update(selectedDoctor.doctorId, payload);
      } else {
        await doctorApi.add(payload);
      }

      setIsFormOpen(false);
      loadPageData();
    } catch (err) {
      alert(err.customMessage || 'Failed to save doctor details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Doctor
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await doctorApi.delete(selectedDoctor.doctorId);
      setIsConfirmOpen(false);
      loadPageData();
    } catch (err) {
      alert(err.customMessage || 'Failed to delete doctor record. Check if they have active appointments.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering Logic
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.doctorId?.toString().includes(searchQuery);

    const matchesDept = 
      !selectedDeptFilter || 
      doctor.dept?.deptId?.toString() === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDeptFilter]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Doctor Management</h1>
          <p className="page-subtitle">Add, edit, assign departments, and configure specialities for clinical staff.</p>
        </div>
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={handleOpenAddModal}
          disabled={departments.length === 0}
          title={departments.length === 0 ? "Create a department first" : ""}
        >
          Register Doctor
        </Button>
      </div>

      {loading ? (
        <Loader type="table" rows={6} />
      ) : error ? (
        <ErrorState title="Database Error" message={error} onRetry={loadPageData} />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No Doctors Registered"
          description="Register your clinical practitioners and assign them to departments."
          actionText="Register Doctor"
          onAction={handleOpenAddModal}
          actionIcon={Plus}
        />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {/* Filters Bar */}
          <div className="table-filter-bar">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search doctors by name or specialization..."
            />
            <div className="table-filters">
              <select
                className="table-filter-select"
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.deptId} value={dept.deptId}>{dept.deptName}</option>
                ))}
              </select>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Matching: <strong>{filteredDoctors.length}</strong>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredDoctors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No doctors match the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Doctor ID</th>
                      <th>Physician Name</th>
                      <th>Department</th>
                      <th>Specialization</th>
                      <th>Speciality Qualifications</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((doc) => (
                      <tr key={doc.doctorId}>
                        <td style={{ fontWeight: 600 }}>#{doc.doctorId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                              {doc.doctorName?.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{doc.doctorName}</span>
                          </div>
                        </td>
                        <td>
                          {doc.dept ? (
                            <span className="badge badge-indigo">
                              {doc.dept.deptName}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                          )}
                        </td>
                        <td>{doc.specialization}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {doc.speciality && doc.speciality.length > 0 ? (
                              doc.speciality.map(s => (
                                <span key={s.specialityId} className="badge badge-blue" style={{ fontSize: '11px' }}>
                                  {s.name}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-icon-btn view"
                              title="View details"
                              onClick={() => handleOpenDetailModal(doc)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="action-icon-btn edit"
                              title="Edit doctor details"
                              onClick={() => handleOpenEditModal(doc)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-icon-btn delete"
                              title="Delete doctor"
                              onClick={() => handleOpenDeleteConfirm(doc)}
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

              {/* Table Footer Pagination */}
              <div className="table-footer">
                <div>
                  Showing <span className="pagination-info">{Math.min(indexOfFirstItem + 1, filteredDoctors.length)}</span> to{' '}
                  <span className="pagination-info">{Math.min(indexOfLastItem, filteredDoctors.length)}</span> of{' '}
                  <span className="pagination-info">{filteredDoctors.length}</span> doctors
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
        title={selectedDoctor ? 'Edit Doctor Records' : 'Register New Doctor'}
        size="md"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Doctor Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="doctorName"
              className="form-input"
              value={formValues.doctorName}
              onChange={handleInputChange}
              placeholder="e.g. Dr. Sarah Connor"
            />
            {formErrors.doctorName && <span className="form-error-msg">{formErrors.doctorName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Mobile Phone Number <span className="required">*</span>
            </label>
            <input
              type="text"
              name="phone"
              className="form-input"
              value={formValues.phone}
              onChange={handleInputChange}
              placeholder="e.g. 9876543211"
            />
            {formErrors.phone && <span className="form-error-msg">{formErrors.phone}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                name="deptId"
                className="form-select"
                value={formValues.deptId}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select Department</option>
                {departments.map(d => (
                  <option key={d.deptId} value={d.deptId}>{d.deptName} - {d.deptLocation}</option>
                ))}
              </select>
              {formErrors.deptId && <span className="form-error-msg">{formErrors.deptId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Specialization Description <span className="required">*</span>
              </label>
              <input
                type="text"
                name="specialization"
                className="form-input"
                value={formValues.specialization}
                onChange={handleInputChange}
                placeholder="e.g. Cardiology, Orthopedic Surgeon"
              />
              {formErrors.specialization && <span className="form-error-msg">{formErrors.specialization}</span>}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">
              Speciality Qualifications <span className="required">*</span>
            </label>
            {specialities.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '10px', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                No specialities configured. Add specialities in Speciality Management first.
              </div>
            ) : (
              <div className="speciality-checkbox-grid">
                {specialities.map(spec => (
                  <label key={spec.specialityId} className="speciality-checkbox-label">
                    <input
                      type="checkbox"
                      className="speciality-checkbox-input"
                      checked={formValues.selectedSpecialityIds.includes(spec.specialityId)}
                      onChange={() => handleSpecialityToggle(spec.specialityId)}
                    />
                    <span>{spec.name}</span>
                  </label>
                ))}
              </div>
            )}
            {formErrors.selectedSpecialityIds && <span className="form-error-msg">{formErrors.selectedSpecialityIds}</span>}
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedDoctor ? 'Save Changes' : 'Register Doctor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Doctor Profile Details"
        size="md"
      >
        {selectedDoctor && (
          <div className="confirm-dialog-content" style={{ textAlign: 'left', alignItems: 'flex-start', padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', width: '100%' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'
              }}>
                <Stethoscope size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{selectedDoctor.doctorName}</h4>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Licensed Practitioner #{selectedDoctor.doctorId}</span>
              </div>
            </div>

            <div className="detail-grid" style={{ width: '100%', gap: '16px 24px' }}>
              <div className="detail-item">
                <span className="detail-label">Doctor Name</span>
                <span className="detail-value">{selectedDoctor.doctorName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Primary Specialization</span>
                <span className="detail-value">{selectedDoctor.specialization}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Mobile</span>
                <span className="detail-value">{selectedDoctor.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{selectedDoctor.dept?.deptName || 'Unassigned'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department Location</span>
                <span className="detail-value">{selectedDoctor.dept?.deptLocation || 'N/A'}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-label">Speciality Qualifications</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {selectedDoctor.speciality && selectedDoctor.speciality.length > 0 ? (
                    selectedDoctor.speciality.map(s => (
                      <span key={s.specialityId} className="badge badge-indigo">
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>None specified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ width: '100%', marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Close Profile
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
        title="Delete Doctor Record"
        message={selectedDoctor ? `Are you sure you want to permanently delete Dr. ${selectedDoctor.doctorName}? Any active appointments scheduled under this physician will be unassigned.` : ''}
        loading={submitting}
      />
    </div>
  );
};

export default Doctors;
