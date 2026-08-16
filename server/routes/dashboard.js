const router=require('express').Router();
const asyncHandler=require('../utils/asyncHandler');
const auth=require('../middleware/auth');
const tenant=require('../middleware/tenant');
const permit=require('../middleware/permit');
const {Room,Reservation,Folio,HousekeepingTask,Guest}=require('../models/core');

router.use(auth,tenant);

router.get('/',permit('dashboard.view'),asyncHandler(async(req,res)=>{
  if(!req.propertyId)return res.status(400).json({message:'Property context required'});
  const base={...req.organizationFilter,property:req.propertyId};
  const now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const end=new Date(start.getTime()+86400000);

  const[rooms,reservations,folios,hk,guests]=await Promise.all([
    Room.find(base),
    Reservation.find(base),
    Folio.find(base),
    HousekeepingTask.find({...base,status:{$nin:['Inspected']}}),
    Guest.countDocuments(base)
  ]);

  const statusCounts={};
  rooms.forEach(r=>{statusCounts[r.status]=(statusCounts[r.status]||0)+1});
  const todayArrivals=reservations.filter(r=>r.checkIn>=start&&r.checkIn<end&&['confirmed','guaranteed','walk-in','corporate','travel-agent'].includes(r.status)).length;
  const todayDepartures=reservations.filter(r=>r.checkOut>=start&&r.checkOut<end&&r.status==='in-house').length;
  const inHouse=reservations.filter(r=>r.status==='in-house').length;

  const revenue={room:0,pos:0,spa:0,laundry:0,misc:0,total:0,outstanding:0};
  folios.forEach(f=>{
    let charges=0;
    (f.items||[]).forEach(i=>{
      const val=Number(i.amount||0)+Number(i.tax||0)-Number(i.discount||0);
      charges+=val;
      revenue.total+=val;
      const department=String(i.department||'').toLowerCase();
      const type=String(i.type||'').toLowerCase();
      if(department==='rooms'||type==='room')revenue.room+=val;
      else if(department.includes('f&b')||type==='fnb'||type==='pos')revenue.pos+=val;
      else if(department.includes('spa')||type==='spa')revenue.spa+=val;
      else if(department.includes('laundry')||type==='laundry')revenue.laundry+=val;
      else revenue.misc+=val;
    });
    const paid=(f.payments||[]).reduce((a,x)=>a+Number(x.amount||0)-Number(x.refundedAmount||0),0);
    revenue.outstanding+=Math.max(0,charges-paid);
  });

  const occupied=rooms.filter(r=>String(r.status).startsWith('Occupied')).length;
  const reserved=rooms.filter(r=>r.status==='Reserved').length;
  const available=rooms.filter(r=>['Vacant Clean','Inspected'].includes(r.status)).length;
  const occupancy=rooms.length?occupied/rooms.length*100:0;
  const adr=occupied?revenue.room/occupied:0;
  const revpar=rooms.length?revenue.room/rooms.length:0;

  res.json({
    role:req.user.role,
    rooms:{total:rooms.length,status:statusCounts,occupied,reserved,available},
    today:{
      arrivals:todayArrivals,
      departures:todayDepartures,
      inHouse,
      noShows:reservations.filter(r=>r.status==='no-show'&&r.updatedAt>=start).length,
      walkIns:reservations.filter(r=>r.status==='walk-in'&&r.createdAt>=start).length
    },
    revenue,
    kpis:{
      occupancy:Number(occupancy.toFixed(1)),
      adr:Number(adr.toFixed(2)),
      revpar:Number(revpar.toFixed(2)),
      goppar:null,
      trevpar:rooms.length?Number((revenue.total/rooms.length).toFixed(2)):0
    },
    operations:{housekeepingOpen:hk.length,totalGuests:guests}
  });
}));

module.exports=router;
