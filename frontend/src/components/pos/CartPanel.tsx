import React from 'react';
import { CartItem, Customer } from '../../lib/types';
import CustomerSelector from './CustomerSelector';

export default function CartPanel({
  cart, updateQty, remove, customer, setCustomer,
  discount, setDiscount, useLoyalty, setUseLoyalty,
  paymentMethod, setPaymentMethod, splitAmounts, setSplitAmounts, onCheckout, settings
}: {
  cart: CartItem[], updateQty: (id: string, d: number) => void, remove: (id: string) => void,
  customer: Customer | null, setCustomer: (c: Customer | null) => void,
  discount: number, setDiscount: (d: number) => void,
  useLoyalty: boolean, setUseLoyalty: (u: boolean) => void,
  paymentMethod: string, setPaymentMethod: (p: string) => void,
  splitAmounts: Record<string, number>, setSplitAmounts: (s: Record<string, number>) => void,
  onCheckout: () => void,
  settings: any

}) {

  // Tax Inclusive Calculation: MRP includes tax.
  const totalMRP = cart.reduce((sum, item) => sum + (item.price_mrp * item.qty), 0);
  const tax = cart.reduce((sum, item) => {
    const itemTotal = item.price_mrp * item.qty;
    const taxRate = item.tax_rate || 0; // if 0, no tax
    const withoutTax = itemTotal / (1 + (taxRate / 100));
    return sum + (itemTotal - withoutTax);
  }, 0);
  const subtotal = totalMRP - tax;

  const loyaltyValue = (useLoyalty && customer) ? Math.floor(customer.loyalty_points / 100) * 10 : 0;
  const total = Math.max(0, totalMRP - discount - loyaltyValue);

  const handlePaymentMethodSelect = (mId: string) => {
    setPaymentMethod(mId);
    if (mId.includes('+')) {
      const methods = mId.split('+');
      setSplitAmounts({ [methods[0]]: total, [methods[1]]: 0 });
    } else {
      setSplitAmounts({});
    }
  };

  const handleSplitChange = (method: string, val: number) => {
    const otherMethod = paymentMethod.split('+').find(m => m !== method)!;
    setSplitAmounts({
      [method]: val,
      [otherMethod]: Math.max(0, total - val)
    });
  };

  const splitSum = paymentMethod.includes('+') ? Object.values(splitAmounts).reduce((a, b) => a + b, 0) : total;
  const isValidSplit = !paymentMethod.includes('+') || Math.abs(splitSum - total) < 0.01;

  return (
    <div className="pos-cart">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <CustomerSelector selected={customer} onSelect={setCustomer} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-subdued)', marginTop: 40, fontSize: 13 }}>Cart is empty</div>
        ) : (
          cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-bg)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.name}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, display: 'flex', gap: 8 }}>
                   <span>MRP: ₹{item.price_mrp}</span>
                   {item.expiry_date && <span style={{ color: new Date(item.expiry_date) < new Date() ? 'var(--color-critical)' : 'inherit' }}>Exp: {new Date(item.expiry_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>₹{(item.price_mrp * item.qty).toFixed(2)}</div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg)', borderRadius: 4, overflow: 'hidden', marginTop: 4, border: '1px solid var(--color-border)' }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>-</button>
                  <span style={{ padding: '0 8px', fontSize: 12, fontWeight: 700 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  <button onClick={() => remove(item.id)} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-critical-bg)', color: 'var(--color-critical)', border: 'none', borderLeft: '1px solid var(--color-border)', cursor: 'pointer' }}>×</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: 16, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ padding: '8px 12px', background: 'var(--color-bg)', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Subtotal</div>
            <div style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--color-bg)', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Tax (GST)</div>
            <div style={{ fontWeight: 600 }}>₹{tax.toFixed(2)}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500 }}>Manual Discount</span>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg)', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>
             <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginRight: 4 }}>₹</span>
             <input type="number" style={{ width: 60, background: 'none', border: 'none', textAlign: 'right', fontWeight: 600, fontSize: 13 }} value={discount} onChange={e => setDiscount(Number(e.target.value)||0)} />
          </div>
        </div>

        {customer && customer.loyalty_points >= 100 && (
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 12, background: 'var(--color-warning-bg)', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', border: '1px dashed var(--color-warning)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" checked={useLoyalty} onChange={e => setUseLoyalty(e.target.checked)} style={{ marginRight: 8, width: 16, height: 16 }} />
              <span>Redeem Loyalty Points</span>
            </div>
            <span style={{ fontWeight: 700 }}>-₹{Math.floor(customer.loyalty_points / 100) * 10}</span>
          </label>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px 0', borderTop: '2px solid var(--color-bg)' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Payable Amount</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>₹{total.toFixed(2)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { id: 'cash', label: 'Cash' },
            { id: 'card', label: 'Card' },
            { id: 'upi', label: 'UPI' },
            { id: 'cash+upi', label: 'Cash + UPI' },
            { id: 'cash+card', label: 'Cash + Card' },
            { id: 'upi+card', label: 'UPI + Card' }
          ].map(m => (
            <button key={m.id} className={`btn ${paymentMethod === m.id ? 'btn-primary' : 'btn-secondary'}`} style={{ height: 44, fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', justifyContent: 'center', padding: 4 }} onClick={() => handlePaymentMethodSelect(m.id)}>
               {m.label}
            </button>
          ))}
        </div>

        {paymentMethod.includes('+') && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Split Payment Details</div>
            {paymentMethod.split('+').map((method) => (
              <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                 <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{method} Amount</span>
                 <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>
                   <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginRight: 4 }}>₹</span>
                   <input type="number" style={{ width: 80, background: 'none', border: 'none', textAlign: 'right', fontWeight: 600, fontSize: 13 }} value={splitAmounts[method] || ''} onChange={e => handleSplitChange(method, Number(e.target.value)||0)} />
                 </div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', height: 56, fontSize: 18, fontWeight: 700, justifyContent: 'center', boxShadow: '0 4px 12px rgba(var(--color-primary-rgb), 0.3)' }} disabled={cart.length === 0 || !isValidSplit} onClick={onCheckout}>
          Complete Checkout (F4)
        </button>
      </div>
    </div>
  );
}
