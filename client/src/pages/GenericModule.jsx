import React,{useEffect,useMemo,useState}from'react';
import{useParams}from'react-router-dom';
import{useMutation,useQuery,useQueryClient}from'@tanstack/react-query';
import{api}from'../api';
import{Page,Empty}from'../components';import{useAuth}from'../AuthContext';

const nice=s=>s.replace(/([A-Z])/g,' $1').replace(/^./,x=>x.toUpperCase());
const toInput=(v,t)=>{if(v==null)return'';if(t==='Date'){const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}if(t==='Mixed')return typeof v==='string'?v:JSON.stringify(v);return v};
const parseValue=(value,type)=>{if(type==='Number')return value===''?undefined:Number(value);if(type==='Boolean')return!!value;if(type==='Date')return value?new Date(value).toISOString():undefined;if(type==='Mixed'){if(value==='')return undefined;try{return JSON.parse(value)}catch{return value}}return value};
const workflows={
 'laundry-orders':[{label:'Washing',path:id=>`/operations/laundry/${id}/status`,body:{status:'Washing'}},{label:'Ready',path:id=>`/operations/laundry/${id}/status`,body:{status:'Ready'}},{label:'Deliver + Post',path:id=>`/operations/laundry/${id}/status`,body:{status:'Delivered'}}],
 'minibar-entries':[{label:'Post to Folio',path:id=>`/operations/minibar/${id}/post`,body:{}}],
 'spa-appointments':[{label:'Confirm',path:id=>`/operations/spa/${id}/status`,body:{status:'Confirmed'}},{label:'Start',path:id=>`/operations/spa/${id}/status`,body:{status:'In Progress'}},{label:'Complete + Post',path:id=>`/operations/spa/${id}/status`,body:{status:'Completed'}}],
 'transport-requests':[{label:'Assign',path:id=>`/operations/transport/${id}/status`,body:{status:'Assigned'}},{label:'Dispatch',path:id=>`/operations/transport/${id}/status`,body:{status:'Dispatched'}},{label:'Complete + Post',path:id=>`/operations/transport/${id}/status`,body:{status:'Completed'}}],
 'maintenance-work-orders':[{label:'Start',path:id=>`/operations/maintenance/${id}/status`,body:{status:'In Progress'}},{label:'Complete',path:id=>`/operations/maintenance/${id}/status`,body:{status:'Completed'}},{label:'Verify',path:id=>`/operations/maintenance/${id}/status`,body:{status:'Verified'}}],
 'events':[{label:'Confirm',path:id=>`/operations/event/${id}/status`,body:{status:'Confirmed'}},{label:'Issue BEO',path:id=>`/operations/event/${id}/status`,body:{status:'BEO Issued'}},{label:'Complete',path:id=>`/operations/event/${id}/status`,body:{status:'Completed'}}],
 'inventory-items':[{label:'+1 Stock',path:id=>`/operations/inventory/${id}/adjust`,body:{qty:1,type:'adjustment'}}],
 'cashier-shifts':[{label:'Close Shift',path:id=>`/operations/cashier/${id}/close`,body:{actualCash:0}}],
 'preventive-maintenance':[{label:'Generate Work Order',path:id=>`/operations/preventive/${id}/generate-work-order`,body:{}}],
 'incidents':[{label:'Investigating',path:id=>`/operations/incident/${id}/status`,body:{status:'Investigating'}}],
 'shifts':[{label:'Approve',path:id=>`/operations/shift/${id}/approve`,body:{}}],
 'integrations':[{label:'Test Adapter',path:id=>`/operations/integration/${id}/test`,body:{}}],
 'lost-found':[{label:'Store',path:id=>`/operations/lost-found/${id}/status`,body:{status:'Stored'}},{label:'Guest Contacted',path:id=>`/operations/lost-found/${id}/status`,body:{status:'Guest Contacted'}},{label:'Returned',path:id=>`/operations/lost-found/${id}/status`,body:{status:'Returned'}}]
};

