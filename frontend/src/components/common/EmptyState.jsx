import React from 'react';
import { Database } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Database,
  title = 'No Records Found',
  description = 'There are no items to display at the moment.',
  actionText,
  onAction,
  actionIcon
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-icon-wrapper">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {actionText && onAction && (
        <Button 
          variant="primary" 
          onClick={onAction} 
          icon={actionIcon}
          style={{ marginTop: '8px' }}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
