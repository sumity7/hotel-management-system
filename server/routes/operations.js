const router=require('express').Router();
const asyncHandler=require('../utils/asyncHandler');
const auth=require('../middleware/auth');
const tenant=require('../middleware/tenant');
const permit=require('../middleware/permit');
const ent=require('../models/enterprise');
const {Folio,Room,Reservation}=require('../models/core');
const audit=require('../utils/audit');
router.use(auth,tenant);
const scope=(req,extra={})=>({...req.organizationFilter,...(req.propertyId?{property:req.propertyId}:{}),...extra});
const get=(req,key,id)=>ent[key].findOne(scope(req,{_id:id}));

router.post('/laundry/:id/status',permit('modules.laundry-orders.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'laundry-orders',req.params.id);if(!doc)return res.status(404).json({message:'Laundry order not found'});
 const allowed=['Received','Washing','Drying','Ironing','Ready','Delivered'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid laundry status'});
 doc.status=req.body.status;
 if(doc.status==='Delivered'&&!doc.folioPosted&&doc.reservationId&&Number(doc.total||0)>0){const folio=await Folio.findOne(scope(req,{reservation:doc.reservationId}));if(folio){folio.items.push({type:'laundry',department:'Laundry',description:`Guest laundry ${doc._id.toString().slice(-6)}`,qty:1,unitPrice:Number(doc.total),amount:Number(doc.total),sourceRef:String(doc._id)});await folio.save();doc.folioPosted=true}}
 await doc.save();await audit(req,{action:'LAUNDRY_STATUS',module:'laundry-orders',entityType:'LaundryOrder',entityId:doc._id,newValue:{status:doc.status,folioPosted:doc.folioPosted}});res.json(doc);
}));

router.post('/minibar/:id/post',permit('modules.minibar-entries.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'minibar-entries',req.params.id);if(!doc)return res.status(404).json({message:'Minibar entry not found'});if(doc.folioPosted)return res.status(409).json({message:'Minibar charge already posted'});if(!doc.reservationId)return res.status(400).json({message:'reservationId is required'});
 const folio=await Folio.findOne(scope(req,{reservation:doc.reservationId}));if(!folio)return res.status(404).json({message:'Folio not found'});
 folio.items.push({type:'minibar',department:'Minibar',description:`Minibar ${doc._id.toString().slice(-6)}`,qty:1,unitPrice:Number(doc.amount||0),amount:Number(doc.amount||0),sourceRef:String(doc._id)});await folio.save();doc.folioPosted=true;doc.stockDeducted=true;await doc.save();await audit(req,{action:'MINIBAR_POST',module:'minibar-entries',entityType:'MinibarEntry',entityId:doc._id});res.json(doc);
}));

router.post('/spa/:id/status',permit('modules.spa-appointments.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'spa-appointments',req.params.id);if(!doc)return res.status(404).json({message:'Spa appointment not found'});const allowed=['Booked','Confirmed','In Progress','Completed','Cancelled','No Show'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid spa status'});doc.status=req.body.status;
 if(doc.status==='Completed'&&!doc.folioPosted&&doc.reservationId&&Number(doc.price||0)>0){const folio=await Folio.findOne(scope(req,{reservation:doc.reservationId}));if(folio){folio.items.push({type:'spa',department:'Spa',description:doc.service||'Spa service',qty:1,unitPrice:Number(doc.price),amount:Number(doc.price),sourceRef:String(doc._id)});await folio.save();doc.folioPosted=true}}
 await doc.save();await audit(req,{action:'SPA_STATUS',module:'spa-appointments',entityType:'SpaAppointment',entityId:doc._id,newValue:{status:doc.status,folioPosted:doc.folioPosted}});res.json(doc);
}));

router.post('/transport/:id/status',permit('modules.transport-requests.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'transport-requests',req.params.id);if(!doc)return res.status(404).json({message:'Transport request not found'});const allowed=['Requested','Assigned','Dispatched','Picked Up','Completed','Cancelled'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid transport status'});doc.status=req.body.status;
 if(doc.status==='Completed'&&!doc.folioPosted&&doc.reservationId&&Number(doc.cost||0)>0){const folio=await Folio.findOne(scope(req,{reservation:doc.reservationId}));if(folio){folio.items.push({type:'transport',department:'Transport',description:doc.type||'Transport service',qty:1,unitPrice:Number(doc.cost),amount:Number(doc.cost),sourceRef:String(doc._id)});await folio.save();doc.folioPosted=true}}
 await doc.save();await audit(req,{action:'TRANSPORT_STATUS',module:'transport-requests',entityType:'TransportRequest',entityId:doc._id,newValue:{status:doc.status,folioPosted:doc.folioPosted}});res.json(doc);
}));

