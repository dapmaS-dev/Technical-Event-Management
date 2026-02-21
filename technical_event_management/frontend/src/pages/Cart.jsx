import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const load = () => api('/cart').then(setItems).catch(console.error);
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api(`/cart/${id}`, 'DELETE');
    load();
  };

  const total = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <div style={s.page}>
      <h2 style={s.title}>🛒 Your Cart</h2>
      {items.length === 0 ? (
        <div style={s.empty}>
          <p>Your cart is empty!</p>
          <button style={s.btn} onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      ) : (
        <>
          {items.map(i => (
            <div key={i.id} style={s.item}>
              <div>
                <p style={s.name}>{i.name}</p>
                <p style={s.sub}>Qty: {i.quantity} × ₹{i.price}</p>
              </div>
              <div style={s.right}>
                <span style={s.total}>₹{i.total}</span>
                <button style={s.del} onClick={() => remove(i.id)}>🗑️ Remove</button>
              </div>
            </div>
          ))}
          <div style={s.summary}>
            <span style={s.grand}>Total: ₹{total.toFixed(2)}</span>
            <button style={s.checkout} onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'700px', margin:'0 auto' },
  title: { color:'#1a1a2e', marginBottom:'24px' },
  empty: { textAlign:'center', padding:'60px 0', color:'#666' },
  item: { background:'#fff', padding:'16px 20px', borderRadius:'10px', marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 6px rgba(0,0,0,0.06)' },
  name: { margin:'0 0 4px', fontWeight:'bold', color:'#1a1a2e' },
  sub: { margin:0, color:'#888', fontSize:'13px' },
  right: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' },
  total: { fontWeight:'bold', color:'#e94560' },
  del: { background:'none', border:'1px solid #eee', padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  summary: { background:'#1a1a2e', color:'#fff', padding:'20px', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px' },
  grand: { fontSize:'1.2rem', fontWeight:'bold' },
  checkout: { background:'#e94560', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
  btn: { background:'#1a1a2e', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', marginTop:'12px' }
};
