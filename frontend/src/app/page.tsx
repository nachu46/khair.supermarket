'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase';

export default function Home() {
  const [view, setView] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem('sm_session');
    if (s) setUser(JSON.parse(s));
    setLoading(false);
  }, []);

  const handleLogin = (u: any) => { setUser(u); localStorage.setItem('sm_session', JSON.stringify(u)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('sm_session'); };

  if (loading) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',color:'#6d7175'}}>Loading...</div>;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="layout">
      <Sidebar currentView={view} setView={setView} userRole={user.role} onLogout={handleLogout} user={user} />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">{view === 'settings' ? 'Companies' : view === 'pos' ? 'Point of Sale' : view.charAt(0).toUpperCase() + view.slice(1)}</span>
            <span className="badge badge-role">{user.role}</span>
          </div>
          <div className="topbar-right">
            <span style={{fontSize:13,color:'#6d7175'}}>{user.companies?.name || 'Global'}</span>
          </div>
        </header>
        <div className="page-content">
          <div className="animate-fade" key={view}>
            {view === 'dashboard' && <DashboardView user={user} />}
            {view === 'pos' && <POSView user={user} />}
            {view === 'users' && <UserManagementView user={user} />}
            {view === 'settings' && user.role === 'superadmin' && <CompanyManagementView />}
            {!['dashboard','pos','users','settings'].includes(view) && (
              <div className="card"><div className="card-body" style={{textAlign:'center',padding:'60px 20px',color:'#8c9196'}}>
                <div style={{fontSize:32,marginBottom:12}}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'#c9cccf'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>{view.charAt(0).toUpperCase()+view.slice(1)}</div>
                <div style={{fontSize:13}}>This section is coming soon.</div>
              </div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login ──────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (u: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data: user, error: dbError } = await supabase
        .from('users').select('*, companies(*)').eq('username', username).eq('password', password).maybeSingle();
      if (dbError) throw new Error('Database error: ' + dbError.message);
      if (!user) throw new Error('Invalid username or password.');
      onLogin(user);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M4 3h16l2 6H2L4 3zm0 8h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9z"/></svg>
          </div>
          <span style={{fontSize:18,fontWeight:700,letterSpacing:'-.3px'}}>MarketPro</span>
        </div>
        <h1 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Sign in to your store</h1>
        <p style={{fontSize:13,color:'#6d7175',marginBottom:24}}>Enter your credentials to continue</p>
        {error && <div className="alert alert-critical">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter your username" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{marginTop:8}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────
function DashboardView({ user }: { user: any }) {
  const [stats, setStats] = useState({ transactions: 0, revenue: 0, products: 0, lowStock: 0 });
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: txns }, { data: prods }] = await Promise.all([
        supabase.from('transactions').select('total').eq('company_id', user.company_id).gte('created_at', today),
        supabase.from('products').select('stock').eq('company_id', user.company_id),
      ]);
      const revenue = txns?.reduce((s: number, t: any) => s + (t.total || 0), 0) || 0;
      const lowStock = prods?.filter((p: any) => p.stock < 10).length || 0;
      setStats({ transactions: txns?.length || 0, revenue, products: prods?.length || 0, lowStock });
    };
    if (user.company_id) load();
  }, [user.company_id]);

  const c = user.companies;
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Overview</div><div className="page-subtitle">Welcome back, {user.name || user.username}</div></div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-value">₹{stats.revenue.toLocaleString()}</div>
          <div className="stat-sub">{stats.transactions} transactions today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.products}</div>
          <div className="stat-sub">{stats.lowStock > 0 ? <span style={{color:'#d72c0d'}}>{stats.lowStock} low stock</span> : 'Stock levels normal'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Store Status</div>
          <div className="stat-value" style={{fontSize:18,marginTop:4}}>
            <span className={`badge ${c?.status === 'active' ? 'badge-success' : 'badge-critical'}`} style={{fontSize:13,padding:'5px 12px'}}>
              {c?.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div className="stat-sub">Expires {c?.expiry_date || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}

// ─── POS ────────────────────────────────────────────────────────
function POSView({ user }: { user: any }) {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [checking, setChecking] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('products').select('*').eq('company_id', user.company_id).order('name')
      .then(({ data }) => { if (data) setProducts(data); });
  }, [user.company_id]);

  const addToCart = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCheckout = async () => {
    if (!cart.length) return;
    setChecking(true);
    try {
      const { error } = await supabase.from('transactions').insert({ company_id: user.company_id, total, items: cart, cashier: user.username });
      if (error) throw error;
      for (const item of cart) {
        const { data: p } = await supabase.from('products').select('stock').eq('id', item.id).single();
        if (p) await supabase.from('products').update({ stock: p.stock - item.qty }).eq('id', item.id);
      }
      alert('Transaction complete! ₹' + total.toLocaleString());
      setCart([]);
    } catch { alert('Checkout failed. Try again.'); }
    finally { setChecking(false); }
  };

  return (
    <div className="pos-grid">
      {/* Products */}
      <div style={{display:'flex',flexDirection:'column',gap:12,overflow:'hidden'}}>
        <input className="form-control" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." />
        <div style={{overflowY:'auto',flex:1}}>
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state-title">No products found</div><div className="empty-state-text">Add products from the Products section.</div></div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => (
                <div key={p.id} className="product-card" onClick={() => addToCart(p)}>
                  <div className="product-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8c9196" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">₹{p.price}</div>
                  <div className="product-stock">Stock: {p.stock ?? '–'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="cart-panel">
        <div className="cart-header">Current Order {cart.length > 0 && <span className="badge badge-info" style={{float:'right'}}>{cart.length} items</span>}</div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-state" style={{padding:'32px 20px'}}>
              <div className="empty-state-text">Add products to start an order</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="cart-item">
              <div>
                <div className="cart-item-name">{item.name}</div>
                <div style={{fontSize:12,color:'#6d7175'}}>₹{item.price} each</div>
              </div>
              <div className="cart-item-qty">
                <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                <span style={{minWidth:20,textAlign:'center',fontWeight:600}}>{item.qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
              </div>
              <div className="cart-item-price">₹{(item.price * item.qty).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="cart-total-row">
            <span className="cart-total-label">Total</span>
            <span className="cart-total-value">₹{total.toLocaleString()}</span>
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout} disabled={!cart.length || checking}>
            {checking ? 'Processing...' : 'Charge ₹' + total.toLocaleString()}
          </button>
          {cart.length > 0 && <button className="btn btn-secondary btn-full" style={{marginTop:8}} onClick={() => setCart([])}>Clear order</button>}
        </div>
      </div>
    </div>
  );
}

// ─── Company Management ─────────────────────────────────────────
function CompanyManagementView() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', status: 'active', expiry_date: '' });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (data) setCompanies(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('companies').insert(form);
    setSaving(false);
    if (error) { alert('Failed: ' + error.message); return; }
    setShowModal(false); setForm({ name: '', status: 'active', expiry_date: '' }); load();
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Companies</div><div className="page-subtitle">Manage store subscriptions</div></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add company</button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Company name</th><th>Status</th><th>Expiry date</th></tr></thead>
          <tbody>
            {companies.length === 0 ? (
              <tr><td colSpan={3}><div className="empty-state"><div className="empty-state-title">No companies yet</div></div></td></tr>
            ) : companies.map(c => (
              <tr key={c.id}>
                <td style={{fontWeight:500}}>{c.name}</td>
                <td><span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-critical'}`}>{c.status}</span></td>
                <td style={{color:'#6d7175'}}>{c.expiry_date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add company</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Company name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="e.g. Fresh Mart" /></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Expiry date</label><input className="form-control" type="date" value={form.expiry_date} onChange={e=>setForm({...form,expiry_date:e.target.value})} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add company'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User Management ────────────────────────────────────────────
function UserManagementView({ user }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'cashier', company_id: user.company_id });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from('users').select('*').eq('company_id', user.company_id);
    if (data) setUsers(data);
  }, [user.company_id]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('users').insert(form);
    setSaving(false);
    if (error) { alert('Failed: ' + error.message); return; }
    setShowModal(false); setForm({ username: '', password: '', name: '', role: 'cashier', company_id: user.company_id }); load();
  };

  const roleColor: any = { superadmin: 'badge-critical', admin: 'badge-warning', cashier: 'badge-info' };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Staff</div><div className="page-subtitle">Manage your team members</div></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add staff</button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Username</th><th>Role</th></tr></thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={3}><div className="empty-state"><div className="empty-state-title">No staff members yet</div></div></td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td style={{fontWeight:500}}>{u.name || '—'}</td>
                <td style={{color:'#6d7175',fontFamily:'monospace'}}>{u.username}</td>
                <td><span className={`badge ${roleColor[u.role] || 'badge-info'}`}>{u.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add staff member</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Full name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="e.g. Rahul Sharma" /></div>
                <div className="form-group"><label className="form-label">Username</label><input className="form-control" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required placeholder="e.g. rahul123" /></div>
                <div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required placeholder="Set a password" /></div>
                <div className="form-group"><label className="form-label">Role</label>
                  <select className="form-control" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                    <option value="cashier">Cashier</option><option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
