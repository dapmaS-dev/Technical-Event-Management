import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AddItem() {
  const [form, setForm] = useState({ name:'', description:'', price:'', quantity:'', category:'' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/products', 'POST', { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
      setMsg('✅ Product added!');
      setTimeout(() => navigate('/vendor'), 1500);
    } catch (e) { setMsg('❌ ' + e.message); }
  };

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/vendor')}>← Back</button>
      <div style={s.card}>
        <h2 style={s.title}>➕ Add New Product</h2>
        {msg && <div style={s.msg}>{msg}</div>}
        <form onSubmit={submit}>
          <label style={s.label}>Product Name</label>
          <input style={s.input} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <label style={s.label}>Description</label>
          <textarea style={s.input} rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <div style={s.row}>
            <div style={{flex:1}}>
              <label style={s.label}>Price (₹)</label>
              <input style={s.input} type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>Quantity</label>
              <input style={s.input} type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required />
            </div>
          </div>
          <label style={s.label}>Category</label>
          <select style={s.input} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            <option value="">Select Category</option>
            <option>Decoration</option><option>Catering</option><option>Audio/Visual</option>
            <option>Furniture</option><option>Photography</option><option>Other</option>
          </select>
          <button style={s.btn} type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'580px', margin:'0 auto' },
  back: { background:'none', border:'none', color:'#1a73e8', cursor:'pointer', fontSize:'14px', marginBottom:'16px', padding:0 },
  card: { background:'#fff', padding:'32px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' },
  title: { margin:'0 0 20px', color:'#1a1a2e' },
  msg: { background:'#e8f5e9', padding:'10px', borderRadius:'6px', marginBottom:'16px' },
  label: { display:'block', fontSize:'13px', color:'#444', marginBottom:'4px', fontWeight:'500' },
  input: { display:'block', width:'100%', padding:'10px', marginBottom:'14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', fontFamily:'inherit' },
  row: { display:'flex', gap:'16px' },
  btn: { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', cursor:'pointer' }
};
