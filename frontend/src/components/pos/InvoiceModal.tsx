import React, { useState, useEffect } from 'react';

export default function InvoiceModal({ transaction, settings, storeName, onClose }: { transaction: any, settings?: any, storeName?: string, onClose: () => void }) {
  const [format, setFormat] = useState<'thermal' | 'a4'>(settings?.print_format || 'thermal');

  const handlePrint = () => {
    document.body.classList.add(`print-${format}`);
    window.print();
    document.body.classList.remove(`print-${format}`);
  };

  useEffect(() => {
    // Auto-trigger print when the modal opens for "instant print" experience
    const timer = setTimeout(() => {
      handlePrint();
    }, 500);
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  const items = typeof transaction.items === 'string' ? JSON.parse(transaction.items) : transaction.items;
  const date = new Date(transaction.created_at || Date.now()).toLocaleString();
  
  // UPI Data Generation
  let upiAmount = transaction.total;
  if (transaction.split_payments && transaction.split_payments.upi !== undefined) {
    upiAmount = transaction.split_payments.upi;
  }

  const upiUrl = settings?.upi_id && upiAmount > 0 ? `upi://pay?pa=${settings.upi_id}&pn=${encodeURIComponent(settings.upi_name || storeName || 'Shop')}&am=${upiAmount.toFixed(2)}&cu=INR` : '';


  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 800 }}>
        <div className="modal-header no-print">
          <h3>Invoice: {transaction.bill_number}</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="form-control" style={{ width: 'auto' }} value={format} onChange={(e: any) => setFormat(e.target.value)}>
              <option value="thermal">Thermal (80mm)</option>
              <option value="a4">A4 Tax Invoice</option>
            </select>
            <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print</button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#f5f5f5', padding: 40, display: 'flex', justifyContent: 'center' }}>
          
          <div id="invoice-print-area" style={{ 
            background: 'white', 
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            ...(format === 'thermal' ? {
              width: '80mm', padding: '10mm', fontFamily: 'monospace', fontSize: '12px'
            } : {
              width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: 'Inter, sans-serif'
            })
          }}>
            
            {format === 'thermal' ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 18, marginBottom: 4 }}>{settings?.shop_name || storeName || 'Supermarket Pro'}</h2>
                <div style={{ fontSize: 10, marginBottom: 8 }}>{settings?.address || ''}</div>
                {settings?.gstin && <div style={{ fontSize: 10, marginBottom: 4 }}>GSTIN: {settings.gstin}</div>}
                <div style={{ fontSize: 10, marginBottom: 8 }}>Tax Invoice</div>
                <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
                <div style={{ textAlign: 'left', fontSize: 11, marginBottom: 8 }}>
                  <div>Bill: {transaction.bill_number}</div>
                  <div>Date: {date}</div>
                  {transaction.customers?.name && <div>Cust: {transaction.customers.name}</div>}
                </div>
                <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
                <table style={{ width: '100%', textAlign: 'left', fontSize: 10, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <th style={{ padding: '4px 0' }}>Item</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td style={{ padding: '4px 0' }}>{it.name.substring(0,18)}<br/><small>HSN: {it.hsn_code || '-'}</small></td>
                        <td style={{ textAlign: 'center' }}>{it.qty}</td>
                        <td style={{ textAlign: 'right' }}>{it.price_mrp.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{(it.qty * it.price_mrp).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
                <div style={{ textAlign: 'right', fontSize: 11 }}>
                  <div>Total Value: ₹{(transaction.total + transaction.discount + transaction.loyalty_redeemed).toFixed(2)}</div>
                  {transaction.discount > 0 && <div>Discount: -₹{transaction.discount.toFixed(2)}</div>}
                  {transaction.loyalty_redeemed > 0 && <div>Loyalty: -₹{transaction.loyalty_redeemed.toFixed(2)}</div>}
                  <div style={{ fontSize: 10, color: '#444' }}>Includes GST: ₹{transaction.tax.toFixed(2)}</div>
                  <div style={{ fontWeight: 'bold', fontSize: 14, marginTop: 4, borderTop: '1px double #000', paddingTop: 4 }}>NET PAYABLE: ₹{transaction.total.toFixed(2)}</div>
                  {transaction.split_payments && (
                    <div style={{ fontSize: 10, marginTop: 4 }}>
                      {Object.entries(transaction.split_payments).map(([method, amount]) => (
                        <div key={method} style={{ textTransform: 'capitalize', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Paid via {method}:</span> <span>₹{Number(amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
                <div style={{ fontSize: 10, fontWeight: 'bold' }}>YOU SAVED: ₹{(transaction.discount + transaction.loyalty_redeemed).toFixed(2)}</div>
                
                {settings?.enable_upi_qr && upiUrl && (
                  <div style={{ marginTop: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 10, marginBottom: 4 }}>Scan & Pay via UPI (₹{upiAmount.toFixed(2)})</div>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiUrl)}`} alt="UPI QR" style={{ width: 100, height: 100 }} />
                  </div>
                )}
                
                <div style={{ fontSize: 10, marginTop: 8 }}>{settings?.invoice_footer || 'Thank you! Visit again.'}</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 24 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 24, color: 'var(--color-primary)' }}>{storeName || 'Supermarket Pro'}</h1>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>GSTIN: 29XXXXX0000X1Z5</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: 20, color: '#333' }}>TAX INVOICE</h2>
                    <div style={{ fontSize: 12, marginTop: 4 }}><strong>Invoice No:</strong> {transaction.bill_number}</div>
                    <div style={{ fontSize: 12 }}><strong>Date:</strong> {date}</div>
                  </div>
                </div>

                {transaction.customers?.name && (
                  <div style={{ marginBottom: 24, padding: 12, border: '1px solid #eee', borderRadius: 4 }}>
                    <strong>Billed To:</strong><br/>
                    {transaction.customers.name}<br/>
                    {transaction.customers.phone && <span>Ph: {transaction.customers.phone}</span>}
                  </div>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Sl</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Item Description</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>HSN</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>Tax %</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>{i+1}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>{it.name}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>{it.hsn_code || '-'}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{it.price_mrp.toFixed(2)}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{it.qty}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{it.tax_rate}%</td>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{(it.qty * it.price_mrp).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <table style={{ width: '300px', fontSize: 13 }}>
                    <tbody>
                      <tr><td style={{ padding: 4 }}>Total Value:</td><td style={{ padding: 4, textAlign: 'right' }}>₹{(transaction.total + transaction.discount + transaction.loyalty_redeemed).toFixed(2)}</td></tr>
                      <tr><td style={{ padding: 4, color: '#666', fontSize: 11 }}>Tax Amount Included:</td><td style={{ padding: 4, textAlign: 'right', color: '#666', fontSize: 11 }}>₹{transaction.tax.toFixed(2)}</td></tr>
                      {transaction.discount > 0 && <tr><td style={{ padding: 4 }}>Discount:</td><td style={{ padding: 4, textAlign: 'right' }}>-₹{transaction.discount.toFixed(2)}</td></tr>}
                      {transaction.loyalty_redeemed > 0 && <tr><td style={{ padding: 4 }}>Loyalty Points:</td><td style={{ padding: 4, textAlign: 'right' }}>-₹{transaction.loyalty_redeemed.toFixed(2)}</td></tr>}
                      <tr><td style={{ padding: 8, fontWeight: 'bold', fontSize: 16, borderTop: '1px solid #000' }}>GRAND TOTAL:</td><td style={{ padding: 8, fontWeight: 'bold', fontSize: 16, textAlign: 'right', borderTop: '1px solid #000' }}>₹{transaction.total.toFixed(2)}</td></tr>
                      
                      {transaction.split_payments && Object.entries(transaction.split_payments).map(([method, amount]) => (
                        <tr key={method}><td style={{ padding: 4, fontSize: 11, color: '#666', textTransform: 'capitalize' }}>Paid via {method}:</td><td style={{ padding: 4, fontSize: 11, color: '#666', textAlign: 'right' }}>₹{Number(amount).toFixed(2)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {settings?.enable_upi_qr && upiUrl && (
                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiUrl)}`} alt="UPI QR" style={{ width: 80, height: 80, border: '1px solid #ddd', padding: 4 }} />
                    <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Scan to Pay (₹{upiAmount.toFixed(2)})</div>
                  </div>
                )}

                <div style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: '#666', borderTop: '1px solid #eee', paddingTop: 16 }}>
                  This is a computer generated invoice.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
