import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Toast from '../Toast';
import { getUser } from '../../lib/auth';

const TABS = [
  { key: 'shop', label: '🏪 Shop Info' },
  { key: 'contact', label: '📞 Contact' },
  { key: 'tax', label: '💰 Tax & GST' },
  { key: 'invoice', label: '🧾 Invoice' },
  { key: 'payment', label: '📲 UPI & Payment' },
  { key: 'roles', label: '🔐 Role Access' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['Full access', 'Manage staff', 'All reports', 'Settings', 'POS', 'Inventory'],
  cashier: ['POS billing only', 'View products', 'Add customers'],
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
    {hint && <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>{hint}</p>}
  </div>
);

export default function SettingsView() {
  const [settings, setSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('shop');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const user = getUser();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get('/api/settings');
      setSettings(data);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    }
  };

  const set = (key: string, value: any) => setSettings((prev: any) => ({ ...prev, [key]: value }));

  const handleCountryChange = (country: string) => {
    const defaults: Record<string, any> = {
      India: { currency: 'INR', currency_symbol: '₹', tax_system: 'GST', cgst_rate: 9, sgst_rate: 9, igst_rate: 18 },
      UAE:   { currency: 'AED', currency_symbol: 'AED ', tax_system: 'VAT', vat_rate: 5 },
      USA:   { currency: 'USD', currency_symbol: '$', tax_system: 'SalesTax', sales_tax_rate: 8 },
      UK:    { currency: 'GBP', currency_symbol: '£', tax_system: 'VAT', vat_rate: 20 },
    };
    setSettings((prev: any) => ({ ...prev, country, ...(defaults[country] || {}) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings', settings);
      setSaved(true);
      setToast({ msg: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally { setSaving(false); }
  };

  if (!settings) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      Loading settings...
    </div>
  );

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Store Settings</h2>
          <p className="page-subtitle">Configure shop info, tax, invoices and payments</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ minWidth: 120, background: saved ? 'var(--color-success)' : '' }}
        >
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', borderBottom: '2px solid var(--color-border)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 16px', fontSize: 13, fontWeight: 500, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: activeTab === t.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── SHOP INFO ─── */}
      {activeTab === 'shop' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header">🏪 Shop Information</div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Shop Name *">
              <input className="form-control" required value={settings.shop_name || ''} onChange={e => set('shop_name', e.target.value)} placeholder="e.g. Khair Supermarket" />
            </Field>
            <Field label="Owner Name">
              <input className="form-control" value={settings.owner_name || ''} onChange={e => set('owner_name', e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Country" hint="Changing country auto-sets currency and tax system">
              <select className="form-control" value={settings.country || 'India'} onChange={e => handleCountryChange(e.target.value)}>
                <option value="India">🇮🇳 India (GST)</option>
                <option value="UAE">🇦🇪 UAE (VAT 5%)</option>
                <option value="USA">🇺🇸 USA (Sales Tax)</option>
                <option value="UK">🇬🇧 UK (VAT 20%)</option>
              </select>
            </Field>
            <Field label="Currency Symbol">
              <input className="form-control" value={settings.currency_symbol || '₹'} onChange={e => set('currency_symbol', e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {/* ─── CONTACT ─── */}
      {activeTab === 'contact' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header">📞 Contact Details</div>
          <div className="card-body">
            <Field label="Phone Number">
              <input className="form-control" value={settings.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="WhatsApp Number" hint="Used for sharing bills via WhatsApp">
              <input className="form-control" value={settings.whatsapp_number || ''} onChange={e => set('whatsapp_number', e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email">
              <input className="form-control" type="email" value={settings.email || ''} onChange={e => set('email', e.target.value)} placeholder="shop@example.com" />
            </Field>
            <Field label="Full Address">
              <textarea
                className="form-control"
                rows={3}
                value={settings.address || ''}
                onChange={e => set('address', e.target.value)}
                placeholder="123 Market Street, City, State - PIN"
                style={{ resize: 'vertical' }}
              />
            </Field>
          </div>
        </div>
      )}

      {/* ─── TAX & GST ─── */}
      {activeTab === 'tax' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header">💰 Tax & GST Settings</div>
          <div className="card-body">
            <Field label="Tax System">
              <select className="form-control" value={settings.tax_system || 'GST'} onChange={e => set('tax_system', e.target.value)}>
                <option value="GST">GST (India)</option>
                <option value="VAT">VAT (UAE / UK)</option>
                <option value="SalesTax">Sales Tax (USA)</option>
                <option value="None">No Tax</option>
              </select>
            </Field>

            {settings.tax_system === 'GST' && (
              <div style={{ background: 'rgba(255,165,0,0.07)', padding: 16, borderRadius: 8, marginTop: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', marginBottom: 12 }}>GST Details</p>
                <Field label="GSTIN Number">
                  <input className="form-control" value={settings.gstin || ''} onChange={e => set('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <Field label="CGST %"><input type="number" min="0" className="form-control" value={settings.cgst_rate ?? 9} onChange={e => set('cgst_rate', parseFloat(e.target.value))} /></Field>
                  <Field label="SGST %"><input type="number" min="0" className="form-control" value={settings.sgst_rate ?? 9} onChange={e => set('sgst_rate', parseFloat(e.target.value))} /></Field>
                  <Field label="IGST %"><input type="number" min="0" className="form-control" value={settings.igst_rate ?? 18} onChange={e => set('igst_rate', parseFloat(e.target.value))} /></Field>
                </div>
              </div>
            )}

            {settings.tax_system === 'VAT' && (
              <div style={{ background: 'rgba(59,130,246,0.07)', padding: 16, borderRadius: 8, marginTop: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 12 }}>VAT Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="VAT Rate %"><input type="number" min="0" className="form-control" value={settings.vat_rate ?? 5} onChange={e => set('vat_rate', parseFloat(e.target.value))} /></Field>
                  <Field label="TRN Number"><input className="form-control" value={settings.trn_number || ''} onChange={e => set('trn_number', e.target.value)} placeholder="Tax Registration No." /></Field>
                </div>
              </div>
            )}

            {settings.tax_system === 'SalesTax' && (
              <div style={{ background: 'rgba(16,185,129,0.07)', padding: 16, borderRadius: 8, marginTop: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', marginBottom: 12 }}>Sales Tax</p>
                <Field label="Tax Rate %"><input type="number" min="0" className="form-control" value={settings.sales_tax_rate ?? 0} onChange={e => set('sales_tax_rate', parseFloat(e.target.value))} /></Field>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── INVOICE ─── */}
      {activeTab === 'invoice' && (
        <div style={{ maxWidth: 640 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">🧾 Invoice Settings</div>
            <div className="card-body">
              <Field label="Invoice Number Prefix" hint={`Bills will look like: ${settings.invoice_prefix || 'INV'}-00A1B2C3`}>
                <input className="form-control" value={settings.invoice_prefix || 'INV'} onChange={e => set('invoice_prefix', e.target.value)} />
              </Field>
              <Field label="Footer Message" hint="Appears at the bottom of every printed bill">
                <input className="form-control" value={settings.invoice_footer || ''} onChange={e => set('invoice_footer', e.target.value)} placeholder="Thank you for shopping with us!" />
              </Field>
              <Field label="Print Format">
                <select className="form-control" value={settings.print_format || 'thermal'} onChange={e => set('print_format', e.target.value)}>
                  <option value="thermal">Thermal (80mm) — POS Receipt</option>
                  <option value="a4">A4 Size — Full Invoice</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Live Preview */}
          <div className="card">
            <div className="card-header">Live Preview</div>
            <div className="card-body">
              <div style={{ background: '#1e293b', color: 'white', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800 }}>{settings.shop_name || 'Your Shop Name'}</p>
                  {settings.address && <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{settings.address}</p>}
                  {settings.phone && <p style={{ fontSize: 11, opacity: 0.6 }}>📞 {settings.phone}</p>}
                  {settings.gstin && <p style={{ fontSize: 11, opacity: 0.6 }}>GSTIN: {settings.gstin}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 16, fontWeight: 700 }}>INVOICE</p>
                  <p style={{ fontSize: 11, opacity: 0.6 }}>{settings.invoice_prefix || 'INV'}-XXXXXXXX</p>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 12, fontStyle: 'italic' }}>
                {settings.invoice_footer || 'Thank you for shopping with us!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── PAYMENT / UPI ─── */}
      {activeTab === 'payment' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header">📲 UPI & Payment Settings</div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 8, marginBottom: 16 }}>
              <input
                type="checkbox"
                id="enable_upi_qr"
                checked={settings.enable_upi_qr || false}
                onChange={e => set('enable_upi_qr', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="enable_upi_qr" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Enable Dynamic UPI QR Code on Invoices
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="UPI ID (VPA)">
                <input
                  className="form-control"
                  value={settings.upi_id || ''}
                  onChange={e => set('upi_id', e.target.value)}
                  placeholder="yourname@paytm / @upi"
                  disabled={!settings.enable_upi_qr}
                  style={{ opacity: settings.enable_upi_qr ? 1 : 0.5 }}
                />
              </Field>
              <Field label="Payee Name">
                <input
                  className="form-control"
                  value={settings.upi_name || ''}
                  onChange={e => set('upi_name', e.target.value)}
                  placeholder="Your Shop Name"
                  disabled={!settings.enable_upi_qr}
                  style={{ opacity: settings.enable_upi_qr ? 1 : 0.5 }}
                />
              </Field>
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 8 }}>
              When enabled, a scannable QR code will appear on the bill for the exact amount due. Works best with UPI payment method selected at checkout.
            </p>
          </div>
        </div>
      )}

      {/* ─── ROLE ACCESS ─── */}
      {activeTab === 'roles' && (
        <div style={{ maxWidth: 640 }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Role-based access is enforced server-side. Below is a summary of what each role can do in your store.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
              <div key={role} className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${role === 'admin' ? 'badge-warning' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>{role}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Role</span>
                </div>
                <div className="card-body" style={{ padding: '12px 16px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {perms.map(p => (
                      <li key={p} style={{ fontSize: 13, padding: '4px 0', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: 16, border: '1px solid var(--color-primary)' }}>
            <div className="card-header">How to Change Roles</div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Go to <strong>Staff Management</strong> → click <strong>Activate/Deactivate</strong> to enable or disable a user, or use the <strong>Platform Users</strong> panel (Super Admin) to change roles across companies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ minWidth: 140, background: saved ? 'var(--color-success)' : '' }}
        >
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
