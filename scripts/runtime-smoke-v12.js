const base=process.env.API_URL||'http://localhost:5000/api';
const accounts=[
 ['SaaS Admin','admin@hms.local','Admin@123','/dashboard'],
 ['Front Desk','frontdesk@hms.local','FrontDesk@123','/dashboard'],
 ['Housekeeping','housekeeping@hms.local','Housekeeping@123','/housekeeping'],
 ['Finance','finance@hms.local','Finance@123','/folios'],
 ['Revenue','revenue@hms.local','Revenue@123','/modules/rate-plans'],
 ['Engineering','engineering@hms.local','Engineering@123','/modules/maintenance-work-orders'],
 ['Restaurant','restaurant@hms.local','Restaurant@123','/modules/menu-items'],
 ['Kitchen','kitchen@hms.local','Kitchen@123','/modules/kitchen-tickets'],
 ['General Manager','gm@hms.local','Manager@123','/dashboard'],
 ['Sales & Events','sales@hms.local','Sales@123','/modules/events'],
 ['Cashier','cashier@hms.local','Cashier@123','/folios'],
 ['System Admin','system@hms.local','System@123','/admin/users'],
];
async function request(path,{method='GET',token,property,body}={}){
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{'X-No-Auth':'1'}),...(property?{'X-Property-Id':property}:{})},body:body?JSON.stringify(body):undefined});
 const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}
 if(!r.ok)throw new Error(`${method} ${path} -> ${r.status}: ${data?.message||text}`);
 return data;
}
(async()=>{
 let passed=0;
 await request('/health');console.log('PASS health');passed++;
 for(const[name,email,password,probe]of accounts){
  const auth=await request('/auth/login',{method:'POST',body:{email,password}});
  const property=auth.user?.properties?.[0]?._id||auth.user?.properties?.[0];
  await request('/auth/me',{token:auth.token,property});
  await request('/dashboard',{token:auth.token,property});
  await request(probe,{token:auth.token,property});
  console.log(`PASS ${name} login + dashboard + ${probe}`);passed++;
 }
 console.log(`\n${passed} V12 runtime role smoke checks passed.`);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
