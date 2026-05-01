import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import LoadingSkeleton from '../LoadingSkeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    Promise.all([
      api.get(`/api/reports?from=${today.toISOString()}`),
      api.get('/api/products/alerts')
    ]).then(([statsData, alertsData]) => {
      setStats(statsData);
      setAlerts(alertsData);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <h2 className="page-title">Store Dashboard</h2>
      <p className="page-subtitle">Today's metrics and recent activity</p>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Today's Revenue</div>
          <div className="metric-value">₹{stats?.revenue?.toLocaleString() || 0}</div>
          <div className="metric-sub">From {stats?.bills || 0} bills</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Items Sold</div>
          <div className="metric-value">{stats?.itemsSold || 0}</div>
          <div className="metric-sub">Units moved today</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Average Bill Value</div>
          <div className="metric-value">₹{Math.round(stats?.avgBill || 0).toLocaleString()}</div>
          <div className="metric-sub">Per transaction</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div className="card">
          <div className="card-header">Top Selling Products Today</div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {stats?.topProducts?.map((p: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{p.qty}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{(p.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {(!stats?.topProducts || stats.topProducts.length === 0) && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>No sales today yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Quick Actions</div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.hash = 'admin_pos'}>Open Point of Sale</button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.hash = 'admin_products'}>Add New Product</button>
          </div>
        </div>

        {alerts && (alerts.lowStock.length > 0 || alerts.expiring.length > 0) && (
          <div className="card" style={{ border: '1px solid var(--color-critical)' }}>
            <div className="card-header" style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}>Inventory Alerts</div>
            <div className="card-body" style={{ padding: '12px 0' }}>
              {alerts.lowStock.map((p: any) => (
                <div key={p.id} style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-bg)' }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                  <span className="badge badge-critical" style={{ fontSize: 10 }}>Low Stock: {p.stock}</span>
                </div>
              ))}
              {alerts.expiring.map((p: any) => (
                <div key={p.id} style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-bg)' }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                  <span className="badge badge-warning" style={{ fontSize: 10 }}>Expiring: {new Date(p.expiry_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