export default function GenericModule(){
  const{module}=useParams(),qc=useQueryClient(),{can}=useAuth();
  const{data:meta={}}=useQuery({queryKey:['module-meta'],queryFn:()=>api.get('/modules/meta').then(r=>r.data)});const def=meta[module];
  const{data:rows=[],isLoading,error}=useQuery({queryKey:['module',module],enabled:!!def,queryFn:()=>api.get(`/modules/${module}`).then(r=>r.data)});
  const[form,setForm]=useState({});const[editing,setEditing]=useState(null);const[message,setMessage]=useState('');const fields=useMemo(()=>def?Object.keys(def.fields):[],[def]);
  useEffect(()=>{setForm({});setEditing(null);setMessage('')},[module]);
  const refresh=()=>qc.invalidateQueries({queryKey:['module',module]});
  const create=useMutation({mutationFn:x=>api.post(`/modules/${module}`,x),onSuccess:()=>{refresh();setForm({});setMessage('Saved successfully')},onError:e=>setMessage(e.response?.data?.message||e.message)});
  const update=useMutation({mutationFn:({id,data})=>api.patch(`/modules/${module}/${id}`,data),onSuccess:()=>{refresh();setEditing(null);setForm({});setMessage('Updated successfully')},onError:e=>setMessage(e.response?.data?.message||e.message)});
  const remove=useMutation({mutationFn:id=>api.delete(`/modules/${module}/${id}`),onSuccess:()=>{refresh();setMessage('Deleted successfully')},onError:e=>setMessage(e.response?.data?.message||e.message)});
  const workflow=useMutation({mutationFn:({path,body})=>api.post(path,body),onSuccess:()=>{refresh();setMessage('Workflow action completed')},onError:e=>setMessage(e.response?.data?.message||e.message)});
  const generateForecast=useMutation({mutationFn:()=>api.post('/operations/forecast/generate',{days:14}),onSuccess:()=>{refresh();setMessage('14-day forecast generated')},onError:e=>setMessage(e.response?.data?.message||e.message)});
  const submit=()=>{const data={};for(const f of fields){const v=parseValue(form[f],def.fields[f]);if(v!==undefined)data[f]=v}editing?update.mutate({id:editing._id,data}):create.mutate(data)};
  const beginEdit=row=>{const next={};for(const f of fields)next[f]=toInput(row[f],def.fields[f]);setForm(next);setEditing(row);window.scrollTo({top:0,behavior:'smooth'})};
  if(!def)return <Page title="Module not found" subtitle="This module is not configured"><Empty/></Page>;
  const actions=(workflows[module]||[]).filter(()=>can(`modules.${module}.update`));const canCreate=can(`modules.${module}.create`),canUpdate=can(`modules.${module}.update`),canDelete=can(`modules.${module}.delete`);
  return <Page title={def.label||module} subtitle="Enterprise operational module">
    {(canCreate||editing)&&<div className="card">
      <div className="sectionHead"><div><h3>{editing?'Edit record':'Add record'}</h3><p className="muted">Configured fields plus operational workflow actions are available where the specification requires them.</p></div><div className="rowActions">{module==='forecasts'&&can('modules.forecasts.create')&&<button className="primary" onClick={()=>generateForecast.mutate()} disabled={generateForecast.isPending}>Generate 14-day forecast</button>}{editing&&<button className="ghost" onClick={()=>{setEditing(null);setForm({})}}>Cancel edit</button>}</div></div>
      {message&&<div className="notice">{message}</div>}
      <div className="formGrid">{fields.map(f=>{const t=def.fields[f],val=form[f]??'';if(t==='Boolean')return <label className="inline" key={f}><input type="checkbox" checked={!!form[f]} onChange={e=>setForm({...form,[f]:e.target.checked})}/>{nice(f)}</label>;if(t==='Date')return <label key={f}>{nice(f)}<input type="datetime-local" value={val} onChange={e=>setForm({...form,[f]:e.target.value})}/></label>;if(t==='Mixed')return <label key={f}>{nice(f)}<textarea rows="3" placeholder='{"key":"value"}' value={val} onChange={e=>setForm({...form,[f]:e.target.value})}/></label>;return <label key={f}>{nice(f)}<input type={t==='Number'?'number':'text'} value={val} onChange={e=>setForm({...form,[f]:e.target.value})}/></label>})}<div className="actions">{(editing?canUpdate:canCreate)&&<button className="primary" disabled={create.isPending||update.isPending} onClick={submit}>{editing?'Update':'Save'}</button>}</div></div>
    </div>}
    <div className="tableWrap"><table><thead><tr>{fields.slice(0,8).map(f=><th key={f}>{nice(f)}</th>)}<th>Updated</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r._id}>{fields.slice(0,8).map(f=><td key={f}>{typeof r[f]==='object'&&r[f]!==null?JSON.stringify(r[f]).slice(0,100):String(r[f]??'—')}</td>)}<td>{r.updatedAt?new Date(r.updatedAt).toLocaleString():'—'}</td><td><div className="rowActions">{canUpdate&&<button className="ghost" onClick={()=>beginEdit(r)}>Edit</button>}{actions.map(a=><button className="ghost" key={a.label} disabled={workflow.isPending} onClick={()=>workflow.mutate({path:a.path(r._id),body:a.body})}>{a.label}</button>)}{canDelete&&<button className="danger" onClick={()=>{if(confirm('Delete this record?'))remove.mutate(r._id)}}>Delete</button>}</div></td></tr>)}</tbody></table>{isLoading&&<div className="pad">Loading…</div>}{error&&<div className="pad error">{error.response?.data?.message||error.message}</div>}{!isLoading&&!rows.length&&<Empty/>}</div>
  </Page>
}
