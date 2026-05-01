import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function StaffManager() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ name: '', username: '', password: '', role: 'cashier' });

  const loadData = async () => {
    try {
      const data = await api.get('/api/users');
      setStaff(data || []);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openNew = () => { setForm({ name: '', username: '', password: '', role: 'cashier' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users', form);
      setToast({ msg: 'Staff member added', type: 'success' });
      setShowModal(false);
      loadData();
    } catch (e: any) { setToast({ msg: e.message, type: 'error' }); }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await api.put(`/api/users/${id}`, { is_active: !current });
      setToast({ msg: 'Status updated', type: 'success' });
      loadData();
    } catch (e: any) { setToast({ msg: e.message, type: 'error' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.del(`/api/users/${deleteId}`);
      setToast({ msg: 'Staff deleted', type: 'success' });
      loadData();
    } catch (e: any) { setToast({ msg: e.message, type: 'error' }); }
    finally { setDeleteId(null); }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {deleteId && <ConfirmModal title="Delete Staff" message="Are you sure?" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Staff Management</h2>
          <p className="page-subtitle">Manage cashiers and their access</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Staff</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.username}</td>
                  <td>
                    <span className={`badge ${s.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => toggleStatus(s.id, s.is_active)}>
                        {s.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setDeleteId(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Add Staff Member</h3></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Username</label><input className="form-control" required value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-control" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Role</label>
                  <select className="form-control" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                    <option value="cashier">Cashier</option>
                    <option value="admin">Store Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
