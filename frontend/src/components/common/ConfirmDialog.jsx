import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action? This cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger' // danger, warning, primary
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-dialog-content">
        <div className={`confirm-icon-wrapper ${variant === 'danger' ? 'rose' : 'amber'}`} style={{
          backgroundColor: variant === 'danger' ? 'var(--danger-light)' : 'var(--warning-light)',
          color: variant === 'danger' ? 'var(--danger)' : 'var(--warning)'
        }}>
          <AlertTriangle size={32} />
        </div>
        <h4 className="confirm-title">{title}</h4>
        <p className="confirm-text">{message}</p>
        
        <div className="form-actions" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm} 
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
