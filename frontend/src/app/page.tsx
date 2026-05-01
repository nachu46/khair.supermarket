'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getUser, saveToken, saveUser } from '../lib/auth';
import { User } from '../lib/types';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

// Import Views
import SADashboard from '../components/superadmin/SADashboard';
import CompanyManager from '../components/superadmin/CompanyManager';
import SubscriptionManager from '../components/superadmin/SubscriptionManager';
import PlatformUsers from '../components/superadmin/PlatformUsers';
import AuditLog from '../components/superadmin/AuditLog';

import AdminDashboard from '../components/admin/AdminDashboard';
import ProductManager from '../components/admin/ProductManager';
import InventoryManager from '../components/admin/InventoryManager';
import CustomerManager from '../components/admin/CustomerManager';
import SupplierManager from '../components/admin/SupplierManager';
import StaffManager from '../components/admin/StaffManager';
import ReportsView from '../components/admin/ReportsView';
import SettingsView from '../components/admin/SettingsView';

import POSView from '../components/pos/POSView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('sa_dashboard'); // Default
  const [authError, setAuthError] = useState('');

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUser(u);
      // Set initial view based on role
      if (u.role === 'superadmin') setView('sa_dashboard');
      else if (u.role === 'admin') setView('admin_dashboard');
      else setView('pos');
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await api.post('/api/auth/login', { username, password });
      saveToken(res.token);
      saveUser(res.user);
      setUser(res.user);
      if (res.user.role === 'superadmin') setView('sa_dashboard');
      else if (res.user.role === 'admin') setView('admin_dashboard');
      else setView('pos');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="card" style={{ width: 400, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, background: 'var(--color-primary)', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 3h16l2 6H2L4 3zm0 8h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9zm4 4v2h8v-2H8z"/></svg>
            </div>
            <h1 style={{ fontSize: 24, margin: '0 0 8px 0' }}>MarketPro Login</h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Sign in to your account</p>
          </div>

          {authError && <div style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)', padding: '12px', borderRadius: 6, marginBottom: 16, fontSize: 13, border: '1px solid #ffdbd8' }}>{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-control" autoFocus value={username} onChange={e=>setUsername(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 24, position: 'relative' }}>
              <label className="form-label">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                style={{ paddingRight: 40 }}
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 36,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px 16px', fontSize: 16, justifyContent: 'center' }}>Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'sa_dashboard': return <SADashboard />;
      case 'sa_companies': return <CompanyManager />;
      case 'sa_subscriptions': return <SubscriptionManager />;
      case 'sa_users': return <PlatformUsers />;
      case 'sa_audit': return <AuditLog />;
      
      case 'admin_dashboard': return <AdminDashboard />;
      case 'admin_products': return <ProductManager />;
      case 'admin_inventory': return <InventoryManager />;
      case 'admin_customers': return <CustomerManager />;
      case 'admin_suppliers': return <SupplierManager />;
      case 'admin_staff': return <StaffManager />;
      case 'admin_reports': return <ReportsView />;
      case 'admin_settings': return <SettingsView />;
      
      case 'pos':
      case 'admin_pos': return <POSView />;
      
      default: return <div>404: View Not Found</div>;
    }
  };

  return (
    <div className="layout">
      <Sidebar user={user} currentView={view} setView={setView} />
      <div className="main-content">
        <TopBar user={user} storeName={user.role === 'superadmin' ? 'MarketPro HQ' : 'Store Admin'} />
        {view === 'pos' || view === 'admin_pos' ? (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {renderView()}
          </div>
        ) : (
          <div className="page-content">
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {renderView()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
