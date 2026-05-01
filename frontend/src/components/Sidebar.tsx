'use client';

import React from 'react';

// SVG Icons
const icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  pos: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  inventory: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  products: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  customers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  store: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
      <path d="M4 3h16l2 6H2L4 3zm0 8h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9zm4 4v2h8v-2H8z"/>
    </svg>
  ),
};

const allMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['superadmin', 'admin'], section: 'Main' },
  { id: 'pos', label: 'Point of Sale', icon: 'pos', roles: ['superadmin', 'admin', 'cashier'], section: 'Main' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory', roles: ['superadmin', 'admin'], section: 'Catalog' },
  { id: 'products', label: 'Products', icon: 'products', roles: ['superadmin', 'admin'], section: 'Catalog' },
  { id: 'customers', label: 'Customers', icon: 'customers', roles: ['superadmin', 'admin', 'cashier'], section: 'Catalog' },
  { id: 'users', label: 'Staff', icon: 'users', roles: ['superadmin', 'admin'], section: 'Admin' },
  { id: 'settings', label: 'Companies', icon: 'settings', roles: ['superadmin'], section: 'Admin' },
];

export default function Sidebar({ currentView, setView, userRole, onLogout, user }: {
  currentView: string;
  setView: (v: string) => void;
  userRole: string;
  onLogout: () => void;
  user?: any;
}) {
  const menu = allMenu.filter(item => item.roles.includes(userRole));
  const sections = [...new Set(menu.map(m => m.section))];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">{icons.store}</div>
        <span className="sidebar-logo-text">MarketPro</span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px' }}>
        {sections.map(section => (
          <div key={section} className="sidebar-section">
            <div className="sidebar-section-label">{section}</div>
            {menu.filter(m => m.section === section).map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
              >
                {icons[item.icon as keyof typeof icons]}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div style={{ padding: '8px 10px 6px', fontSize: 12, color: '#5c6370', fontWeight: 500 }}>
            {user.name || user.username}
            <div style={{ fontSize: 11, color: '#3d4047', textTransform: 'capitalize' }}>{user.role}</div>
          </div>
        )}
        <div className="sidebar-item" onClick={onLogout}>
          {icons.logout}
          <span>Log out</span>
        </div>
      </div>
    </aside>
  );
}
