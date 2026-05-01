import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Customer } from '../../lib/types';

export default function CustomerSelector({ selected, onSelect }: { selected: Customer | null, onSelect: (c: Customer | null) => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.get('/api/customers').then(data => setCustomers(data || [])).catch(console.error);
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      {selected ? (
        <div style={{ padding: 12, background: 'var(--color-surface)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{selected.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Loyalty Points: {selected.loyalty_points}</div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => onSelect(null)}>Clear</button>
        </div>
      ) : (
        <div>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search customer by name or phone..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
          />
          {isOpen && search && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--color-border)', borderRadius: 6, zIndex: 10, maxHeight: 200, overflowY: 'auto', boxShadow: 'var(--shadow-card)' }}>
              {filtered.map(c => (
                <div 
                  key={c.id} 
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}
                  onClick={() => { onSelect(c); setIsOpen(false); setSearch(''); }}
                >
                  <div style={{ fontWeight: 500 }}>{c.name} ({c.phone})</div>
                  <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>★ {c.loyalty_points} pts</div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>No customers found</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
