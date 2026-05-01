import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import LoadingSkeleton from '../LoadingSkeleton';

export default function ReportsView() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  const loadData = async () => {
    setLoading(true);
    let from = new Date();
    from.setHours(0,0,0,0);
    
    if (dateRange === 'week') {
      from.setDate(from.getDate() - 7);
    } else if (dateRange === 'month') {
      from.setMonth(from.getMonth() - 1);
    } else if (dateRange === 'all') {
      from = new Date(0);
    }

    try {
      const [txns, st] = await Promise.all([
        api.get('/api/transactions'),
        api.get(`/api/reports?from=${from.toISOString()}`)
      ]);
      // Filter transactions locally for the table based on the same date logic, or just show the top 100 recent
      setTransactions(txns || []);
      setStats(st);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [dateRange]);

  const exportCSV = () => {
    if (!transactions.length) return alert('No data to export');
    const headers = ['Bill No', 'Date', 'Cashier', 'Customer', 'Subtotal', 'Tax', 'Discount', 'Total'];
    const rows = transactions.map(t => [
      t.bill_number,
      new Date(t.created_at).toLocaleString(),
      t.users?.name || 'Unknown',
      t.customers?.name || 'Walk-in',
      t.subtotal,
      t.tax,
      t.discount,
      t.total
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !stats) return <LoadingSkeleton />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-subtitle">Detailed store performance</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-control" style={{ width: 'auto' }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button className="btn btn-secondary" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Revenue</div>
          <div className="metric-value">₹{stats?.revenue?.toLocaleString() || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Bills</div>
          <div className="metric-value">{stats?.bills || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Items Sold</div>
          <div className="metric-value">{stats?.itemsSold || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Recent Transactions (Last 100)</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Bill No</th><th>Date</th><th>Cashier</th><th>Customer</th><th>Total (₹)</th></tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.bill_number}</td>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                  <td>{t.users?.name || '—'}</td>
                  <td>{t.customers?.name || 'Walk-in'}</td>
                  <td style={{ fontWeight: 600 }}>₹{t.total}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>No transactions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
