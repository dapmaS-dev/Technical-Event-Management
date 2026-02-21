import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🎪 TechEvent Manager</div>
      <div style={styles.links}>
        {!user && <><Link style={styles.a} to="/login">Login</Link><Link style={styles.a} to="/signup">Sign Up</Link></>}

        {user?.role === 'user' && <>
          <Link style={styles.a} to="/portal">Home</Link>
          <Link style={styles.a} to="/products">Products</Link>
          <Link style={styles.a} to="/cart">🛒 Cart</Link>
          <Link style={styles.a} to="/orders">My Orders</Link>
          <Link style={styles.a} to="/request-item">Request Item</Link>
        </>}

        {user?.role === 'vendor' && <>
          <Link style={styles.a} to="/vendor">Dashboard</Link>
          <Link style={styles.a} to="/vendor/add-item">Add Product</Link>
        </>}

        {user?.role === 'admin' && <>
          <Link style={styles.a} to="/admin">Admin Panel</Link>
        </>}

        {user && <>
          <span style={styles.username}>👤 {user.name} ({user.role})</span>
          <button style={styles.btn} onClick={handleLogout}>Logout</button>
        </>}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1a1a2e', color:'#fff', padding:'12px 24px', position:'sticky', top:0, zIndex:100 },
  brand: { fontSize:'1.3rem', fontWeight:'bold', color:'#e94560' },
  links: { display:'flex', gap:'16px', alignItems:'center' },
  a: { color:'#eee', textDecoration:'none', fontSize:'0.9rem' },
  username: { color:'#a8dadc', fontSize:'0.85rem' },
  btn: { background:'#e94560', border:'none', color:'#fff', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }
};
