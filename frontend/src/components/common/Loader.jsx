import React from 'react';

const Loader = ({
  type = 'spinner', // 'spinner' or 'skeleton' or 'table'
  text = 'Loading data...',
  rows = 5
}) => {
  if (type === 'skeleton') {
    return (
      <div style={{ width: '100%', padding: '10px' }}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
        <div className="skeleton skeleton-rect" style={{ marginTop: '20px' }}></div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ width: '100%', padding: '20px' }}>
        <div className="skeleton skeleton-title" style={{ width: '30%', height: '32px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {Array.from({ length: rows }).map((_, idx) => (
            <div 
              key={idx} 
              className="skeleton" 
              style={{ height: '48px', width: '100%', borderRadius: '8px' }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;
