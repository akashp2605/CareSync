import React from 'react';

const Loader = ({
  type = 'spinner', // 'spinner' | 'skeleton' | 'table' | 'dashboard' | 'profile'
  text = 'Loading data...',
  rows = 5
}) => {
  if (type === 'dashboard') {
    return (
      <div className="animate-fade-in" style={{ width: '100%' }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton skeleton-title" style={{ width: '220px', height: '28px', marginBottom: '8px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '380px', height: '14px' }}></div>
        </div>

        {/* 6 Stat Cards Grid */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="skeleton-stat-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div className="skeleton" style={{ width: '90px', height: '12px' }}></div>
                <div className="skeleton" style={{ width: '50px', height: '28px' }}></div>
              </div>
              <div className="skeleton skeleton-circle"></div>
            </div>
          ))}
        </div>

        {/* 2 Bottom Layout Cards */}
        <div className="dashboard-layout">
          <div className="skeleton-table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div className="skeleton" style={{ width: '160px', height: '20px' }}></div>
              <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '8px' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton" style={{ height: '44px', width: '100%', borderRadius: '8px' }}></div>
              ))}
            </div>
          </div>

          <div className="skeleton-table-card" style={{ padding: '24px' }}>
            <div className="skeleton" style={{ width: '120px', height: '20px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '24px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton" style={{ height: '42px', width: '100%', borderRadius: '8px' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="animate-fade-in" style={{ width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton skeleton-title" style={{ width: '200px', height: '28px', marginBottom: '8px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '320px', height: '14px' }}></div>
        </div>

        <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 2fr' }}>
          {/* Profile Card Skeleton */}
          <div className="skeleton-table-card" style={{ padding: '24px' }}>
            <div className="skeleton" style={{ width: '140px', height: '20px', marginBottom: '20px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '50%', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ width: '140px', height: '18px', marginBottom: '6px' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '12px' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '8px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '8px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '8px' }}></div>
            </div>
          </div>

          {/* List Card Skeleton */}
          <div className="skeleton-table-card" style={{ padding: '24px' }}>
            <div className="skeleton" style={{ width: '180px', height: '20px', marginBottom: '20px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="skeleton" style={{ height: '48px', width: '100%', borderRadius: '8px' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="card animate-fade-in" style={{ padding: 0 }}>
        {/* Top search & filter bar skeleton */}
        <div className="table-filter-bar">
          <div className="skeleton" style={{ height: '38px', width: '280px', borderRadius: '8px' }}></div>
          <div className="skeleton" style={{ height: '20px', width: '100px' }}></div>
        </div>

        {/* Table rows skeleton */}
        <div style={{ padding: '12px 24px' }}>
          <div style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ width: '60px', height: '14px' }}></div>
            <div className="skeleton" style={{ width: '160px', height: '14px' }}></div>
            <div className="skeleton" style={{ width: '120px', height: '14px' }}></div>
            <div className="skeleton" style={{ width: '140px', height: '14px' }}></div>
            <div className="skeleton" style={{ width: '80px', height: '14px', marginLeft: 'auto' }}></div>
          </div>
          {Array.from({ length: rows }).map((_, idx) => (
            <div 
              key={idx} 
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f8fafc' }}
            >
              <div className="skeleton" style={{ width: '50px', height: '16px' }}></div>
              <div className="skeleton" style={{ width: '150px', height: '16px' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
              <div className="skeleton" style={{ width: '130px', height: '16px' }}></div>
              <div className="skeleton" style={{ width: '70px', height: '28px', borderRadius: '6px', marginLeft: 'auto' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div style={{ width: '100%', padding: '16px' }}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
        <div className="skeleton skeleton-rect" style={{ marginTop: '20px' }}></div>
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
