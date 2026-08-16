const base = process.env.API_URL || 'http://localhost:5000/api';
const email = process.env.TEST_ADMIN_EMAIL || 'admin@hms.local';
const password = process.env.TEST_ADMIN_PASSWORD || 'Admin@123';
let token='', property='';
const out=[];
async function call(name,path,opt={}){
  try{
    const headers={'Content-Type':'application/json',...(opt.headers||{})};
    if(token) headers.Authorization=`Bearer ${token}`;
    if(property) headers['X-Property-Id']=property;
    const r=await fetch(base+path,{...opt,headers});
    const text=await r.text(); let data; try{data=JSON.parse(text)}catch{data=text}
    if(!r.ok) throw new Error(`${r.status} ${data?.message||text}`);
    out.push(['PASS',name]); return data;
  }catch(e){out.push(['FAIL',name,e.message]); return null}
}
(async()=>{
 await call('API health','/health');
 const login=await call('Admin login','/auth/login',{method:'POST',body:JSON.stringify({email,password})});
 if(!login){console.table(out);process.exit(1)}
 token=login.token; property=login.user.properties?.[0]?._id||'';
 const me=await call('Authenticated profile','/auth/me'); if(!property) property=me?.user?.properties?.[0]?._id||'';
 const types=await call('Room types','/rooms/types');
 await call('Executive dashboard','/dashboard');
 await call('Reservation list','/reservations');
 await call('Tape chart data','/reservations/calendar');
 await call('Folio list','/folios');
 await call('Module definitions','/modules/meta');
 if(types?.[0]){
   const ci=new Date(Date.now()+3*86400000); ci.setHours(14,0,0,0); const co=new Date(ci.getTime()+2*86400000);
   await call('Availability search',`/reservations/availability?checkIn=${encodeURIComponent(ci.toISOString())}&checkOut=${encodeURIComponent(co.toISOString())}&roomType=${types[0]._id}`);
   await call('Rate quote / dynamic pricing','/commercial/rate-quote',{method:'POST',body:JSON.stringify({roomType:types[0]._id,checkIn:ci.toISOString(),checkOut:co.toISOString(),adults:2,children:0})});
   await call('CRS chain search',`/commercial/crs/search?checkIn=${encodeURIComponent(ci.toISOString())}&checkOut=${encodeURIComponent(co.toISOString())}`);
 }
 await call('Channel manager safe sync','/commercial/channel-sync',{method:'POST',body:JSON.stringify({channel:'Booking.com',dryRun:true})});
 await call('Guest CRM search','/commercial/guests');
 await call('Service requests','/modules/service-requests');
 await call('Loyalty accounts','/modules/loyalty-accounts');
 await call('Guest journeys','/modules/guest-journeys');
 await call('Upsell offers','/modules/upsell-offers');
 await call('AI Concierge routing','/commercial/concierge',{method:'POST',body:JSON.stringify({message:'What is the check-out time?'})});
 console.table(out.map(x=>({status:x[0],test:x[1],detail:x[2]||''})));
 const failed=out.filter(x=>x[0]==='FAIL');
 console.log(`\n${out.length-failed.length}/${out.length} checks passed.`);
 process.exit(failed.length?1:0);
})();
