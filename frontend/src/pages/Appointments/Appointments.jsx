import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Calendar, User, Stethoscope, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { patientApi } from '../../api/patientApi';
import { doctorApi } from '../../api/doctorApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const Appointments = () => {
  const location = useLocation();

  // Core Data States
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocFilter, setSelectedDocFilter] = useState('');
  const [selectedPatFilter, setSelectedPatFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Selection States
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Form States & Errors
  const [formValues, setFormValues] = useState({
    appointmentDate: '',
    patientId: '',
    doctorId: '',
    prescriptionId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch all relational databases and appointments in parallel
  const loadPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appData, patData, docData, prescData] = await Promise.all([
        appointmentApi.getAll(),
        patientApi.getAll(),
        doctorApi.getAll(),
        prescriptionApi.getAll()
      ]);
      setAppointments(appData || []);
      setPatients(patData || []);
      setDoctors(docData || []);
      setPrescriptions(prescData || []);
    } catch (err) {
      setError(err.customMessage || 'Failed to sync with appointment databases.');
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
  }, [location.state, patients, doctors, prescriptions]); // Ensure dropdown lists are ready first

  // Modal Actions
  const handleOpenAddModal = () => {
    setSelectedAppointment(null);
    setFormValues({
      appointmentDate: new Date().toISOString().split('T')[0],
      patientId: patients[0]?.patientId || '',
      doctorId: doctors[0]?.doctorId || '',
      prescriptionId: prescriptions[0]?.prescriptionId || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setSelectedAppointment(app);
    setFormValues({
      appointmentDate: app.appointmentDate || '',
      patientId: app.patient?.patientId || '',
      doctorId: app.doctor?.doctorId || '',
      prescriptionId: app.prescription?.prescriptionId || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDetailModal = (app) => {
    setSelectedAppointment(app);
    setIsDetailOpen(true);
  };

  const handleOpenDeleteConfirm = (app) => {
    setSelectedAppointment(app);
    setIsConfirmOpen(true);
  };

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.appointmentDate) {
      errors.appointmentDate = 'Appointment date is required.';
    } else {
      const selectedDate = new Date(formValues.appointmentDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        errors.appointmentDate = 'Date cannot be in the past.';
      }
    }
    
    if (!formValues.patientId) {
      errors.patientId = 'Please select a patient.';
    }
    if (!formValues.doctorId) {
      errors.doctorId = 'Please select a doctor.';
    }
    if (!formValues.prescriptionId) {
      errors.prescriptionId = 'Please assign a prescription plan.';
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
      // Structure nested JPA object references as required by the backend
      const payload = {
        appointmentDate: formValues.appointmentDate,
        patient: {
          patientId: parseInt(formValues.patientId)
        },
        doctor: {
          doctorId: parseInt(formValues.doctorId)
        },
        prescription: {
          prescriptionId: parseInt(formValues.prescriptionId)
        }
      };

      if (selectedAppointment) {
        await appointmentApi.update(selectedAppointment.appointmentId, payload);
      } else {
        await appointmentApi.add(payload);
      }

      setIsFormOpen(false);
      loadPageData();
    } catch (err) {
      alert(err.customMessage || 'Failed to submit appointment booking.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Appointment
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await appointmentApi.delete(selectedAppointment.appointmentId);
      setIsConfirmOpen(false);
      loadPageData();
    } catch (err) {
      alert(err.customMessage || 'Failed to cancel appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering Logic
  const filteredAppointments = appointments.filter(app => {
    const pName = app.patient?.patientName?.toLowerCase() || '';
    const dName = app.doctor?.doctorName?.toLowerCase() || '';
    const deptName = app.doctor?.dept?.deptName?.toLowerCase() || '';

    const matchesSearch = 
      pName.includes(searchQuery.toLowerCase()) ||
      dName.includes(searchQuery.toLowerCase()) ||
      deptName.includes(searchQuery.toLowerCase()) ||
      app.appointmentId?.toString().includes(searchQuery);

    const matchesDoc = 
      !selectedDocFilter || 
      app.doctor?.doctorId?.toString() === selectedDocFilter;

    const matchesPat = 
      !selectedPatFilter || 
      app.patient?.patientId?.toString() === selectedPatFilter;

    const matchesDate = 
      !selectedDateFilter || 
      app.appointmentDate === selectedDateFilter;

    return matchesSearch && matchesDoc && matchesPat && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDocFilter, selectedPatFilter, selectedDateFilter]);

  // Check if system can schedule appointments
  const isPrerequisitesMissing = patients.length === 0 || doctors.length === 0 || prescriptions.length === 0;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Appointment Management</h1>
          <p className="page-subtitle">Schedule, update, and manage doctor consultations and therapy sessions.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={loadPageData} 
            loading={loading} 
            title="Refresh appointments"
          >
            Refresh
          </Button>
          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={handleOpenAddModal}
            disabled={isPrerequisitesMissing}
            title={isPrerequisitesMissing ? "Please populate Patients, Doctors, and Prescriptions first" : ""}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader type="table" rows={6} />
      ) : error ? (
        <ErrorState title="Database Error" message={error} onRetry={loadPageData} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No Appointments Scheduled"
          description={isPrerequisitesMissing ? "Please register Patients, Doctors, and Prescriptions first to begin booking." : "Schedule doctor consultations and link diagnostic prescriptions."}
          actionText={!isPrerequisitesMissing ? "Book Appointment" : null}
          onAction={handleOpenAddModal}
          actionIcon={Plus}
        />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {/* Filters Area */}
          <div className="table-filter-bar" style={{ gap: '12px' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by physician, patient, department or ID..."
              style={{ flex: '1 1 300px' }}
            />
            
            <div className="table-filters" style={{ flex: '2 1 auto', justifyContent: 'flex-end' }}>
              <select
                className="table-filter-select"
                value={selectedDocFilter}
                onChange={(e) => setSelectedDocFilter(e.target.value)}
              >
                <option value="">Filter by Doctor</option>
                {doctors.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>
                ))}
              </select>

              <select
                className="table-filter-select"
                value={selectedPatFilter}
                onChange={(e) => setSelectedPatFilter(e.target.value)}
              >
                <option value="">Filter by Patient</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
                ))}
              </select>

              <input
                type="date"
                className="table-filter-select"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                style={{ padding: '8px 10px' }}
              />

              {(selectedDocFilter || selectedPatFilter || selectedDateFilter) && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedDocFilter('');
                    setSelectedPatFilter('');
                    setSelectedDateFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
              
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Result Count: <strong>{filteredAppointments.length}</strong>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredAppointments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No appointment slots match the selected search filters.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Patient Name</th>
                      <th>Assigned Doctor</th>
                      <th>Clinical Dept</th>
                      <th>Assigned Rx Medicine</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((app) => (
                      <tr key={app.appointmentId}>
                        <td style={{ fontWeight: 600 }}>#{app.appointmentId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                            <span>{app.appointmentDate}</span>
                          </div>
                        </td>
                        <td>{app.patient?.patientName || <span style={{ color: 'var(--text-muted)' }}>Unknown Patient</span>}</td>
                        <td>{app.doctor?.doctorName || <span style={{ color: 'var(--text-muted)' }}>Unknown Doctor</span>}</td>
                        <td>
                          {app.doctor?.dept ? (
                            <span className="badge badge-indigo">
                              {app.doctor.dept.deptName}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          {app.prescription ? (
                            <span className="badge badge-blue">
                              {app.prescription.medicine}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>None</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-icon-btn view"
                              title="View details"
                              onClick={() => handleOpenDetailModal(app)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="action-icon-btn edit"
                              title="Edit schedule"
                              onClick={() => handleOpenEditModal(app)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-icon-btn delete"
                              title="Cancel appointment"
                              onClick={() => handleOpenDeleteConfirm(app)}
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

              {/* Pagination controls */}
              <div className="table-footer">
                <div>
                  Showing <span className="pagination-info">{Math.min(indexOfFirstItem + 1, filteredAppointments.length)}</span> to{' '}
                  <span className="pagination-info">{Math.min(indexOfLastItem, filteredAppointments.length)}</span> of{' '}
                  <span className="pagination-info">{filteredAppointments.length}</span> appointments
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

      {/* Booking Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedAppointment ? 'Reschedule Appointment Slot' : 'Book Consultant Appointment'}
        size="md"
      >
        {isPrerequisitesMissing ? (
          <div className="error-state-container" style={{ margin: 0, border: 'none', padding: 0 }}>
            <p style={{ color: 'var(--danger-text)' }}>
              Cannot schedule appointments. Please make sure patients, doctors, and prescriptions are created.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">
                Appointment Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                className="form-input"
                value={formValues.appointmentDate}
                onChange={handleInputChange}
              />
              {formErrors.appointmentDate && <span className="form-error-msg">{formErrors.appointmentDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Select Patient <span className="required">*</span>
              </label>
              <select
                name="patientId"
                className="form-select"
                value={formValues.patientId}
                onChange={handleInputChange}
              >
                <option value="" disabled>Choose Patient...</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>{p.patientName} (Age: {p.age}, ID: #{p.patientId})</option>
                ))}
              </select>
              {formErrors.patientId && <span className="form-error-msg">{formErrors.patientId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Select Doctor <span className="required">*</span>
              </label>
              <select
                name="doctorId"
                className="form-select"
                value={formValues.doctorId}
                onChange={handleInputChange}
              >
                <option value="" disabled>Choose Doctor...</option>
                {doctors.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>Dr. {d.doctorName} ({d.specialization} - {d.dept?.deptName || 'Unassigned'})</option>
                ))}
              </select>
              {formErrors.doctorId && <span className="form-error-msg">{formErrors.doctorId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Select Rx Prescription Plan <span className="required">*</span>
              </label>
              <select
                name="prescriptionId"
                className="form-select"
                value={formValues.prescriptionId}
                onChange={handleInputChange}
              >
                <option value="" disabled>Choose Prescription Plan...</option>
                {prescriptions.map(pr => (
                  <option key={pr.prescriptionId} value={pr.prescriptionId}>{pr.medicine} ({pr.Dosage || pr.dosage})</option>
                ))}
              </select>
              {formErrors.prescriptionId && <span className="form-error-msg">{formErrors.prescriptionId}</span>}
            </div>

            <div className="form-actions">
              <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {selectedAppointment ? 'Save Changes' : 'Confirm Appointment'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Consultation Details"
        size="md"
      >
        {selectedAppointment && (
          <div className="confirm-dialog-content" style={{ textAlign: 'left', alignItems: 'flex-start', padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', width: '100%' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'
              }}>
                <Calendar size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Appointment Slot #{selectedAppointment.appointmentId}</h4>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Date: {selectedAppointment.appointmentDate}</span>
              </div>
            </div>

            <div className="detail-grid" style={{ width: '100%', gap: '16px 24px' }}>
              <div className="detail-item">
                <span className="detail-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> Patient Name
                  </span>
                </span>
                <span className="detail-value">{selectedAppointment.patient?.patientName || 'Unknown Patient'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Patient ID</span>
                <span className="detail-value">#{selectedAppointment.patient?.patientId || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Stethoscope size={12} /> Assigned Physician
                  </span>
                </span>
                <span className="detail-value">{selectedAppointment.doctor?.doctorName || 'Unknown Doctor'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Specialization / Department</span>
                <span className="detail-value">
                  {selectedAppointment.doctor?.specialization || 'General'} ({selectedAppointment.doctor?.dept?.deptName || 'Unassigned'})
                </span>
              </div>
              
              <div className="detail-item" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
                <span className="detail-label" style={{ marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FileSpreadsheet size={12} /> Prescription Plan Details
                </span>
                {selectedAppointment.prescription ? (
                  <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                      Medicine: {selectedAppointment.prescription.medicine}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                      Instructions: {selectedAppointment.prescription.Dosage || selectedAppointment.prescription.dosage}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No prescription attached to this appointment.</span>
                )}
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

      {/* Cancel Appointment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Cancel Appointment"
        message={selectedAppointment ? `Are you sure you want to permanently cancel and delete appointment #${selectedAppointment.appointmentId} for patient "${selectedAppointment.patient?.patientName || 'Unknown'}"?` : ''}
        loading={submitting}
      />
    </div>
  );
};

export default Appointments;
