const router=require('express').Router();
const asyncHandler=require('../utils/asyncHandler');
const {v4:uuid}=require('uuid');
const {Property,Room,RoomType,Guest,Reservation,Folio,HousekeepingTask}=require('../models/core');
const ent=require('../models/enterprise');
function overlap(checkIn,checkOut){return {checkIn:{$lt:checkOut},checkOut:{$gt:checkIn},status:{$nin:['cancelled','no-show','checked-out']}}}
router.get('/properties/:code',asyncHandler(async(req,res)=>{
 const property=await Property.findOne({code:req.params.code,status:'active'}).select('-__v');
 if(!property)return res.status(404).json({message:'Property not found'});
 const roomTypes=await RoomType.find({property:property._id,active:true});
 const [offers,promos,packages]=await Promise.all([ent['upsell-offers'].find({property:property._id,active:true}).limit(20),ent['promo-codes'].find({property:property._id,active:true}).limit(20),ent['hotel-packages'].find({property:property._id,active:true}).limit(20)]);
 res.json({property,roomTypes,offers,promos,packages});
}));
router.get('/properties/:code/availability',asyncHandler(async(req,res)=>{
 const property=await Property.findOne({code:req.params.code,status:'active'});if(!property)return res.status(404).json({message:'Property not found'});
 const checkIn=new Date(req.query.checkIn),checkOut=new Date(req.query.checkOut);if(!(checkIn<checkOut))return res.status(400).json({message:'Valid dates required'});
 const occupied=await Reservation.find({property:property._id,...overlap(checkIn,checkOut)}).distinct('room');
 const rooms=await Room.find({property:property._id,_id:{$nin:occupied},status:{$nin:['Out of Order','Out of Service','Maintenance','Blocked']}}).populate('roomType');
 const byType={}; for(const room of rooms){const id=String(room.roomType._id); if(!byType[id])byType[id]={roomType:room.roomType,count:0,rooms:[]};byType[id].count++;byType[id].rooms.push(room._id)}
 res.json(Object.values(byType));
}));
router.post('/properties/:code/book',asyncHandler(async(req,res)=>{
 const property=await Property.findOne({code:req.params.code,status:'active'});if(!property)return res.status(404).json({message:'Property not found'});
 const checkIn=new Date(req.body.checkIn),checkOut=new Date(req.body.checkOut);if(!(checkIn<checkOut))return res.status(400).json({message:'Valid dates required'});
 if(!req.body.roomType)return res.status(400).json({message:'roomType is required'});
 if(!req.body.guest||!String(req.body.guest.fullName||'').trim()||!String(req.body.guest.phone||'').trim())return res.status(400).json({message:'Guest fullName and phone are required'});
 const requestedRooms=Math.max(1,Math.min(5,Number(req.body.rooms||1)));
 const occupied=await Reservation.find({property:property._id,...overlap(checkIn,checkOut)}).distinct('room');
 const rooms=await Room.find({property:property._id,roomType:req.body.roomType,_id:{$nin:occupied},status:{$nin:['Out of Order','Out of Service','Maintenance','Blocked']}}).populate('roomType').limit(requestedRooms);
 if(rooms.length<requestedRooms)return res.status(409).json({message:`Only ${rooms.length} room(s) available for selected type`});
 let discount=0,promo=null;
 if(req.body.promoCode){promo=await ent['promo-codes'].findOne({property:property._id,code:String(req.body.promoCode).toUpperCase(),active:true});if(!promo)return res.status(400).json({message:'Invalid promo code'});const now=new Date();if((promo.startDate&&now<promo.startDate)||(promo.endDate&&now>promo.endDate))return res.status(400).json({message:'Promo code is not active'});}
 const guest=await Guest.create({organization:property.organization,property:property._id,fullName:req.body.guest.fullName,email:req.body.guest.email,phone:req.body.guest.phone,nationality:req.body.guest.nationality,consents:req.body.guest.consents||{}});
 const nights=Math.max(1,Math.ceil((checkOut-checkIn)/86400000));
 const baseRate=Number(req.body.rate||rooms[0].roomType.baseRate||0);
 const groupId=requestedRooms>1?`GRP-${uuid().slice(0,8).toUpperCase()}`:undefined;
 const taxPercent=Number(req.body.taxPercent??12);
 const complimentaryPromo=!!(promo&&promo.discountType==='percent'&&Number(promo.discountValue||0)>=100);
 const reservations=[];
 const folios=[];
 let subtotal=0,totalTax=0;
 for(let index=0;index<rooms.length;index++){
  const room=rooms[index];
  const rate=baseRate;
  const roomGross=rate*nights;
  let roomDiscount=0;
  if(promo){
   roomDiscount=promo.discountType==='percent'?roomGross*(Number(promo.discountValue||0)/100):Number(promo.discountValue||0)/requestedRooms;
   roomDiscount=Math.min(roomGross,Math.max(0,roomDiscount));
   discount+=roomDiscount;
  }
  const reservation=await Reservation.create({organization:property.organization,property:property._id,confirmationNumber:`${process.env.PUBLIC_BOOKING_PREFIX||'WEB'}-${uuid().slice(0,8).toUpperCase()}`,guest:guest._id,roomType:room.roomType._id,room:room._id,checkIn,checkOut,nights,adults:req.body.adults||1,children:req.body.children||0,ratePlan:req.body.ratePlan||'Best Available Rate',mealPlan:req.body.mealPlan||'Room Only',source:'Direct Booking Engine',status:'confirmed',rate,taxPercent,specialRequests:req.body.specialRequests||[],groupId});
  await Room.findByIdAndUpdate(room._id,{status:'Reserved'});
  const folio=await Folio.create({organization:property.organization,property:property._id,reservation:reservation._id,guest:guest._id,currency:property.currency||'INR'});
  const roomNet=Math.max(0,roomGross-roomDiscount);
  const roomTax=Math.round(roomNet*(taxPercent/100)*100)/100;
  folio.items.push({type:'room',department:'Rooms',description:`Room package ${nights} night(s)`,qty:nights,unitPrice:rate,amount:roomGross,discount:roomDiscount,tax:roomTax});
  subtotal+=roomNet;
  totalTax+=roomTax;
  // Booking-level add-ons are posted once, on the lead reservation folio.
  if(index===0&&req.body.addons?.length){
   for(const a of req.body.addons){
    const qty=Math.max(1,Number(a.qty||1));
    const amount=Number(a.price||0)*qty;
    const addonDiscount=complimentaryPromo?amount:0;
    const addonNet=Math.max(0,amount-addonDiscount);
    const itemTax=complimentaryPromo?0:Math.round(addonNet*(taxPercent/100)*100)/100;
    folio.items.push({type:'upsell',department:'Ancillary',description:a.name||'Add-on',qty,unitPrice:Number(a.price||0),amount,discount:addonDiscount,tax:itemTax});
    discount+=addonDiscount;
    subtotal+=addonNet;
    totalTax+=itemTax;
   }
  }
  await folio.save();
  reservations.push(reservation);
  folios.push(folio);
 }
 const amountDue=Math.round((subtotal+totalTax)*100)/100;
 res.status(201).json({confirmationNumber:reservations[0].confirmationNumber,confirmationNumbers:reservations.map(x=>x.confirmationNumber),reservationIds:reservations.map(x=>x._id),guestId:guest._id,groupId,promoApplied:promo?.code||null,complimentary:amountDue<=0.009,discount,subtotal:Math.round(subtotal*100)/100,tax:Math.round(totalTax*100)/100,amountDue,currency:property.currency||'INR',message:'Booking confirmed'});
}));
router.post('/guest/lookup',asyncHandler(async(req,res)=>{
 const r=await Reservation.findOne({confirmationNumber:req.body.confirmationNumber}).populate('guest room roomType property');if(!r||String(r.guest?.phone||'')!==String(req.body.phone||''))return res.status(404).json({message:'Reservation not found'});const folio=await Folio.findOne({reservation:r._id});res.json({reservation:r,folio});
}));
router.post('/guest/service-request',asyncHandler(async(req,res)=>{
 const r=await Reservation.findOne({confirmationNumber:req.body.confirmationNumber}).populate('guest');if(!r||String(r.guest?.phone||'')!==String(req.body.phone||''))return res.status(404).json({message:'Reservation not found'});const doc=await ent['service-requests'].create({organization:r.organization,property:r.property,guestId:r.guest._id,roomId:r.room,category:req.body.category||'General',priority:req.body.priority||'normal',department:req.body.department||'Front Office',status:'Open',description:req.body.description});res.status(201).json({reference:doc._id,status:doc.status});
}));

