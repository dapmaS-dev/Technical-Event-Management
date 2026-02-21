import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const statusColor = { Pending:'#f0a500', Processing:'#1a73e8', Delivered:'#34a853', Cancelled:'#e94560' };

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('products');
  const navigate = useNavigate();

  useEffect(() => {
    api('/vendor/products').then(setProducts);
    api('/orders').then(setOrders);
    api('/item-requests').then(setRequests).catch(()=>{});
  }, []);

  const toggleStatus = async (p) => {
    await api(`/products/${p.id}`, 'PUT', { status: p.status === 'available' ? 'unavailable' : 'available' });
    api('/vendor/products').then(setProducts);
  };

  const updateOrderStatus = async (id, status) => {
    await api(`/orders/${id}/status`, 'PUT', { status });
    api('/orders').then(setOrders);
  };

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <h2>🏪 Vendor Dashboard</h2>
        <button style={s.addBtn} onClick={() => navigate('/vendor/add-item')}>+ Add New Product</button>
      </div>
      <div style={s.tabs}>
        {['products','orders','requests'].map(t => (
          <button key={t} style={{...s.tab, ...(tab===t?s.activeTab:{})}} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div style={s.grid}>
          {products.map(p => (
            <div key={p.id} style={s.card}>
              <div style={s.cat}>{p.category||'General'}</div>
              <h3 style={s.name}>{p.name}</h3>
              <p>₹{p.price} | Qty: {p.quantity}</p>
              <span style={{...s.badge, background: p.status==='available'?'#34a853':'#e94560'}}>{p.status}</span>
              <br/><br/>
              <button style={s.toggleBtn} onClick={() => toggleStatus(p)}>
                {p.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {orders.map(o => (
            <div key={o.id} style={s.orderCard}>
              <div style={s.oh}>
                <span>Order #{o.id} — {o.user}</span>
                <span style={{...s.badge, background: statusColor[o.status]||'#888'}}>{o.status}</span>
              </div>
              <p style={{color:'#888',fontSize:'13px'}}>{o.created_at} | ₹{o.total}</p>
              <div style={s.statusRow}>
                {['Pending','Processing','Delivered','Cancelled'].map(st => (
                  <button key={st} style={{...s.stBtn, background: o.status===st?'#1a1a2e':'#eee', color: o.status===st?'#fff':'#333'}}
                    onClick={() => updateOrderStatus(o.id, st)}>{st}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div>
          {requests.map(r => (
            <div key={r.id} style={s.orderCard}>
              <h4 style={{margin:'0 0 4px'}}>{r.item_name}</h4>
              <p style={{color:'#666',margin:'0 0 8px',fontSize:'13px'}}>{r.description}</p>
              <p style={{color:'#888',fontSize:'12px'}}>Requested by: {r.user}</p>
            </div>
          ))}
          {requests.length === 0 && <p style={{color:'#999'}}>No requests yet.</p>}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'1000px', margin:'0 auto' },
  hero: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  addBtn: { background:'#e94560', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer' },
  tabs: { display:'flex', gap:'8px', marginBottom:'24px' },
  tab: { padding:'8px 20px', border:'1px solid #ddd', borderRadius:'8px', cursor:'pointer', background:'#fff' },
  activeTab: { background:'#1a1a2e', color:'#fff', border:'1px solid #1a1a2e' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px' },
  card: { background:'#fff', padding:'18px', borderRadius:'10px', boxShadow:'0 1px 6px rgba(0,0,0,0.06)' },
  cat: { background:'#e8f0fe', color:'#1a73e8', fontSize:'12px', padding:'2px 8px', borderRadius:'20px', display:'inline-block', marginBottom:'8px' },
  name: { margin:'0 0 8px' },
  badge: { color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'12px' },
  toggleBtn: { width:'100%', padding:'7px', background:'#f5f5f5', border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  orderCard: { background:'#fff', padding:'20px', borderRadius:'10px', marginBottom:'12px', boxShadow:'0 1px 6px rgba(0,0,0,0.06)' },
  oh: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' },
  statusRow: { display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'12px' },
  stBtn: { padding:'5px 12px', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' }
};
