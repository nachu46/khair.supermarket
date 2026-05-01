import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: '', barcode: '', category: 'General', price_mrp: 0, price_cost: 0, 
    stock: 0, low_stock_threshold: 5, supplier_id: '', tax_rate: 0, hsn_code: ''
  });
  const [editId, setEditId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [prods, sups] = await Promise.all([api.get('/api/products'), api.get('/api/suppliers')]);
      setProducts(prods || []);
      setSuppliers(sups || []);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openEdit = (p: any) => {
    setForm(p);
    setEditId(p.id);
    setShowModal(true);
  };

  const openNew = () => {
    setForm({ name: '', barcode: '', category: 'General', price_mrp: 0, price_cost: 0, stock: 0, low_stock_threshold: 5, supplier_id: '', tax_rate: 0, hsn_code: '' });
    setEditId(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, form);
        setToast({ msg: 'Product updated', type: 'success' });
      } else {
        await api.post('/api/products', form);
        setToast({ msg: 'Product added', type: 'success' });
      }
      setShowModal(false);
      loadData();
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.del(`/api/products/${deleteId}`);
      setToast({ msg: 'Product deleted', type: 'success' });
      loadData();
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  const profitMargin = form.price_mrp > 0 ? ((form.price_mrp - form.price_cost) / form.price_mrp * 100).toFixed(1) : 0;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {deleteId && <ConfirmModal title="Delete Product" message="Are you sure? This cannot be undone." danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">Manage your catalog and pricing</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Product</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Barcode</th><th>Name</th><th>Category</th><th>MRP</th><th>Margin</th><th>Stock</th><th>Expiry</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock <= p.low_stock_threshold;
                const isExpired = p.expiry_date && new Date(p.expiry_date) < new Date();
                const isExpiringSoon = p.expiry_date && new Date(p.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                
                let rowBg = 'transparent';
                if (isOutOfStock || isExpired) rowBg = 'rgba(255, 0, 0, 0.05)';
                else if (isLowStock || isExpiringSoon) rowBg = 'rgba(255, 165, 0, 0.05)';

                return (
                  <tr key={p.id} style={{ backgroundColor: rowBg }}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.barcode || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span className="badge badge-neutral">{p.category || 'General'}</span></td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{p.price_mrp}</td>
                    <td style={{ color: p.price_mrp > p.price_cost ? 'var(--color-success)' : 'var(--color-critical)' }}>
                      {p.price_mrp > 0 ? ((p.price_mrp - p.price_cost) / p.price_mrp * 100).toFixed(1) : 0}%
                    </td>
                    <td>
                      <span className={`badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      {p.expiry_date ? (
                        <span style={{ fontSize: 11, color: isExpired ? 'var(--color-critical)' : isExpiringSoon ? 'var(--color-warning)' : 'inherit', fontWeight: (isExpired || isExpiringSoon) ? 600 : 400 }}>
                          {new Date(p.expiry_date).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setDeleteId(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header"><h3>{editId ? 'Edit Product' : 'Add Product'}</h3></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Product Name</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                
                <div className="form-group"><label className="form-label">Barcode</label><input className="form-control" value={form.barcode} onChange={e=>setForm({...form,barcode:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Category</label><input className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} /></div>
                
                <div className="form-group"><label className="form-label">MRP (₹)</label><input type="number" step="0.01" className="form-control" required value={form.price_mrp} onChange={e=>setForm({...form,price_mrp:parseFloat(e.target.value)||0})} /></div>
                <div className="form-group">
                  <label className="form-label">Cost Price (₹)</label>
                  <input type="number" step="0.01" className="form-control" required value={form.price_cost} onChange={e=>setForm({...form,price_cost:parseFloat(e.target.value)||0})} />
                  <div style={{ fontSize: 11, marginTop: 4, color: Number(profitMargin) > 0 ? 'var(--color-success)' : 'var(--color-critical)' }}>Profit Margin: {profitMargin}%</div>
                </div>

                <div className="form-group"><label className="form-label">Stock Qty</label><input type="number" className="form-control" required value={form.stock} onChange={e=>setForm({...form,stock:parseInt(e.target.value)||0})} /></div>
                <div className="form-group"><label className="form-label">Low Stock Warning At</label><input type="number" className="form-control" required value={form.low_stock_threshold} onChange={e=>setForm({...form,low_stock_threshold:parseInt(e.target.value)||0})} /></div>

                <div className="form-group"><label className="form-label">Tax Rate (GST %)</label>
                  <select className="form-control" value={form.tax_rate} onChange={e=>setForm({...form,tax_rate:parseFloat(e.target.value)||0})}>
                    <option value="0">0% (Exempt)</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">HSN/SAC Code</label><input className="form-control" value={form.hsn_code} onChange={e=>setForm({...form,hsn_code:e.target.value})} /></div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Supplier (Optional)</label>
                  <select className="form-control" value={form.supplier_id || ''} onChange={e=>setForm({...form,supplier_id:e.target.value || null})}>
                    <option value="">-- No Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
