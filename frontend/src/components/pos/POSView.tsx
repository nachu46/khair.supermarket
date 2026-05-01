import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Product, CartItem, Customer } from '../../lib/types';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import InvoiceModal from './InvoiceModal';
import LoadingSkeleton from '../LoadingSkeleton';
import Toast from '../Toast';

export default function POSView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [completedTxn, setCompletedTxn] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({});


  const searchRef = React.useRef<HTMLInputElement>(null);
  const stateRef = React.useRef({ cart, customer, discount, useLoyalty, paymentMethod, splitAmounts });

  useEffect(() => {
    stateRef.current = { cart, customer, discount, useLoyalty, paymentMethod, splitAmounts };
  }, [cart, customer, discount, useLoyalty, paymentMethod, splitAmounts]);



  useEffect(() => {
    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); /* Logic to open customer selector could go here if it were a modal */ }
      if (e.key === 'F4') { e.preventDefault(); handleCheckout(); }
      if (e.key === 'F10') { e.preventDefault(); holdBill(); }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Initial Load
    const saved = localStorage.getItem('pos_hold_cart');
    if (saved) setCart(JSON.parse(saved));

    // Try to load from cache first
    const cachedProducts = localStorage.getItem('pos_products_cache');
    if (cachedProducts) {
      const parsed = JSON.parse(cachedProducts);
      setProducts(parsed);
      setCategories(['All', ...Array.from(new Set(parsed.map((p: any) => p.category || 'General'))) as string[]]);
      setLoading(false);
    }
    const cachedSettings = localStorage.getItem('pos_settings_cache');
    if (cachedSettings) setSettings(JSON.parse(cachedSettings));

    api.get('/api/settings').then(data => {
      setSettings(data || {});
      localStorage.setItem('pos_settings_cache', JSON.stringify(data || {}));
    }).catch(console.error);


    api.get('/api/products').then(data => {
      setProducts(data || []);
      localStorage.setItem('pos_products_cache', JSON.stringify(data));
      const cats = Array.from(new Set((data || []).map((p: Product) => p.category || 'General')));
      setCategories(['All', ...cats as string[]]);
      setLoading(false);
    }).catch(e => {
      if (!cachedProducts) {
        setToast({ msg: 'Offline: ' + e.message, type: 'error' });
      }
      setLoading(false);
    });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          setToast({ msg: 'Not enough stock!', type: 'error' });
          return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find(p => p.barcode === searchQuery || p.name.toLowerCase() === searchQuery.toLowerCase());
    if (found) {
      addToCart(found);
    } else {
      setToast({ msg: 'Product not found', type: 'error' });
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        if (newQty > i.stock) {
          setToast({ msg: 'Not enough stock!', type: 'error' });
          return i;
        }
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = async () => {
    if (isProcessing) return;
    
    const { cart: currentCart, customer: currCustomer, discount: currDiscount, useLoyalty: currUseLoyalty, paymentMethod: currPaymentMethod } = stateRef.current;
    
    if (currentCart.length === 0) return;
    
    setIsProcessing(true);

    // Tax Inclusive Calculation
    const totalMRP = currentCart.reduce((sum, item) => sum + (item.price_mrp * item.qty), 0);
    const tax = currentCart.reduce((sum, item) => {
      const itemTotal = item.price_mrp * item.qty;
      const taxRate = item.tax_rate || 0; 
      const withoutTax = itemTotal / (1 + (taxRate / 100));
      return sum + (itemTotal - withoutTax);
    }, 0);
    const subtotal = totalMRP - tax;

    const loyaltyValue = (currUseLoyalty && currCustomer) ? Math.floor(currCustomer.loyalty_points / 100) * 10 : 0;
    const total = Math.max(0, totalMRP - currDiscount - loyaltyValue);
    const earned = Math.floor(total / 100);

    const txn = {
      bill_number: `INV-${Date.now().toString().slice(-6)}`,
      items: currentCart,
      subtotal, tax, discount: currDiscount,
      loyalty_redeemed: loyaltyValue,
      loyalty_earned: earned,
      total,
      payment_method: currPaymentMethod,
      split_payments: currPaymentMethod.includes('+') ? stateRef.current.splitAmounts : null,
      customer_id: currCustomer?.id || null
    };

    try {
      const res = await api.post('/api/transactions', txn);
      setCompletedTxn({ ...res, customers: currCustomer });
      setCart([]);
      setCustomer(null);
      setDiscount(0);
      setUseLoyalty(false);
      setSplitAmounts({});
      localStorage.removeItem('pos_hold_cart');
      setProducts(prev => prev.map(p => {
        const cItem = currentCart.find(c => c.id === p.id);
        return cItem ? { ...p, stock: p.stock - cItem.qty } : p;
      }));
      setToast({ msg: 'Transaction Completed!', type: 'success' });
    } catch (e: any) {
      setToast({ msg: e.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const holdBill = () => {
    const currentCart = stateRef.current.cart;
    if (currentCart.length > 0) {
      localStorage.setItem('pos_hold_cart', JSON.stringify(currentCart));
      setToast({ msg: 'Cart saved to hold', type: 'success' });
      setCart([]);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="pos-layout">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {completedTxn && <InvoiceModal transaction={completedTxn} settings={settings} onClose={() => setCompletedTxn(null)} />}

      <div className="pos-main-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="pos-top-bar">
          <form className="pos-search-form" onSubmit={handleBarcodeSearch}>
            <div style={{ position: 'relative' }}>
              <input 
                ref={searchRef}
                className="form-control" 
                placeholder="Scan Barcode or Search Item (F1)..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 40, height: 44, fontSize: 16 }}
                autoFocus
              />
              <svg style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-secondary)' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </form>
          
          <div className="pos-categories">
            {categories.map(c => (
              <button 
                key={c} 
                className={`btn btn-sm ${activeCategory === c ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ borderRadius: 20, whiteSpace: 'nowrap' }}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary pos-hold-btn" onClick={holdBill} title="F10">Hold (F10)</button>
        </div>
        
        <div className="pos-products">
          <ProductGrid products={products} category={activeCategory} onAdd={addToCart} />
        </div>
      </div>

      <CartPanel 
        cart={cart} updateQty={updateQty} remove={removeFromCart}
        customer={customer} setCustomer={setCustomer}
        discount={discount} setDiscount={setDiscount}
        useLoyalty={useLoyalty} setUseLoyalty={setUseLoyalty}
        paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
        splitAmounts={splitAmounts} setSplitAmounts={setSplitAmounts}
        onCheckout={handleCheckout}
        settings={settings}
      />
    </div>
  );
}
