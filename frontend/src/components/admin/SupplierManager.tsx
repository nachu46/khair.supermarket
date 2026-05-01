import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ name: '', phone: '', email: '', address: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await api.get('/api/suppliers');
      setSuppliers(data || []);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openEdit = (s: any) => { setForm(s); setEditId(s.id); setShowModal(true); };
  const openNew = () => { setForm({ name: '', phone: '', email: '', address: '' }); setEditId(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/api/suppliers/${editId}`, form);
      else await api.post('/api/suppliers', form);
      setToast({ msg: editId ? 'Supplier updated' : 'Supplier added', type: 'success' });
      setShowModal(false);
      loadData();
    } catch (e: any) { setToast({ msg: e.message, type: 'error' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.del(`/api/suppliers/${deleteId}`);
      setToast({ msg: 'Supplier deleted', type: 'success' });
      loadData();
    } catch (e: any) { setToast({ msg: e.message, type: 'error' }); }
    finally { setDeleteId(null); }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {deleteId && <ConfirmModal title="Delete Supplier" message="Are you sure?" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Suppliers</h2>
          <p className="page-subtitle">Manage wholesale vendors</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Supplier</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontSize: 13 }}>{s.phone}<br/><span style={{ color: 'var(--color-text-secondary)' }}>{s.email}</span></td>
                  <td>{s.address || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => openEdit(s)}>Edit</button>
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
            <div className="modal-header"><h3>{editId ? 'Edit Supplier' : 'Add Supplier'}</h3></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Company Name</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email (Optional)</label><input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Address (Optional)</label><input className="form-control" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
