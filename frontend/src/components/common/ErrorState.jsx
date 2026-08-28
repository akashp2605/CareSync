import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Connection Error',
  message = 'Failed to load data from the server.',
  onRetry
}) => {
  return (
    <div className="error-state-container">
      <div className="error-icon-wrapper">
        <AlertCircle size={48} strokeWidth={1.5} />
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-description">{message}</p>
      {onRetry && (
        <Button 
          variant="secondary" 
          onClick={onRetry} 
          icon={RefreshCw}
          style={{ marginTop: '8px' }}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
