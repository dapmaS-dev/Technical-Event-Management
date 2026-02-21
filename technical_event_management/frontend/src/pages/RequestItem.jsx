import { useState, useEffect } from 'react';
import { api } from '../api';

export default function RequestItem() {
  const [form, setForm] = useState({ item_name:'', description:'', vendor_id:'' });
  const [vendors, setVendors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/vendors').then(setVendors);
    api('/item-requests').then(setRequests).catch(()=>{});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/request-item', 'POST', form);
      setMsg('✅ Request submitted!');
      setForm({ item_name:'', description:'', vendor_id:'' });
      api('/item-requests').then(setRequests);
    } catch (e) { setMsg('❌ ' + e.message); }
  };

  return (
    <div style={s.page}>
      <h2 style={s.title}>📋 Request an Item</h2>
      {msg && <div style={s.msg}>{msg}</div>}
      <div style={s.layout}>
        <div style={s.card}>
          <h3>New Request</h3>
          <form onSubmit={submit}>
            <input style={s.input} placeholder="Item Name" value={form.item_name}
              onChange={e=>setForm({...form,item_name:e.target.value})} required />
            <textarea style={s.input} placeholder="Description / Requirements" rows={3}
              value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            <select style={s.input} value={form.vendor_id} onChange={e=>setForm({...form,vendor_id:e.target.value})}>
              <option value="">Select Vendor (Optional)</option>
              {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <button style={s.btn} type="submit">Submit Request</button>
          </form>
        </div>
        <div style={s.card}>
          <h3>My Requests</h3>
          {requests.length === 0 && <p style={{color:'#999'}}>No requests yet.</p>}
          {requests.map(r => (
            <div key={r.id} style={s.req}>
              <p style={s.rname}>{r.item_name}</p>
              <p style={s.rdesc}>{r.description}</p>
              <span style={{...s.badge, background: r.status==='Pending'?'#f0a500':'#34a853'}}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'900px', margin:'0 auto' },
  title: { color:'#1a1a2e', marginBottom:'24px' },
  msg: { background:'#e8f5e9', padding:'10px', borderRadius:'6px', marginBottom:'16px' },
  layout: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' },
  card: { background:'#fff', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)' },
  input: { display:'block', width:'100%', padding:'10px', marginBottom:'12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', fontFamily:'inherit' },
  btn: { width:'100%', padding:'11px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
  req: { borderBottom:'1px solid #f0f0f0', padding:'12px 0' },
  rname: { margin:'0 0 4px', fontWeight:'bold', color:'#1a1a2e' },
  rdesc: { margin:'0 0 8px', fontSize:'13px', color:'#666' },
  badge: { color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'12px' }
};
