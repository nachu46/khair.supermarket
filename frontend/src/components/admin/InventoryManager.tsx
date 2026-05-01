import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function InventoryManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const loadData = async () => {
    try {
      const data = await api.get('/api/products');
      setProducts(data || []);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStock = async (id: string, newStock: number) => {
    try {
      await api.put(`/api/products/${id}`, { stock: newStock });
      setToast({ msg: 'Stock updated', type: 'success' });
      setProducts(prods => prods.map(p => p.id === id ? { ...p, stock: newStock } : p));
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div style={{ marginBottom: 24 }}>
        <h2 className="page-title">Inventory & Stock</h2>
        <p className="page-subtitle">Track and adjust stock levels directly</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Barcode</th><th>Product Name</th><th>Category</th><th>Supplier</th><th>Current Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.barcode || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{p.suppliers?.name || '—'}</td>
                  <td>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ width: 100, padding: '4px 8px' }} 
                      defaultValue={p.stock}
                      onBlur={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val !== p.stock) updateStock(p.id, val);
                      }}
                    />
                  </td>
                  <td>
                    <span className={`badge ${p.stock <= 0 ? 'badge-danger' : p.stock <= p.low_stock_threshold ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock <= 0 ? 'Out of Stock' : p.stock <= p.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                    </span>
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
