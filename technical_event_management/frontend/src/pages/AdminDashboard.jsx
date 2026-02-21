import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('users');

  const load = () => {
    api('/admin/users').then(setUsers);
    api('/orders').then(setOrders);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (uid) => {
    await api(`/admin/users/${uid}/toggle`, 'PUT');
    load();
  };

  const updateStatus = async (oid, status) => {
    await api(`/orders/${oid}/status`, 'PUT', { status });
    load();
  };

  const vendors = users.filter(u => u.role === 'vendor');
  const userList = users.filter(u => u.role === 'user');

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <h2>🔧 Admin Dashboard</h2>
        <div style={s.stats}>
          <span style={s.stat}>👥 Users: {userList.length}</span>
          <span style={s.stat}>🏪 Vendors: {vendors.length}</span>
          <span style={s.stat}>📦 Orders: {orders.length}</span>
        </div>
      </div>
      <div style={s.tabs}>
        {['users','vendors','orders'].map(t=>(
          <button key={t} style={{...s.tab,...(tab===t?s.activeTab:{})}} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {(tab==='users'||tab==='vendors') && (
        <table style={s.table}>
          <thead><tr>
            {['ID','Name','Email','Phone','Status','Action'].map(h=><th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {(tab==='users'?userList:vendors).map(u=>(
              <tr key={u.id}>
                <td style={s.td}>{u.id}</td>
                <td style={s.td}>{u.name}</td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}>{u.phone||'-'}</td>
                <td style={s.td}>
                  <span style={{...s.badge, background: u.is_active?'#34a853':'#e94560'}}>
                    {u.is_active?'Active':'Inactive'}
                  </span>
                </td>
                <td style={s.td}>
                  <button style={s.actBtn} onClick={()=>toggle(u.id)}>
                    {u.is_active?'Deactivate':'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab==='orders' && (
        <table style={s.table}>
          <thead><tr>
            {['Order#','User','Items','Total','Payment','Status','Update'].map(h=><th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {orders.map(o=>(
              <tr key={o.id}>
                <td style={s.td}>#{o.id}</td>
                <td style={s.td}>{o.user}</td>
                <td style={s.td}>{o.items.map(i=>i.name).join(', ')}</td>
                <td style={s.td}>₹{o.total}</td>
                <td style={s.td}>{o.payment}</td>
                <td style={s.td}><span style={{...s.badge, background:{Pending:'#f0a500',Processing:'#1a73e8',Delivered:'#34a853',Cancelled:'#e94560'}[o.status]||'#888'}}>{o.status}</span></td>
                <td style={s.td}>
                  <select style={s.sel} value={o.status} onChange={e=>updateStatus(o.id, e.target.value)}>
                    {['Pending','Processing','Delivered','Cancelled'].map(st=><option key={st}>{st}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const s = {
  page: { padding:'32px', maxWidth:'1200px', margin:'0 auto' },
  hero: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'24px', borderRadius:'12px', color:'#fff' },
  stats: { display:'flex', gap:'16px' },
  stat: { background:'rgba(255,255,255,0.15)', padding:'6px 14px', borderRadius:'20px', fontSize:'13px' },
  tabs: { display:'flex', gap:'8px', marginBottom:'24px' },
  tab: { padding:'8px 20px', border:'1px solid #ddd', borderRadius:'8px', cursor:'pointer', background:'#fff' },
  activeTab: { background:'#1a1a2e', color:'#fff', border:'1px solid #1a1a2e' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.06)' },
  th: { background:'#f8f9fa', padding:'12px 14px', textAlign:'left', fontSize:'13px', color:'#444', borderBottom:'1px solid #eee' },
  td: { padding:'11px 14px', fontSize:'13px', color:'#333', borderBottom:'1px solid #f0f0f0' },
  badge: { color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'12px' },
  actBtn: { padding:'5px 12px', background:'#f0f0f0', border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  sel: { padding:'5px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'12px' }
};
