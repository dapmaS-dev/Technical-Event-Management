import { useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>🎉</div>
        <h2 style={s.title}>Order Placed Successfully!</h2>
        <p style={s.sub}>Your order has been received. You can track it in My Orders.</p>
        <div style={s.btns}>
          <button style={s.btn} onClick={() => navigate('/orders')}>View My Orders</button>
          <button style={{...s.btn, background:'#fff', color:'#1a1a2e', border:'1px solid #ddd'}}
            onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center' },
  card: { textAlign:'center', background:'#fff', padding:'60px 40px', borderRadius:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  icon: { fontSize:'4rem', marginBottom:'16px' },
  title: { color:'#1a1a2e', marginBottom:'8px' },
  sub: { color:'#666', marginBottom:'28px' },
  btns: { display:'flex', gap:'12px', justifyContent:'center' },
  btn: { padding:'10px 24px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }
};
