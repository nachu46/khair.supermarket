import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function CompanyManager() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', gst_number: '', subscription_plan: '', admin_username: '', admin_password: '' });
  const [credentials, setCredentials] = useState<{username: string, password: string} | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [comps, pls] = await Promise.all([
        api.get('/api/companies'),
        api.get('/api/subscriptions/plans')
      ]);
      setCompanies(comps || []);
      setPlans(pls || []);
      if (pls && pls.length > 0 && !form.subscription_plan) {
        setForm(f => ({ ...f, subscription_plan: pls[0].id }));
      }
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/companies', form);
      setCredentials(res.admin_credentials);
      setToast({ msg: 'Company created successfully', type: 'success' });
      setShowModal(false);
      setForm({ name: '', address: '', phone: '', gst_number: '', subscription_plan: plans[0]?.id || '', admin_username: '', admin_password: '' });
      loadData();
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.del(`/api/companies/${deleteId}`);
      setToast({ msg: 'Company deleted', type: 'success' });
      loadData();
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {deleteId && <ConfirmModal title="Delete Company" message="Are you sure? This deletes ALL data for this company." danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Company Management</h2>
          <p className="page-subtitle">Create and manage client shops</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Company</button>
      </div>

      {credentials && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--color-success)', background: 'var(--color-primary-light)' }}>
          <div className="card-body">
            <h3 style={{ color: 'var(--color-success)', marginBottom: 8 }}>✅ Shop Created Successfully</h3>
            <p style={{ marginBottom: 16 }}>Please copy these credentials immediately. They will not be shown again.</p>
            <div style={{ background: 'white', padding: 12, borderRadius: 6, fontFamily: 'monospace', fontSize: 16 }}>
              <div><strong>Admin Username:</strong> {credentials.username}</div>
              <div style={{ marginTop: 8 }}><strong>Admin Password:</strong> {credentials.password}</div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setCredentials(null)}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>GST</th><th>Plan</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}<br/><span style={{fontWeight:400,fontSize:12,color:'var(--color-text-secondary)'}}>{c.phone}</span></td>
                  <td>{c.gst_number || '—'}</td>
                  <td>{c.subscription_plans?.name || '—'}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setDeleteId(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>No companies found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Company</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Shop Name</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">GST Number</label><input className="form-control" value={form.gst_number} onChange={e=>setForm({...form,gst_number:e.target.value})} /></div>
                
                <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: 6, marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Shop Admin Account</h4>
                  <div className="form-group"><label className="form-label">Admin Username</label><input className="form-control" placeholder="e.g. shop_admin" value={form.admin_username} onChange={e=>setForm({...form,admin_username:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>Admin Password <small style={{ fontWeight: 400 }}>Leave blank for auto-gen</small></label><input type="password" className="form-control" placeholder="••••••••" value={form.admin_password} onChange={e=>setForm({...form,admin_password:e.target.value})} /></div>
                </div>

                <div className="form-group"><label className="form-label">Subscription Plan</label>
                  <select className="form-control" value={form.subscription_plan} onChange={e=>setForm({...form,subscription_plan:e.target.value})}>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price_monthly}/mo</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Shop & Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
