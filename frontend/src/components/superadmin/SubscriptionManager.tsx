import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function SubscriptionManager() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const loadData = async () => {
    try {
      const [comps, pls] = await Promise.all([
        api.get('/api/companies'),
        api.get('/api/subscriptions/plans')
      ]);
      setCompanies(comps || []);
      setPlans(pls || []);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdate = async (companyId: string, planId: string, status: string, expiry: string) => {
    try {
      await api.post('/api/subscriptions/update', { company_id: companyId, plan_id: planId, status, expiry_date: expiry });
      setToast({ msg: 'Subscription updated', type: 'success' });
      loadData();
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div style={{ marginBottom: 24 }}>
        <h2 className="page-title">Subscriptions</h2>
        <p className="page-subtitle">Manage billing and plans</p>
      </div>

      <div className="metric-grid" style={{ marginBottom: 32 }}>
        {plans.map(p => {
          const features = typeof p.features === 'string' ? JSON.parse(p.features) : p.features;
          return (
            <div key={p.id} className="metric-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)' }}>₹{p.price_monthly}<span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>/mo</span></div>
              <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <div>✓ Up to {p.max_users} users</div>
                <div>✓ Up to {p.max_products} products</div>
                {features.gst_invoice && <div>✓ GST Invoicing</div>}
                {features.reports && <div>✓ Advanced Reports</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Company</th><th>Plan</th><th>Status</th><th>Expiry Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <select className="form-control" style={{ padding: '4px 8px', width: 'auto' }} value={c.subscription_plan || ''} onChange={e => handleUpdate(c.id, e.target.value, c.subscription_status, c.subscription_expiry)}>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="form-control" style={{ padding: '4px 8px', width: 'auto' }} value={c.subscription_status || 'trial'} onChange={e => handleUpdate(c.id, c.subscription_plan, e.target.value, c.subscription_expiry)}>
                      <option value="trial">Trial</option><option value="active">Active</option><option value="expired">Expired</option>
                    </select>
                  </td>
                  <td>
                    <input type="date" className="form-control" style={{ padding: '4px 8px', width: 'auto' }} value={c.subscription_expiry || ''} onChange={e => handleUpdate(c.id, c.subscription_plan, c.subscription_status, e.target.value)} />
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => {
                      const d = new Date(); d.setMonth(d.getMonth() + 1);
                      handleUpdate(c.id, c.subscription_plan, 'active', d.toISOString().split('T')[0]);
                    }}>Mark Paid (+1 mo)</button>
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
