const router=require('express').Router();
const crypto=require('crypto');
const asyncHandler=require('../utils/asyncHandler');
const {Property,Reservation,Folio}=require('../models/core');
const {v4:uuid}=require('uuid');

function razorConfigured(){return Boolean(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET)}
async function createRazorpayOrder({amount,currency='INR',receipt}){
 const auth=Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
 const response=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify({amount:Math.round(Number(amount)*100),currency,receipt,payment_capture:1})});
 const data=await response.json(); if(!response.ok)throw new Error(data?.error?.description||'Razorpay order creation failed'); return data;
}
router.post('/create-order',asyncHandler(async(req,res)=>{
 const {propertyCode,amount,currency='INR',receipt}=req.body;if(!propertyCode||!(Number(amount)>0))return res.status(400).json({message:'propertyCode and positive amount are required'});
 const property=await Property.findOne({code:propertyCode,status:'active'});if(!property)return res.status(404).json({message:'Property not found'});
 if(razorConfigured()){
  const order=await createRazorpayOrder({amount,currency,receipt:receipt||`HMS-${Date.now()}`});
  return res.json({provider:'razorpay',keyId:process.env.RAZORPAY_KEY_ID,orderId:order.id,amount:order.amount,currency:order.currency,receipt:order.receipt});
 }
 const orderId=`order_mock_${uuid().replaceAll('-','').slice(0,18)}`;res.json({provider:'mock',orderId,amount:Math.round(Number(amount)*100),currency,keyId:'mock',receipt:receipt||`MOCK-${Date.now()}`,message:'Mock payment order created because Razorpay credentials are not configured.'});
}));
router.post('/capture',asyncHandler(async(req,res)=>{
 const {confirmationNumber,confirmationNumbers,phone,orderId,paymentId,signature,amount,currency='INR',method='Online'}=req.body;
 const confirmations=[...new Set((Array.isArray(confirmationNumbers)&&confirmationNumbers.length?confirmationNumbers:[confirmationNumber]).filter(Boolean).map(String))];
 if(!confirmations.length)return res.status(400).json({message:'confirmationNumber is required'});
 const reservations=await Reservation.find({confirmationNumber:{$in:confirmations}}).populate('guest');
 if(reservations.length!==confirmations.length||reservations.some(r=>String(r.guest?.phone||'')!==String(phone||'')))return res.status(404).json({message:'Reservation not found'});
 const folios=await Folio.find({reservation:{$in:reservations.map(r=>r._id)}});
 if(folios.length!==reservations.length)return res.status(404).json({message:'Folio not found'});
 let verified=false,provider='mock';
 if(orderId?.startsWith('order_mock_')){verified=signature==='mock_signature'||paymentId?.startsWith('pay_mock_');provider='mock'}
 else if(razorConfigured()&&orderId&&paymentId&&signature){const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');const a=Buffer.from(expected);const b=Buffer.from(String(signature));verified=a.length===b.length&&crypto.timingSafeEqual(a,b);provider='razorpay'}
 if(!verified)return res.status(400).json({message:'Payment verification failed'});
 const numericAmount=Number(amount);if(!(numericAmount>0))return res.status(400).json({message:'Positive payment amount required'});
 const reference=paymentId||orderId;
 const existing=folios.flatMap(f=>(f.payments||[]).filter(p=>String(p.reference||'')===String(reference)));
 if(existing.length)return res.json({ok:true,provider,reference,amount:existing.reduce((s,p)=>s+Number(p.amount||0),0),currency:existing[0]?.currency||currency,folioIds:folios.map(f=>f._id),idempotent:true});
 const balances=folios.map(f=>{const charges=(f.items||[]).reduce((s,i)=>s+Number(i.amount||0)+Number(i.tax||0)-Number(i.discount||0),0);const paid=(f.payments||[]).reduce((s,p)=>s+Number(p.amount||0)-Number(p.refundedAmount||0),0);return Math.max(0,Math.round((charges-paid)*100)/100)});
 const aggregateBalance=Math.round(balances.reduce((s,b)=>s+b,0)*100)/100;
 if(numericAmount>aggregateBalance+0.01)return res.status(409).json({message:'Payment exceeds outstanding folio balance',balance:aggregateBalance});
 let remaining=Math.round(numericAmount*100)/100;
 for(let i=0;i<folios.length&&remaining>0.001;i++){
  const allocation=Math.min(balances[i],remaining);
  if(allocation>0){folios[i].payments.push({method,kind:'settlement',amount:allocation,currency,reference,status:'captured',paidAt:new Date()});await folios[i].save();remaining=Math.round((remaining-allocation)*100)/100;}
 }
 res.json({ok:true,provider,reference,amount:numericAmount,currency,folioIds:folios.map(f=>f._id),allocatedAcross:folios.length,balanceBefore:aggregateBalance});
}));
module.exports=router;
