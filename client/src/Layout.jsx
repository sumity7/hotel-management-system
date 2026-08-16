import React,{useMemo,useState}from'react';
import{NavLink,Outlet,useNavigate}from'react-router-dom';
import*as Icons from'lucide-react';
import{menu}from'./moduleConfig';
import{useAuth}from'./AuthContext';

const ops=new Set(['laundry-orders','linen-items','minibar-entries','spa-appointments','events','inventory-items','cashier-shifts','maintenance-work-orders','preventive-maintenance','assets','transport-requests','lost-found','incidents','shifts','attendance','integrations']);
const direct=new Set(['dashboard','reservations','reservation-control','check-in','calendar','rooms','folios','housekeeping','pos-orders','procurement','reports','ai','audit','approvals','admin','revenue-distribution','guest-experience']);

const roleMenu={
 saas_super_admin:['*'],system_admin:['*'],regional_corporate_admin:['dashboard','reservations','calendar','rooms','revenue-distribution','rate-plans','crs-allotments','channel-mappings','reports','forecasts','currencies','translations','tax-rules','integrations','audit','admin','subscriptions','plans'],
 general_manager:['dashboard','reservations','reservation-control','check-in','calendar','rooms','folios','housekeeping','guest-experience','revenue-distribution','pos-orders','reports','approvals','audit','admin','service-requests','events','inventory-items','maintenance-work-orders','employees','ai'],
 front_desk:['dashboard','reservations','reservation-control','check-in','calendar','rooms','folios','housekeeping','guest-experience','service-requests','transport-requests','reports'],
 reservations_agent:['dashboard','reservations','reservation-control','calendar','rooms','rate-plans','revenue-distribution','crs-allotments','corporate-accounts','travel-agents','reports'],
 cashier:['dashboard','folios','cashier-shifts','ar-accounts','reports'],
 housekeeping_attendant:['dashboard','rooms','housekeeping','minibar-entries','laundry-orders','service-requests'],
 housekeeping_supervisor:['dashboard','rooms','housekeeping','minibar-entries','laundry-orders','linen-items','reports'],
 fnb_cashier_waiter:['dashboard','pos-orders','kitchen-tickets','folios'],
 kitchen_staff:['dashboard','kitchen-tickets','pos-orders'],
 revenue_manager:['dashboard','reservations','rooms','revenue-distribution','rate-plans','crs-allotments','channel-mappings','forecasts','reports'],
 sales_events:['dashboard','events','corporate-accounts','travel-agents','reservations','spa-appointments','reports'],
 finance:['dashboard','folios','ar-accounts','night-audits','cashier-shifts','tax-rules','reports','approvals','audit'],
 engineering:['dashboard','rooms','maintenance-work-orders','preventive-maintenance','assets','iot-devices','energy-readings','transport-requests','reports']
};

const groupFor=k=>{
 if(k==='dashboard')return'Overview';
 if(['reservations','reservation-control','check-in','calendar','rooms','folios','rate-plans','crs-allotments','booking-engine-content','channel-mappings','revenue-distribution'].includes(k))return'Front Office';
 if(['guest-experience','loyalty-accounts','service-requests','guest-journeys','upsell-offers'].includes(k))return'Guest';
 if(['housekeeping','laundry-orders','linen-items','minibar-entries'].includes(k))return'Operations';
 if(['pos-orders','kitchen-tickets','spa-appointments','events'].includes(k))return'F&B & Events';
 if(['inventory-items','procurement','purchase-requests','suppliers'].includes(k))return'Procurement';
 if(['ar-accounts','night-audits','cashier-shifts','corporate-accounts','travel-agents'].includes(k))return'Finance';
 if(['maintenance-work-orders','preventive-maintenance','assets','transport-requests','lost-found','incidents'].includes(k))return'Engineering';
 if(['employees','shifts','attendance','approvals','audit','documents'].includes(k))return'Governance';
 if(['reports','forecasts','ai'].includes(k))return'Intelligence';
 return'Enterprise';
};

const today=()=>new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date());

export default function Layout(){
 const{user,logout}=useAuth(),nav=useNavigate();
 const[q,setQ]=useState(''),[compact,setCompact]=useState(false);
 const items=useMemo(()=>{
   const allowed=roleMenu[user?.role]||['dashboard'];
   return menu.filter(x=>(allowed.includes('*')||allowed.includes(x.key))&&x.label.toLowerCase().includes(q.toLowerCase()));
 },[q,user?.role]);
 const grouped=useMemo(()=>items.reduce((a,x)=>((a[groupFor(x.key)]??=[]).push(x),a),{}),[items]);
 const property=user?.properties?.[0]?.name||user?.property?.name||user?.propertyName||'Grand Luxury Hotel';
 const routeFor=x=>x.key==='pos-orders'?'/pos':ops.has(x.key)?`/ops/${x.key}`:direct.has(x.key)?`/${x.key}`:`/m/${x.key}`;

 return <div className={`shell ${compact?'compact':''}`}>
  <aside className="sidebar">
   <div className="sidebarFixedTop">
    <div className="brand">
     <div className="brandMark"><span>H</span></div>
     <div><b>Hotel Management System</b><span>Premium Enterprise</span></div>
    </div>
    <div className="sidebarTools"><div className="searchWrap"><Icons.Search size={15}/><input className="menuSearch" placeholder="Search modules…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
   </div>

   <div className="sidebarScroll">
    <nav>{Object.entries(grouped).map(([g,list])=><div className="navGroup" key={g}><div className="navGroupTitle">{g}</div>{list.map(x=>{const I=Icons[x.icon]||Icons.Circle;return <NavLink key={x.key} to={routeFor(x)} title={compact?x.label:undefined} className={({isActive})=>isActive?'nav active':'nav'}><I size={16}/><span>{x.label}</span><Icons.ChevronRight className="navArrow" size={12}/></NavLink>})}</div>)}</nav>
   </div>

   <div className="sidebarFooterArea">
    {!compact&&<div className="sidebarFoot"><div><Icons.ShieldCheck size={15}/><span>Enterprise secure</span></div><small>Multi-property · RBAC · Audit</small></div>}
    <button className="collapseBtn" onClick={()=>setCompact(v=>!v)}>{compact?<Icons.PanelLeftOpen size={16}/>:<Icons.PanelLeftClose size={16}/>}<span>Compact sidebar</span></button>
   </div>
  </aside>

  <main className="main">
   <header className="topbar">
    <div className="topIdentity"><button className="mobileMenu" onClick={()=>setCompact(v=>!v)}><Icons.Menu size={19}/></button><div><strong>Executive Workspace</strong><span className="muted">Unified hospitality operations platform</span></div></div>
    <div className="topActions">
     <div className="propertyChip"><Icons.Building2 size={15}/><div><span>Property</span><b>{property}</b></div></div>
     <div className="dateChip"><Icons.CalendarDays size={15}/><span>{today()}</span></div>
     <button className="iconBtn" title="Notifications"><Icons.Bell size={18}/><i/></button>
     <div className="profileChip"><div className="avatar">{(user?.name||'U').slice(0,1).toUpperCase()}</div><div><b>{user?.name||'User'}</b><span>{user?.role?.replaceAll('_',' ')}</span></div></div>
     <button className="ghost logoutBtn" onClick={()=>{logout();nav('/login',{replace:true})}} title="Sign out"><Icons.LogOut size={16}/></button>
    </div>
   </header>
   <section className="content"><Outlet/></section>
  </main>
 </div>;
}
