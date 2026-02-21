import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState('Cash');
  const navigate = useNavigate();

  useEffect(() => { api('/cart').then(setItems); }, []);

  const total = items.reduce((sum, i) => sum + i.total, 0);

  const placeOrder = async () => {
    try {
      await api('/checkout', 'POST', { payment_method: payment });
      navigate('/order-success');
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={s.page}>
      <h2 style={s.title}>💳 Checkout</h2>
      <div style={s.layout}>
        <div style={s.left}>
          <h3>Order Summary</h3>
          {items.map(i => (
            <div key={i.id} style={s.row}>
              <span>{i.name} ×{i.quantity}</span>
              <span>₹{i.total}</span>
            </div>
          ))}
          <div style={s.divider} />
          <div style={s.row}><strong>Total</strong><strong style={{color:'#e94560'}}>₹{total.toFixed(2)}</strong></div>
        </div>
        <div style={s.right}>
          <h3>Payment Method</h3>
          <select style={s.sel} value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
          {payment === 'UPI' && (
            <div style={s.upi}>
              <p>UPI ID: <strong>events@upi</strong></p>
              <p style={{fontSize:'13px',color:'#666'}}>Please transfer and confirm below.</p>
            </div>
          )}
          <button style={s.btn} onClick={placeOrder}>✅ Place Order</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'800px', margin:'0 auto' },
  title: { color:'#1a1a2e', marginBottom:'24px' },
  layout: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' },
  left: { background:'#fff', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)' },
  right: { background:'#fff', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)' },
  row: { display:'flex', justifyContent:'space-between', padding:'8px 0', color:'#444' },
  divider: { borderTop:'1px solid #eee', margin:'12px 0' },
  sel: { width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', marginBottom:'16px' },
  upi: { background:'#f0f7ff', padding:'12px', borderRadius:'8px', marginBottom:'16px' },
  btn: { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' }
};
