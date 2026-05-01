import React, { useEffect, useState } from 'react';
import { User } from '../lib/types';
import { clearToken } from '../lib/auth';

export default function TopBar({ user, storeName }: { user: User; storeName?: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearToken();
    window.location.href = '/';
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'white',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0
    }} className="no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '16px', margin: 0 }}>{storeName || 'MarketPro Platform'}</h2>
        <span className={`badge ${user.role === 'superadmin' ? 'badge-danger' : 'badge-neutral'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
          {user.role}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
          {time}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-subdued)' }}>@{user.username}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