router.post('/maintenance/:id/status',permit('modules.maintenance-work-orders.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'maintenance-work-orders',req.params.id);if(!doc)return res.status(404).json({message:'Maintenance work order not found'});const allowed=['Open','Assigned','In Progress','On Hold','Completed','Verified'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid maintenance status'});doc.status=req.body.status;if(req.body.resolution)doc.resolution=req.body.resolution;
 if(doc.roomId&&doc.roomOutOfOrder&&['Open','Assigned','In Progress','On Hold'].includes(doc.status))await Room.findOneAndUpdate(scope(req,{_id:doc.roomId}),{status:'Out of Order',statusReason:doc.description||'Maintenance'});
 if(doc.roomId&&['Completed','Verified'].includes(doc.status))await Room.findOneAndUpdate(scope(req,{_id:doc.roomId}),{status:'Vacant Dirty',statusReason:''});
 await doc.save();await audit(req,{action:'MAINTENANCE_STATUS',module:'maintenance-work-orders',entityType:'MaintenanceWorkOrder',entityId:doc._id,newValue:{status:doc.status,resolution:doc.resolution}});res.json(doc);
}));

router.post('/lost-found/:id/status',permit('modules.lost-found.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'lost-found',req.params.id);if(!doc)return res.status(404).json({message:'Lost & Found item not found'});const allowed=['Found','Stored','Guest Contacted','Returned','Disposed'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid status'});doc.status=req.body.status;if(req.body.notes)doc.notes=req.body.notes;await doc.save();await audit(req,{action:'LOST_FOUND_STATUS',module:'lost-found',entityType:'LostFound',entityId:doc._id,newValue:{status:doc.status}});res.json(doc);
}));

router.post('/attendance/punch',permit('modules.attendance.create'),asyncHandler(async(req,res)=>{
 const M=ent['attendance'];const employeeId=req.body.employeeId;if(!employeeId)return res.status(400).json({message:'employeeId is required'});const now=new Date();const start=new Date(now);start.setHours(0,0,0,0);const end=new Date(start.getTime()+86400000);let doc=await M.findOne(scope(req,{employeeId,date:{$gte:start,$lt:end}}));
 if(!doc){doc=await M.create({...scope(req),employeeId,date:start,checkIn:now,status:'Present',source:req.body.source||'manual'});await audit(req,{action:'ATTENDANCE_IN',module:'attendance',entityType:'Attendance',entityId:doc._id});return res.status(201).json(doc)}
 if(doc.checkOut)return res.status(409).json({message:'Attendance already checked out for today'});doc.checkOut=now;const minutes=Math.max(0,Math.round((doc.checkOut-doc.checkIn)/60000)-480);doc.overtimeMinutes=minutes;await doc.save();await audit(req,{action:'ATTENDANCE_OUT',module:'attendance',entityType:'Attendance',entityId:doc._id});res.json(doc);
}));


router.post('/inventory/:id/adjust',permit('modules.inventory-items.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'inventory-items',req.params.id);if(!doc)return res.status(404).json({message:'Inventory item not found'});const qty=Number(req.body.qty||0);if(!qty)return res.status(400).json({message:'Non-zero qty is required'});const before=Number(doc.qtyOnHand||0);const after=before+qty;if(after<0)return res.status(409).json({message:'Insufficient stock'});doc.qtyOnHand=after;await doc.save();await ent['stock-transactions'].create({...scope(req),itemId:doc._id,type:req.body.type||'adjustment',qty,fromStore:req.body.fromStore,toStore:req.body.toStore,reference:req.body.reference,unitCost:Number(req.body.unitCost||doc.averageCost||0)});await audit(req,{action:'STOCK_ADJUST',module:'inventory-items',entityType:'InventoryItem',entityId:doc._id,oldValue:{qtyOnHand:before},newValue:{qtyOnHand:after}});res.json(doc);
}));

router.post('/cashier/:id/close',permit('modules.cashier-shifts.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'cashier-shifts',req.params.id);if(!doc)return res.status(404).json({message:'Cashier shift not found'});if(doc.status==='Closed')return res.status(409).json({message:'Shift already closed'});doc.expectedCash=Number(doc.openingBalance||0)+Number(doc.cashReceipts||0)-Number(doc.refunds||0)-Number(doc.paidOuts||0);doc.actualCash=Number(req.body.actualCash||0);doc.variance=Number((doc.actualCash-doc.expectedCash).toFixed(2));doc.closedAt=new Date();doc.status=Math.abs(doc.variance)>0.01?'Variance Review':'Closed';await doc.save();await audit(req,{action:'CASHIER_CLOSE',module:'cashier-shifts',entityType:'CashierShift',entityId:doc._id,newValue:{expectedCash:doc.expectedCash,actualCash:doc.actualCash,variance:doc.variance,status:doc.status}});res.json(doc);
}));

