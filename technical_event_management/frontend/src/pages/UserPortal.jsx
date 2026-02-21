import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { icon:'🛍️', title:'Browse Products', desc:'Explore all available event items and services', path:'/products' },
    { icon:'🛒', title:'My Cart', desc:'View and manage your selected items', path:'/cart' },
    { icon:'📦', title:'My Orders', desc:'Track your order status and history', path:'/orders' },
    { icon:'📋', title:'Request Item', desc:'Request a specific item from a vendor', path:'/request-item' },
  ];

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <h1>Welcome, {user?.name}! 👋</h1>
        <p>Manage your event needs from one place</p>
      </div>
      <div style={s.grid}>
        {cards.map(c => (
          <div key={c.path} style={s.card} onClick={() => navigate(c.path)}>
            <div style={s.icon}>{c.icon}</div>
            <h3 style={s.cardTitle}>{c.title}</h3>
            <p style={s.cardDesc}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: { padding:'40px', maxWidth:'900px', margin:'0 auto' },
  hero: { background:'linear-gradient(135deg,#1a1a2e,#16213e)', color:'#fff', padding:'40px', borderRadius:'16px', marginBottom:'32px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px' },
  card: { background:'#fff', padding:'28px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', cursor:'pointer', transition:'transform 0.2s', textAlign:'center' },
  icon: { fontSize:'2.5rem', marginBottom:'12px' },
  cardTitle: { margin:'0 0 8px', color:'#1a1a2e' },
  cardDesc: { color:'#666', fontSize:'0.85rem', margin:0 }
};