router.post('/guest/pre-checkin',asyncHandler(async(req,res)=>{
 const r=await Reservation.findOne({confirmationNumber:req.body.confirmationNumber}).populate('guest');if(!r||String(r.guest?.phone||'')!==String(req.body.phone||''))return res.status(404).json({message:'Reservation not found'});
 Object.assign(r.guest,req.body.guest||{});await r.guest.save();r.accompanyingGuests=req.body.accompanyingGuests||r.accompanyingGuests;r.identityVerified=!!req.body.identityVerified;r.preArrival={completed:true,completedAt:new Date(),signatureName:req.body.signatureName,signatureData:req.body.signatureData,registrationAccepted:!!req.body.registrationAccepted};await r.save();res.json({status:'completed',reservation:r});
}));
router.post('/guest/digital-key',asyncHandler(async(req,res)=>{const r=await Reservation.findOne({confirmationNumber:req.body.confirmationNumber}).populate('guest');if(!r||String(r.guest?.phone||'')!==String(req.body.phone||''))return res.status(404).json({message:'Reservation not found'});if(r.status!=='in-house')return res.status(409).json({message:'Digital key activates after hotel check-in'});res.json(r.digitalKey)}));
router.post('/guest/checkout-request',asyncHandler(async(req,res)=>{const r=await Reservation.findOne({confirmationNumber:req.body.confirmationNumber}).populate('guest');if(!r||String(r.guest?.phone||'')!==String(req.body.phone||''))return res.status(404).json({message:'Reservation not found'});const folio=await Folio.findOne({reservation:r._id});const total=folio?.items.reduce((s,i)=>s+(i.amount||0)+(i.tax||0)-(i.discount||0),0)||0,paid=folio?.payments.reduce((s,p)=>s+(p.amount||0)-(p.refundedAmount||0),0)||0;const balance=total-paid;if(balance>0.01)return res.status(409).json({message:'Please settle folio balance before checkout request',balance});const ticket=await ent['service-requests'].create({organization:r.organization,property:r.property,guestId:r.guest._id,roomId:r.room,category:'Digital Checkout',priority:'high',department:'Front Office',status:'Open',description:'Guest requested digital checkout'});res.status(201).json({status:'requested',reference:ticket._id})}));
router.post('/guest/food-order',asyncHandler(async(req,res)=>{const r=await Reservation.findOne({confirmationNumber:req.body.confirmationNumber}).populate('guest');if(!r||String(r.guest?.phone||'')!==String(req.body.phone||''))return res.status(404).json({message:'Reservation not found'});if(r.status!=='in-house')return res.status(409).json({message:'Room service requires an in-house stay'});const items=Array.isArray(req.body.items)?req.body.items:[];if(!items.length)return res.status(400).json({message:'At least one room-service item is required'});const subtotal=items.reduce((s,i)=>s+Number(i.price||0)*Math.max(1,Number(i.qty||1)),0);const order=await ent['pos-orders'].create({organization:r.organization,property:r.property,roomId:r.room,reservationId:r._id,items,subtotal,total:subtotal,paymentMethod:'Room Charge',status:'received',folioPosted:false});const ticket=await ent['kitchen-tickets'].create({organization:r.organization,property:r.property,orderId:order._id,station:'Room Service',items,priority:'normal',status:'received',receivedAt:new Date()});res.status(201).json({order,ticket})}));
router.post('/guest/spa-book',asyncHandler(async(req,res)=>{const r=await Reservation.findOne({confirmationNumber:req.body.confirmationNumber}).populate('guest');if(!r||String(r.guest?.phone||'')!==String(req.body.phone||''))return res.status(404).json({message:'Reservation not found'});if(!String(req.body.service||'').trim())return res.status(400).json({message:'Spa service is required'});const startAt=new Date(req.body.startAt);if(Number.isNaN(startAt.getTime()))return res.status(400).json({message:'Valid spa start time is required'});const endAt=req.body.endAt?new Date(req.body.endAt):new Date(startAt.getTime()+60*60000);if(Number.isNaN(endAt.getTime())||endAt<=startAt)endAt.setTime(startAt.getTime()+60*60000);const appt=await ent['spa-appointments'].create({organization:r.organization,property:r.property,guestId:r.guest._id,reservationId:r._id,service:req.body.service,therapist:req.body.therapist,startAt,endAt,status:'Booked'});res.status(201).json(appt)}));
module.exports=router;
