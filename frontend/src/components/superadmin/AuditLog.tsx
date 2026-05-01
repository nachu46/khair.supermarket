import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Toast from '../Toast';
import LoadingSkeleton from '../LoadingSkeleton';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    api.get('/api/audit-logs').then(data => {
      setLogs(data || []);
      setLoading(false);
    }).catch(e => {
      setToast({ msg: e.message, type: 'error' });
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div style={{ marginBottom: 24 }}>
        <h2 className="page-title">Global Audit Log</h2>
        <p className="page-subtitle">Track system-wide activity</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Timestamp</th><th>User</th><th>Company</th><th>Action</th><th>Details</th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.users?.name || 'System'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{log.companies?.name || 'Platform'}</td>
                  <td><span className="badge badge-neutral">{log.action}</span></td>
                  <td style={{ fontSize: 13 }}>{log.details}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>No logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
