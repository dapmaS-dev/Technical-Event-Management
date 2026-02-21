import { useState, useEffect } from 'react';
import { api } from '../api';

const statusColor = { Pending:'#f0a500', Processing:'#1a73e8', Delivered:'#34a853', Cancelled:'#e94560' };

export default function OrderStatus() {
  const [orders, setOrders] = useState([]);

  useEffect(() => { api('/orders').then(setOrders).catch(console.error); }, []);

  return (
    <div style={s.page}>
      <h2 style={s.title}>📦 My Orders</h2>
      {orders.length === 0 && <p style={{color:'#999'}}>No orders yet.</p>}
      {orders.map(o => (
        <div key={o.id} style={s.card}>
          <div style={s.header}>
            <span>Order #{o.id}</span>
            <span style={{...s.badge, background: statusColor[o.status] || '#888'}}>{o.status}</span>
          </div>
          <p style={s.meta}>Placed: {o.created_at} | Payment: {o.payment}</p>
          <div style={s.items}>
            {o.items.map((i,idx) => (
              <span key={idx} style={s.item}>{i.name} ×{i.qty} = ₹{(i.price*i.qty).toFixed(2)}</span>
            ))}
          </div>
          <div style={s.total}>Total: ₹{o.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'700px', margin:'0 auto' },
  title: { color:'#1a1a2e', marginBottom:'24px' },
  card: { background:'#fff', padding:'20px', borderRadius:'12px', marginBottom:'16px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' },
  badge: { color:'#fff', padding:'4px 10px', borderRadius:'20px', fontSize:'12px' },
  meta: { color:'#888', fontSize:'13px', margin:'0 0 10px' },
  items: { display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'10px' },
  item: { background:'#f5f5f5', padding:'4px 10px', borderRadius:'20px', fontSize:'13px' },
  total: { fontWeight:'bold', color:'#e94560' }
};
