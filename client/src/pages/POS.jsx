import React,{useMemo,useState}from'react';
import{useMutation,useQuery,useQueryClient}from'@tanstack/react-query';
import{api}from'../api';
import{Page,Card,Badge,Empty}from'../components';

export default function POS(){
 const qc=useQueryClient();
 const[cart,setCart]=useState([]),[message,setMessage]=useState(''),[settle,setSettle]=useState({});
 const{data:menu=[]}=useQuery({queryKey:['menu'],queryFn:()=>api.get('/modules/menu-items').then(r=>r.data)});
 const{data:orders=[]}=useQuery({queryKey:['pos'],queryFn:()=>api.get('/modules/pos-orders').then(r=>r.data)});
 const{data:reservations=[]}=useQuery({queryKey:['inhouse-pos'],queryFn:()=>api.get('/reservations',{params:{status:'in-house'}}).then(r=>r.data)});

 function add(i){const found=cart.find(x=>x.id===i._id);setCart(found?cart.map(x=>x.id===i._id?{...x,qty:x.qty+1}:x):[...cart,{id:i._id,name:i.name,price:Number(i.price)||0,qty:1}])}
 function dec(id){setCart(cart.map(x=>x.id===id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0))}
 const total=useMemo(()=>cart.reduce((s,x)=>s+x.price*x.qty,0),[cart]);

 const orderMut=useMutation({
  mutationFn:body=>api.post('/pos/orders',body),
  onSuccess:()=>{setCart([]);setMessage('Order sent to kitchen');qc.invalidateQueries({queryKey:['pos']});qc.invalidateQueries({queryKey:['module','kitchen-tickets']})},
  onError:e=>setMessage(e.response?.data?.message||e.message)
 });
 const settleMut=useMutation({
  mutationFn:({id,body})=>api.post(`/pos/orders/${id}/settle`,body),
  onSuccess:()=>{setMessage('Order settled successfully');qc.invalidateQueries({queryKey:['pos']});qc.invalidateQueries({queryKey:['folios']})},
  onError:e=>setMessage(e.response?.data?.message||e.message)
 });

 const submit=()=>{if(!cart.length)return;orderMut.mutate({items:cart,station:'Main Kitchen',status:'open'})};
 const settleOrder=o=>{
  const state=settle[o._id]||{paymentMethod:'Cash',reservationId:''};
  if(state.paymentMethod==='Room Charge'&&!state.reservationId)return setMessage('Select an in-house guest for Room Charge.');
  settleMut.mutate({id:o._id,body:state});
 };

 return <Page title="Restaurant POS" subtitle="Orders, kitchen routing, settlement and room-charge posting">
  {message&&<div className="notice">{message}</div>}
  <div className="grid2">
   <Card title="Menu"><div className="menuGrid">{menu.map(i=><button key={i._id} className="menuItem" onClick={()=>add(i)}><b>{i.name}</b><span>₹{Number(i.price||0).toFixed(0)}</span></button>)}</div>{!menu.length&&<Empty text="No menu items configured"/>}</Card>
   <Card title="Current order">{cart.map(x=><div key={x.id} className="adminRow"><span>{x.name} × {x.qty}</span><div className="rowActions"><button onClick={()=>dec(x.id)}>-</button><b>₹{(x.price*x.qty).toFixed(0)}</b><button onClick={()=>add({_id:x.id,name:x.name,price:x.price})}>+</button></div></div>)}<div className="rowBetween totalRow"><b>Total</b><b>₹{total.toFixed(0)}</b></div><button className="primary" disabled={!cart.length||orderMut.isPending} onClick={submit}>{orderMut.isPending?'Sending…':'Send to kitchen'}</button></Card>
  </div>

  <div className="tableWrap"><table><thead><tr><th>Order</th><th>Total</th><th>Status</th><th>Settlement</th></tr></thead><tbody>{orders.map(o=>{
   const state=settle[o._id]||{paymentMethod:'Cash',reservationId:''};
   return <tr key={o._id}><td>{String(o._id||'').slice(-6)}</td><td>₹{Number(o.total||0).toFixed(0)}</td><td><Badge>{o.status}</Badge></td><td>{o.status==='settled'?<Badge>{o.paymentMethod||'Paid'}</Badge>:<div className="rowActions wrap"><select value={state.paymentMethod} onChange={e=>setSettle(v=>({...v,[o._id]:{...state,paymentMethod:e.target.value}}))}><option>Cash</option><option>Card</option><option>UPI</option><option>Room Charge</option></select>{state.paymentMethod==='Room Charge'&&<select value={state.reservationId} onChange={e=>setSettle(v=>({...v,[o._id]:{...state,reservationId:e.target.value}}))}><option value="">Select in-house guest</option>{reservations.map(r=><option key={r._id} value={r._id}>{r.room?.number||'Room'} · {r.guest?.fullName||r.confirmationNumber}</option>)}</select>}<button className="primary" disabled={settleMut.isPending} onClick={()=>settleOrder(o)}>Settle</button></div>}</td></tr>
  })}</tbody></table>{!orders.length&&<Empty text="No POS orders yet"/>}</div>
 </Page>;
}
