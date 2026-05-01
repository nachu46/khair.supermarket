import React from 'react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Delete', danger = true }: { 
  title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmText?: string; danger?: boolean;
}) {
  return (
    <div className="modal-overlay no-print">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '16px' }}>{title}</h3>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
