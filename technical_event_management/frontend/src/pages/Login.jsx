import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const data = await api('/login', 'POST', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Welcome Back 🎪</h2>
        <p style={s.sub}>Sign in to Technical Event Manager</p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={s.input} type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={s.btn} type="submit">Login</button>
        </form>
        <p style={s.link}>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        <p style={s.hint}>Demo: admin@event.com / admin123</p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f8' },
  card: { background:'#fff', padding:'40px', borderRadius:'16px', width:'380px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  title: { margin:'0 0 4px', color:'#1a1a2e' },
  sub: { color:'#666', margin:'0 0 20px' },
  err: { background:'#fee', color:'#c00', padding:'10px', borderRadius:'6px', marginBottom:'12px' },
  input: { display:'block', width:'100%', padding:'12px', marginBottom:'12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box' },
  btn: { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  link: { textAlign:'center', marginTop:'16px', color:'#666' },
  hint: { textAlign:'center', fontSize:'12px', color:'#999', marginTop:'8px' }
};
