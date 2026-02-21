import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => { api('/products').then(setProducts).catch(console.error); }, []);

  const addToCart = async (pid) => {
    try {
      await api('/cart', 'POST', { product_id: pid, quantity: 1 });
      setMsg('✅ Added to cart!');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) { setMsg('❌ ' + e.message); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={s.page}>
      <h2 style={s.title}>🛍️ Available Products</h2>
      {msg && <div style={s.msg}>{msg}</div>}
      <input style={s.search} placeholder="Search products or category..."
        value={filter} onChange={e => setFilter(e.target.value)} />
      <div style={s.grid}>
        {filtered.map(p => (
          <div key={p.id} style={s.card}>
            <div style={s.cat}>{p.category || 'General'}</div>
            <h3 style={s.name}>{p.name}</h3>
            <p style={s.desc}>{p.description}</p>
            <p style={s.vendor}>By: {p.vendor}</p>
            <div style={s.footer}>
              <span style={s.price}>₹{p.price}</span>
              <button style={s.btn} onClick={() => addToCart(p.id)}>Add to Cart</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{color:'#999'}}>No products found.</p>}
      </div>
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'1100px', margin:'0 auto' },
  title: { color:'#1a1a2e', marginBottom:'16px' },
  msg: { background:'#e8f5e9', padding:'10px', borderRadius:'6px', marginBottom:'16px' },
  search: { padding:'10px 16px', borderRadius:'8px', border:'1px solid #ddd', width:'300px', marginBottom:'24px', fontSize:'14px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' },
  cat: { background:'#e8f0fe', color:'#1a73e8', fontSize:'12px', padding:'3px 8px', borderRadius:'20px', display:'inline-block', marginBottom:'8px' },
  name: { margin:'0 0 6px', color:'#1a1a2e' },
  desc: { color:'#666', fontSize:'13px', margin:'0 0 8px' },
  vendor: { color:'#999', fontSize:'12px', margin:'0 0 12px' },
  footer: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  price: { fontWeight:'bold', color:'#e94560', fontSize:'1.1rem' },
  btn: { background:'#1a1a2e', color:'#fff', border:'none', padding:'7px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }
};
