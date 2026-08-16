import React from'react';
import{useMutation,useQuery,useQueryClient}from'@tanstack/react-query';
import{api}from'../api';
import{Page,Badge,Empty}from'../components';
import{useAuth}from'../AuthContext';

export default function Housekeeping(){
 const qc=useQueryClient(),{user}=useAuth();
 const{data:rows=[]}=useQuery({queryKey:['hk'],queryFn:()=>api.get('/housekeeping').then(r=>r.data)});
 const m=useMutation({mutationFn:({id,status})=>api.patch(`/housekeeping/${id}`,{status}),onSuccess:()=>qc.invalidateQueries({queryKey:['hk']})});
 const canInspect=['housekeeping_supervisor','general_manager','system_admin','saas_super_admin','regional_corporate_admin'].includes(user?.role);
 return <Page title="Housekeeping Operations" subtitle="Live cleaning, room readiness, minibar, damages and supervisor inspection"><div className="cards">{rows.map(t=><div className="card" key={t._id}><div className="rowBetween"><h3>Room {t.room?.number}</h3><Badge>{t.status}</Badge></div><p className="muted">Priority: {t.priority}</p><div className="checklist">{t.checklist?.map((x,i)=><label key={x._id||x.label||i}><input type="checkbox" checked={x.done} readOnly/>{x.label}</label>)}</div><div className="actions"><button onClick={()=>m.mutate({id:t._id,status:'Cleaning'})}>Start</button><button onClick={()=>m.mutate({id:t._id,status:'Clean'})}>Clean</button>{canInspect&&<button className="primary" onClick={()=>m.mutate({id:t._id,status:'Inspected'})}>Inspect</button>}</div></div>)}{!rows.length&&<Empty/>}</div></Page>;
}
