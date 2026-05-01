import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ width: '200px', height: '28px', background: 'var(--color-border)', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }}></div>
      <div style={{ width: '300px', height: '16px', background: 'var(--color-border)', borderRadius: '4px', marginBottom: '32px', animation: 'pulse 1.5s infinite' }}></div>
      
      <div className="metric-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="metric-card" style={{ height: '120px', background: 'var(--color-border)', animation: 'pulse 1.5s infinite' }}></div>
        ))}
      </div>
      
      <div className="card" style={{ height: '400px', background: 'var(--color-border)', animation: 'pulse 1.5s infinite' }}></div>

      <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }`}</style>
    </div>
  );
}
