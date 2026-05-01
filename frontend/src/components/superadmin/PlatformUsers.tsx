import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function PlatformUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const loadData = async () => {
    try {
      const data = await api.get('/api/users');
      setUsers(data || []);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await api.put(`/api/users/${id}`, { is_active: !current });
      setToast({ msg: 'User status updated', type: 'success' });
      loadData();
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    }
  };

  const resetPassword = async (id: string) => {
    const newPass = Math.random().toString(36).slice(-8);
    try {
      await api.put(`/api/users/${id}`, { password: newPass });
      alert(`Password reset successful!\n\nNew Password: ${newPass}\n\nPlease copy this now.`);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div style={{ marginBottom: 24 }}>
        <h2 className="page-title">Platform Users</h2>
        <p className="page-subtitle">Manage all users across all companies</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Role</th><th>Company ID</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{u.username}</td>
                  <td>
                    <span className={`badge ${u.role === 'superadmin' ? 'badge-danger' : u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-subdued)' }}>{u.company_id ? u.company_id.substring(0,8)+'...' : 'Platform'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => resetPassword(u.id)}>Reset Pass</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => toggleStatus(u.id, u.is_active)}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