router.post('/preventive/:id/generate-work-order',permit('modules.preventive-maintenance.update'),asyncHandler(async(req,res)=>{
 const pm=await get(req,'preventive-maintenance',req.params.id);if(!pm)return res.status(404).json({message:'Preventive maintenance plan not found'});const wo=await ent['maintenance-work-orders'].create({...scope(req),assetId:pm.assetId,category:pm.category,priority:req.body.priority||'normal',targetAt:pm.nextDue,status:'Open',description:`Preventive maintenance: ${pm.category||'Scheduled service'}`});const interval=Math.max(1,Number(pm.interval||30));const next=new Date(pm.nextDue||Date.now());next.setDate(next.getDate()+interval);pm.nextDue=next;pm.status='Scheduled';await pm.save();await audit(req,{action:'PM_WORK_ORDER',module:'preventive-maintenance',entityType:'MaintenanceWorkOrder',entityId:wo._id,newValue:{planId:pm._id}});res.status(201).json({plan:pm,workOrder:wo});
}));

router.post('/event/:id/status',permit('modules.events.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'events',req.params.id);if(!doc)return res.status(404).json({message:'Event not found'});const allowed=['Inquiry','Tentative','Confirmed','BEO Issued','In Progress','Completed','Cancelled'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid event status'});if(req.body.status==='BEO Issued'&&!doc.beo)return res.status(409).json({message:'BEO details are required before issuing BEO'});doc.status=req.body.status;await doc.save();await audit(req,{action:'EVENT_STATUS',module:'events',entityType:'Event',entityId:doc._id,newValue:{status:doc.status}});res.json(doc);
}));

router.post('/incident/:id/status',permit('modules.incidents.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'incidents',req.params.id);if(!doc)return res.status(404).json({message:'Incident not found'});const allowed=['Open','Investigating','Action Required','Resolved','Closed'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid incident status'});if(['Resolved','Closed'].includes(req.body.status)&&!req.body.outcome&&!doc.outcome)return res.status(400).json({message:'Outcome is required to resolve an incident'});doc.status=req.body.status;if(req.body.outcome)doc.outcome=req.body.outcome;if(req.body.actions)doc.actions=req.body.actions;await doc.save();await audit(req,{action:'INCIDENT_STATUS',module:'incidents',entityType:'Incident',entityId:doc._id,newValue:{status:doc.status,outcome:doc.outcome}});res.json(doc);
}));

router.post('/shift/:id/approve',permit('modules.shifts.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'shifts',req.params.id);if(!doc)return res.status(404).json({message:'Shift not found'});doc.status='Approved';doc.approvedBy=req.user._id;await doc.save();await audit(req,{action:'SHIFT_APPROVE',module:'shifts',entityType:'Shift',entityId:doc._id});res.json(doc);
}));

router.post('/integration/:id/test',permit('modules.integrations.update'),asyncHandler(async(req,res)=>{
 const doc=await get(req,'integrations',req.params.id);if(!doc)return res.status(404).json({message:'Integration not found'});const configured=!!doc.provider;doc.status=configured?'adapter-ready':'configuration-required';doc.lastSuccess=configured?new Date():doc.lastSuccess;doc.lastError=configured?'':'Provider configuration is missing';doc.retryCount=0;await doc.save();await audit(req,{action:'INTEGRATION_TEST',module:'integrations',entityType:'Integration',entityId:doc._id,newValue:{status:doc.status}});res.json({integration:doc,liveVendorCall:false,message:'Adapter validation completed. Live vendor calls require provider credentials/certification.'});
}));

router.post('/forecast/generate',permit('modules.forecasts.create'),asyncHandler(async(req,res)=>{
 if(!req.propertyId)return res.status(400).json({message:'Property context required'});const M=ent['forecasts'];const days=Math.min(Math.max(Number(req.body.days||14),1),90);const totalRooms=await Room.countDocuments(scope(req));const created=[];
 for(let i=1;i<=days;i++){const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()+i);const end=new Date(start.getTime()+86400000);const booked=await Reservation.countDocuments(scope(req,{checkIn:{$lt:end},checkOut:{$gt:start},status:{$nin:['cancelled','no-show','checked-out']}}));const occ=totalRooms?Number((booked/totalRooms*100).toFixed(1)):0;const avgRate=Number(req.body.averageRate||3500);const payload={...scope(req),date:start,roomDemand:booked,occupancyPercent:occ,roomRevenue:Number((booked*avgRate).toFixed(2)),staffingNeed:Math.ceil(booked/8),fnbDemand:Math.ceil(booked*1.5),model:'rule-statistical-v1',scenario:req.body.scenario||'Base'};created.push(await M.findOneAndUpdate(scope(req,{date:start}),payload,{new:true,upsert:true,setDefaultsOnInsert:true}))}
 await audit(req,{action:'FORECAST_GENERATE',module:'forecasts',entityType:'Forecast',newValue:{days,model:'rule-statistical-v1'}});res.json(created);
}));
module.exports=router;
