import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import LoadingSkeleton from '../LoadingSkeleton';

export default function SADashboard() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/companies').then(data => {
      setCompanies(data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <LoadingSkeleton />;

  const active = companies.filter(c => c.subscription_status === 'active').length;
  const trials = companies.filter(c => c.subscription_status === 'trial').length;
  const expired = companies.filter(c => c.subscription_status === 'expired').length;

  return (
    <div>
      <h2 className="page-title">Platform Overview</h2>
      <p className="page-subtitle">Super Admin metrics and active shops</p>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Total Shops</div>
          <div className="metric-value">{companies.length}</div>
          <div className="metric-sub">{active} active, {trials} on trial</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Subscriptions</div>
          <div className="metric-value">{active}</div>
          <div className="metric-sub">Across all plans</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Expired / Trialing</div>
          <div className="metric-value">{expired + trials}</div>
          <div className="metric-sub">Need follow-up</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">All Registered Companies</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <span className={`badge ${c.subscription_status === 'active' ? 'badge-success' : c.subscription_status === 'trial' ? 'badge-warning' : 'badge-danger'}`}>
                      {c.subscription_status}
                    </span>
                  </td>
                  <td>{c.subscription_plans?.name || 'N/A'}</td>
                  <td style={{ color: c.subscription_status === 'expired' ? 'var(--color-critical)' : 'inherit' }}>
                    {c.subscription_expiry ? new Date(c.subscription_expiry).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
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
