import React from'react';
import{useQuery}from'@tanstack/react-query';
import{BedDouble,CalendarCheck2,DoorOpen,IndianRupee,TrendingUp,Users,UtensilsCrossed,Sparkles,ArrowUpRight}from'lucide-react';
import{api}from'../api';
import{Page,Card}from'../components';

const fmt=n=>Number(n||0).toLocaleString('en-IN');
const MiniSpark=()=> <div className="miniSpark"><i/><i/><i/><i/><i/><i/><i/><i/></div>;
function Kpi({icon:Icon,label,value,detail,tone=''}){return <div className={`kpiCard ${tone}`}><div className="kpiTop"><span className="kpiIcon"><Icon size={17}/></span><span className="kpiTrend"><ArrowUpRight size={11}/> live</span></div><b>{value}</b><span>{label}</span><small>{detail}</small><MiniSpark/></div>}

export default function Dashboard(){
 const{data:d}=useQuery({queryKey:['dashboard'],queryFn:()=>api.get('/dashboard').then(r=>r.data)});
 const statuses=Object.entries(d?.rooms?.status||{});
 const total=Math.max(1,Number(d?.rooms?.total||0));
 return <Page title="Executive Dashboard" subtitle="Real-time operational control center for your property">
  <div className="dashboardToolbar"><div><span className="liveDot"/> Live property data</div><div className="toolbarPills"><span>Today</span><span>All Departments</span></div></div>
  <div className="kpiGrid">
   <Kpi icon={TrendingUp} label="Occupancy" value={d?`${d.kpis.occupancy}%`:'—'} detail="Current room utilization" tone="gold"/>
   <Kpi icon={IndianRupee} label="ADR" value={d?`₹${fmt(d.kpis.adr)}`:'—'} detail="Average daily rate"/>
   <Kpi icon={Sparkles} label="RevPAR" value={d?`₹${fmt(d.kpis.revpar)}`:'—'} detail="Revenue per available room" tone="violet"/>
   <Kpi icon={CalendarCheck2} label="Arrivals" value={d?.today?.arrivals??'—'} detail="Expected today" tone="amber"/>
   <Kpi icon={DoorOpen} label="Departures" value={d?.today?.departures??'—'} detail="Scheduled today" tone="green"/>
   <Kpi icon={Users} label="In-house Guests" value={d?.today?.inHouse??'—'} detail="Currently staying" tone="cyan"/>
  </div>
  <div className="dashGrid3">
   <Card title="Occupancy Overview" className="dashTall">
    <div className="donutRow"><div className="donut" style={{'--p':`${Math.min(100,Number(d?.kpis?.occupancy||0))}%`}}><div><b>{d?`${d.kpis.occupancy}%`:'—'}</b><span>Occupied</span></div></div><div className="legendList"><span><i className="lg occupied"/>Occupied <b>{d?.rooms?.occupied||0}</b></span><span><i className="lg vacant"/>Available <b>{d?.rooms?.available||0}</b></span><span><i className="lg reserved"/>Reserved <b>{d?.rooms?.reserved||0}</b></span><span><i className="lg dirty"/>Dirty / service <b>{(d?.rooms?.status?.['Vacant Dirty']||0)+(d?.rooms?.status?.['Out of Order']||0)}</b></span></div></div>
   </Card>
   <Card title="Room Status" className="dashTall"><div className="roomStatusList">{statuses.length?statuses.slice(0,7).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b><em style={{width:`${Math.min(100,(Number(v)/total)*100)}%`}}/></div>):<div className="muted">Room status will appear after seed data loads.</div>}</div></Card>
   <Card title="Revenue This Month" className="dashTall"><div className="revenueHero">₹{fmt(d?.revenue?.total)}</div><p className="muted">Room revenue ₹{fmt(d?.revenue?.room)}</p><div className="revenueChart">{[42,58,51,72,64,81,76,91,86,97,84,100].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><div className="revenueFoot"><span>Outstanding</span><b>₹{fmt(d?.revenue?.outstanding)}</b></div></Card>
  </div>
  <div className="dashGrid2">
   <Card title="Today's Front Office"><div className="todayList"><div><CalendarCheck2/><span>Arrivals</span><b>{d?.today?.arrivals||0}</b></div><div><DoorOpen/><span>Departures</span><b>{d?.today?.departures||0}</b></div><div><Users/><span>Walk-ins</span><b>{d?.today?.walkIns||0}</b></div><div><BedDouble/><span>No Shows</span><b>{d?.today?.noShows||0}</b></div></div></Card>
   <Card title="Department Revenue"><div className="departmentList"><div><span><BedDouble/>Rooms</span><b>₹{fmt(d?.revenue?.room)}</b></div><div><span><UtensilsCrossed/>Restaurant / POS</span><b>₹{fmt(d?.revenue?.pos)}</b></div><div><span><Sparkles/>Spa & Services</span><b>₹{fmt((d?.revenue?.spa||0)+(d?.revenue?.misc||0))}</b></div></div></Card>
  </div>
 </Page>
}
