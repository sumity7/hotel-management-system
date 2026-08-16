import React,{useMemo,useState}from'react';
import{useMutation,useQuery,useQueryClient}from'@tanstack/react-query';
import{api}from'../api';
import{Page,Empty,Badge}from'../components';

const calc=f=>{
  const charges=(f?.items||[]).reduce((s,i)=>s+Number(i.amount||0)+Number(i.tax||0)-Number(i.discount||0),0);
  const paid=(f?.payments||[]).reduce((s,p)=>s+Number(p.amount||0)-Number(p.refundedAmount||0),0);
  return{charges,paid,balance:charges-paid};
};

export default function Folios(){
  const qc=useQueryClient();
  const[selectedId,setSelectedId]=useState('');
  const[charge,setCharge]=useState({description:'Miscellaneous',amount:0,tax:0,type:'misc',department:'Front Office'});
  const[payment,setPayment]=useState({method:'UPI',kind:'settlement',amount:'',currency:'INR',reference:''});
  const[refund,setRefund]=useState({paymentId:'',amount:'',reason:''});
  const[credit,setCredit]=useState({amount:'',reason:''});
  const[split,setSplit]=useState({name:'Company Folio',payerType:'corporate',payerName:'',itemIds:[]});
  const[invoiceEmail,setInvoiceEmail]=useState('');
  const[message,setMessage]=useState('');

  const{data:rows=[],isLoading}=useQuery({queryKey:['folios'],queryFn:()=>api.get('/folios').then(r=>r.data)});
  const selected=useMemo(()=>rows.find(f=>f._id===selectedId)||null,[rows,selectedId]);
  const totals=calc(selected);

  const refresh=()=>qc.invalidateQueries({queryKey:['folios']});
  const mut=useMutation({
    mutationFn:({id,path,body})=>api.post(`/folios/${id}/${path}`,body),
    onSuccess:()=>{refresh();setMessage('Folio updated successfully')},
    onError:e=>setMessage(e.response?.data?.message||e.message)
  });

  const selectFolio=f=>{
    setSelectedId(f._id);
    const x=calc(f);
    setPayment(v=>({...v,amount:x.balance>0?String(Number(x.balance.toFixed(2))):''}));
    setInvoiceEmail(f.reservation?.guest?.email||'');
    setSplit({name:'Company Folio',payerType:'corporate',payerName:'',itemIds:[]});
    setRefund({paymentId:'',amount:'',reason:''});
    setMessage('');
  };

  const receivePayment=()=>{
    const amount=Number(payment.amount);
    if(!(amount>0))return setMessage('Enter a payment amount greater than zero.');
    if(payment.kind==='settlement'&&totals.balance<=0)return setMessage('No outstanding balance. Choose Advance / Deposit to record a prepayment.');
    if(payment.kind==='settlement'&&amount>totals.balance+0.01)return setMessage(`Settlement cannot exceed outstanding balance ₹${totals.balance.toFixed(2)}.`);
    mut.mutate({id:selected._id,path:'payments',body:{...payment,amount}});
  };

  const addCharge=()=>{
    const amount=Number(charge.amount);
    if(!(amount>0))return setMessage('Charge amount must be greater than zero.');
    mut.mutate({id:selected._id,path:'items',body:{...charge,amount:Number(charge.amount),tax:Number(charge.tax||0)}});
  };

  const makeRefund=()=>{
    const amount=Number(refund.amount);
    if(!refund.paymentId)return setMessage('Select a captured payment to refund.');
    if(!(amount>0))return setMessage('Refund amount must be greater than zero.');
    mut.mutate({id:selected._id,path:'refunds',body:{...refund,amount}});
  };

  const makeCredit=()=>{
    const amount=Number(credit.amount);
    if(!(amount>0)||!credit.reason.trim())return setMessage('Credit note requires a positive amount and reason.');
    mut.mutate({id:selected._id,path:'credit-notes',body:{...credit,amount}});
  };

  const chooseItem=id=>setSplit(v=>({...v,itemIds:v.itemIds.includes(id)?v.itemIds.filter(x=>x!==id):[...v.itemIds,id]}));

  return <Page title="Folio, Billing & Payments" subtitle="Unified charges, partial/split settlement, routing, refunds, credit notes and invoice generation">
    {message&&<div className="notice">{message}</div>}

    <div className="grid2">
      <div className="tableWrap">
        <table><thead><tr><th>Guest</th><th>Room</th><th>Charges</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>
          {rows.map(f=>{const x=calc(f);return <tr key={f._id} onClick={()=>selectFolio(f)} className={`click ${selectedId===f._id?'selectedRow':''}`}><td>{f.reservation?.guest?.fullName||'Guest'}</td><td>{f.reservation?.room?.number||'—'}</td><td>₹{x.charges.toFixed(2)}</td><td>₹{x.paid.toFixed(2)}</td><td><b>₹{x.balance.toFixed(2)}</b></td><td><Badge>{f.status||'open'}</Badge></td></tr>})}
        </tbody></table>
        {isLoading&&<div className="pad">Loading…</div>}
        {!isLoading&&!rows.length&&<Empty/>}
      </div>

      <div className="card">
        {selected?<>
          <h3>{selected.reservation?.guest?.fullName||'Guest folio'}</h3>
          <p className="muted">{selected.reservation?.confirmationNumber||selected._id}</p>
          <div className="statsInline"><span>Charges <b>₹{totals.charges.toFixed(2)}</b></span><span>Paid <b>₹{totals.paid.toFixed(2)}</b></span><span>Balance <b>₹{totals.balance.toFixed(2)}</b></span></div>

          <h4>Post charge</h4>
          <div className="formCol">
            <input placeholder="Description" value={charge.description} onChange={e=>setCharge({...charge,description:e.target.value})}/>
            <input type="number" min="0" placeholder="Amount" value={charge.amount} onChange={e=>setCharge({...charge,amount:e.target.value})}/>
            <input type="number" min="0" placeholder="Tax" value={charge.tax} onChange={e=>setCharge({...charge,tax:e.target.value})}/>
            <button onClick={addCharge} disabled={mut.isPending}>Add charge</button>
          </div>

          <h4>Accept payment</h4>
          <div className="formCol">
            <select value={payment.kind} onChange={e=>setPayment({...payment,kind:e.target.value,amount:e.target.value==='settlement'&&totals.balance>0?String(Number(totals.balance.toFixed(2))):''})}><option value="settlement">Settlement</option><option value="advance">Advance / Deposit</option></select>
            <select value={payment.method} onChange={e=>setPayment({...payment,method:e.target.value})}><option>Cash</option><option>Card</option><option>UPI</option><option>Bank Transfer</option><option>Online</option><option>Corporate Billing</option></select>
            <input type="number" min="0" step="0.01" placeholder="Amount" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})}/>
            <input placeholder="Reference / transaction ID (optional)" value={payment.reference} onChange={e=>setPayment({...payment,reference:e.target.value})}/>
            <button className="primary" onClick={receivePayment} disabled={mut.isPending}>{mut.isPending?'Processing…':'Accept payment'}</button>
          </div>

          <h4>Generate invoice</h4>
          <div className="formCol">
            <input placeholder="Invoice email" value={invoiceEmail} onChange={e=>setInvoiceEmail(e.target.value)}/>
            <button onClick={()=>mut.mutate({id:selected._id,path:'invoice',body:{email:invoiceEmail}})} disabled={mut.isPending}>Generate / Email-ready invoice</button>
          </div>
        </>:<p>Select a folio.</p>}
      </div>
    </div>

    {selected&&<>
      <div className="grid2">
        <div className="card">
          <h3>Refund payment</h3>
          <div className="formCol">
            <select value={refund.paymentId} onChange={e=>setRefund({...refund,paymentId:e.target.value})}><option value="">Select payment</option>{(selected.payments||[]).map(p=><option key={p._id} value={p._id}>{p.method} · ₹{Number(p.amount||0).toFixed(2)} · {p.reference||'no ref'}</option>)}</select>
            <input type="number" min="0" placeholder="Refund amount" value={refund.amount} onChange={e=>setRefund({...refund,amount:e.target.value})}/>
            <input placeholder="Reason" value={refund.reason} onChange={e=>setRefund({...refund,reason:e.target.value})}/>
            <button onClick={makeRefund} disabled={mut.isPending}>Process refund</button>
          </div>
        </div>

        <div className="card">
          <h3>Credit note</h3>
          <div className="formCol">
            <input type="number" min="0" placeholder="Credit amount" value={credit.amount} onChange={e=>setCredit({...credit,amount:e.target.value})}/>
            <input placeholder="Reason" value={credit.reason} onChange={e=>setCredit({...credit,reason:e.target.value})}/>
            <button onClick={makeCredit} disabled={mut.isPending}>Create credit note</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Split folio / routing</h3>
        <p className="muted">Select charges to move into a guest, company or agent sub-folio.</p>
        <div className="formGrid">
          <input value={split.name} onChange={e=>setSplit({...split,name:e.target.value})}/>
          <select value={split.payerType} onChange={e=>setSplit({...split,payerType:e.target.value})}><option value="guest">Guest</option><option value="corporate">Corporate</option><option value="travel-agent">Travel Agent</option><option value="other">Other</option></select>
          <input placeholder="Payer name" value={split.payerName} onChange={e=>setSplit({...split,payerName:e.target.value})}/>
        </div>
        <div className="tableWrap"><table><thead><tr><th>Select</th><th>Charge</th><th>Amount</th></tr></thead><tbody>{(selected.items||[]).map(i=><tr key={i._id}><td><input type="checkbox" checked={split.itemIds.includes(i._id)} onChange={()=>chooseItem(i._id)}/></td><td>{i.description}</td><td>₹{Number(Number(i.amount||0)+Number(i.tax||0)-Number(i.discount||0)).toFixed(2)}</td></tr>)}</tbody></table></div>
        <button className="primary" disabled={!split.itemIds.length||mut.isPending} onClick={()=>mut.mutate({id:selected._id,path:'split-folio',body:split})}>Create split folio</button>
        {selected.subFolios?.length>0&&<div className="notice">{selected.subFolios.length} split folio(s) configured</div>}
      </div>
    </>}
  </Page>;
}
