import React, { useMemo } from 'react';
import { Product } from '../../lib/types';

export default function ProductGrid({ products, category, onAdd }: { products: Product[], category: string, onAdd: (p: Product) => void }) {
  const filtered = useMemo(() => {
    if (category === 'All') return products;
    return products.filter(p => p.category === category);
  }, [products, category]);

  return (
    <div className="product-grid">
      {filtered.map(p => {
        const outOfStock = p.stock <= 0;
        return (
          <div 
            key={p.id} 
            className={`pos-card ${outOfStock ? 'disabled' : ''}`}
            onClick={() => { if (!outOfStock) onAdd(p); }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 12px' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>
              {p.name.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.2, color: 'var(--color-text)' }}>{p.name}</div>
            <div style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8 }}>₹{p.price_mrp}</div>
            <div style={{ display: 'inline-block', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: outOfStock ? 'var(--color-critical-bg)' : 'var(--color-surface)', color: outOfStock ? 'var(--color-critical)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
              {outOfStock ? 'OUT OF STOCK' : `${p.stock} IN STOCK`}
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--color-text-secondary)' }}>
          No products found in this category.
        </div>
      )}
    </div>
  );
}
