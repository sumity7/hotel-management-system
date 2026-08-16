import React,{useMemo,useState}from'react';
import{useMutation,useQuery,useQueryClient}from'@tanstack/react-query';
import{api}from'../api';
import{Page,Empty,Badge}from'../components';

const can={
  submit:s=>s==='Draft',
  rfq:s=>s==='Approved',
  compare:s=>s==='RFQ Issued',
  po:s=>s==='Quote Selected',
  grn:s=>['Issued','Partially Received'].includes(s),
  invoice:s=>s==='Goods Received',
  handoff:s=>s==='Invoice Received',
};

export default function Procurement(){
  const qc=useQueryClient();
  const[selected,setSelected]=useState(null),[message,setMessage]=useState('');
  const[f,setF]=useState({department:'Housekeeping',item:'Bath Towel',qty:20,neededBy:'',budgetRef:'OPS-2026'});
  const[quoteAmounts,setQuoteAmounts]=useState({});

  const{data:requests=[]}=useQuery({queryKey:['proc-requests'],queryFn:()=>api.get('/procurement/requests').then(r=>r.data)});
  const{data:orders=[]}=useQuery({queryKey:['proc-orders'],queryFn:()=>api.get('/procurement/orders').then(r=>r.data)});
  const{data:suppliers=[]}=useQuery({queryKey:['suppliers'],queryFn:()=>api.get('/modules/suppliers').then(r=>r.data)});

  const supplierQuotes=useMemo(()=>suppliers
    .map(s=>({supplierId:s._id,supplier:s.name,total:Number(quoteAmounts[s._id]||0)}))
    .filter(q=>q.total>0),[suppliers,quoteAmounts]);

  const refresh=()=>{
    qc.invalidateQueries({queryKey:['proc-requests']});
    qc.invalidateQueries({queryKey:['proc-orders']});
    qc.invalidateQueries({queryKey:['approvals']});
  };

  const mut=useMutation({
    mutationFn:({url,body={}})=>api.post(url,body),
    onSuccess:r=>{
      setMessage('Workflow updated successfully');
      refresh();
      if(r.data?.request)setSelected(r.data.request);
      else if(r.data?.requestNumber)setSelected(r.data);
    },
    onError:e=>setMessage(e.response?.data?.message||e.message)
  });

  const createRequest=()=>{
    if(!f.department.trim()||!f.item.trim()||Number(f.qty)<=0)return setMessage('Department, item and positive quantity are required.');
    mut.mutate({url:'/procurement/requests',body:{department:f.department,items:[{name:f.item,qty:Number(f.qty)}],neededBy:f.neededBy||undefined,budgetRef:f.budgetRef}});
  };

  const selectedStatus=selected?.status||'';

  return <Page title="Procurement Workflow" subtitle="Purchase Request → Approval → RFQ → Quote Comparison → PO → GRN → Supplier Invoice → Payment Handoff">
    {message&&<div className="notice">{message}</div>}

    <div className="card">
      <h3>Create Purchase Request</h3>
      <div className="formGrid">
        <label>Department<input value={f.department} onChange={e=>setF({...f,department:e.target.value})}/></label>
        <label>Item<input value={f.item} onChange={e=>setF({...f,item:e.target.value})}/></label>
        <label>Quantity<input type="number" min="1" value={f.qty} onChange={e=>setF({...f,qty:e.target.value})}/></label>
        <label>Needed by<input type="date" value={f.neededBy} onChange={e=>setF({...f,neededBy:e.target.value})}/></label>
        <label>Budget reference<input value={f.budgetRef} onChange={e=>setF({...f,budgetRef:e.target.value})}/></label>
        <div className="actions"><button className="primary" onClick={createRequest} disabled={mut.isPending}>Create PR</button></div>
      </div>
    </div>

    <div className="grid2">
      <div className="tableWrap">
        <table><thead><tr><th>PR</th><th>Department</th><th>Status</th></tr></thead><tbody>
          {requests.map(r=><tr key={r._id} className="click" onClick={()=>setSelected(r)}><td>{r.requestNumber}</td><td>{r.department}</td><td><Badge>{r.status}</Badge></td></tr>)}
        </tbody></table>
        {!requests.length&&<Empty/>}
      </div>

      <div className="card">
        {selected?<>
          <h3>{selected.requestNumber}</h3>
          <p><Badge>{selectedStatus}</Badge></p>

          <div className="workflowStrip compactFlow">
            {['Draft','Pending Approval','Approved','RFQ Issued','Quote Selected','PO Created'].map((s,i)=><div className={`workflowStage ${selectedStatus===s?'current':''}`} key={s}><span>{i+1}</span><b>{s}</b></div>)}
          </div>

          <div className="rowActions wrap">
            <button disabled={!can.submit(selectedStatus)||mut.isPending} onClick={()=>mut.mutate({url:`/procurement/requests/${selected._id}/submit`,body:{amount:0}})}>1. Submit for approval</button>
          </div>

          {selectedStatus==='Pending Approval'&&<div className="notice">Approval is pending. Open <b>Approvals</b>, approve this purchase request, then return here and select it again.</div>}

          <h4>Supplier quotations</h4>
          <div className="formCol">
            {suppliers.map(s=><label key={s._id}>{s.name}<input type="number" min="0" placeholder="Quoted total" value={quoteAmounts[s._id]||''} onChange={e=>setQuoteAmounts(v=>({...v,[s._id]:e.target.value}))}/></label>)}
            {!suppliers.length&&<div className="notice">No suppliers found. Seed data or create suppliers first.</div>}
          </div>

          <div className="rowActions wrap">
            <button disabled={!can.rfq(selectedStatus)||!supplierQuotes.length||mut.isPending} onClick={()=>mut.mutate({url:`/procurement/requests/${selected._id}/rfq`,body:{supplierQuotes}})}>2. Issue RFQ</button>
            <button disabled={!can.compare(selectedStatus)||mut.isPending} onClick={()=>mut.mutate({url:`/procurement/requests/${selected._id}/compare`})}>3. Compare & select lowest</button>
            <button className="primary" disabled={!can.po(selectedStatus)||mut.isPending} onClick={()=>mut.mutate({url:`/procurement/requests/${selected._id}/create-po`})}>4. Create PO</button>
          </div>
        </>:<p>Select a purchase request.</p>}
      </div>
    </div>

    <div className="tableWrap">
      <table><thead><tr><th>PO</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {orders.map(o=><tr key={o._id}><td>{o.poNumber}</td><td>₹{Number(o.total||0).toLocaleString('en-IN')}</td><td><Badge>{o.status}</Badge></td><td><div className="rowActions wrap">
          <button disabled={!can.grn(o.status)||mut.isPending} onClick={()=>mut.mutate({url:`/procurement/orders/${o._id}/grn`,body:{items:o.items}})}>5. Receive / GRN</button>
          <button disabled={!can.invoice(o.status)||mut.isPending} onClick={()=>mut.mutate({url:`/procurement/orders/${o._id}/invoice`,body:{invoiceNumber:`SUP-${Date.now().toString().slice(-6)}`,amount:o.total}})}>6. Supplier invoice</button>
          <button disabled={!can.handoff(o.status)||mut.isPending} onClick={()=>mut.mutate({url:`/procurement/orders/${o._id}/payment-handoff`})}>7. Payment handoff</button>
        </div></td></tr>)}
      </tbody></table>
      {!orders.length&&<Empty/>}
    </div>
  </Page>;
}
