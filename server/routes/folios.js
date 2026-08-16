const router=require('express').Router();
const asyncHandler=require('../utils/asyncHandler');
const auth=require('../middleware/auth');
const tenant=require('../middleware/tenant');
const permit=require('../middleware/permit');
const {Folio}=require('../models/core');
const audit=require('../utils/audit');
const {scoped}=require('../utils/scope');
router.use(auth,tenant);
router.get('/',permit('folios.view'),asyncHandler(async(req,res)=>res.json(await Folio.find(scoped(req)).populate({path:'reservation',populate:{path:'guest room'}}).sort({updatedAt:-1}))));
router.get('/:id',permit('folios.view'),asyncHandler(async(req,res)=>{const f=await Folio.findOne(scoped(req,{_id:req.params.id})).populate({path:'reservation',populate:{path:'guest room'}});if(!f)return res.status(404).json({message:'Not found'});res.json(f)}));
router.post('/:id/items',permit('folios.*'),asyncHandler(async(req,res)=>{const f=await Folio.findOne(scoped(req,{_id:req.params.id}));if(!f)return res.status(404).json({message:'Folio not found'});f.items.push(req.body);await f.save();await audit(req,{action:'POST_CHARGE',module:'folio',entityType:'Folio',entityId:f._id,newValue:req.body});res.status(201).json(f)}));
router.post('/:id/payments',permit('folios.*'),asyncHandler(async(req,res)=>{
 const f=await Folio.findOne(scoped(req,{_id:req.params.id}));if(!f)return res.status(404).json({message:'Folio not found'});
 const amount=Number(req.body.amount||0);if(!(amount>0))return res.status(400).json({message:'Payment amount must be greater than zero'});
 const charges=(f.items||[]).reduce((s,i)=>s+Number(i.amount||0)+Number(i.tax||0)-Number(i.discount||0),0);
 const paid=(f.payments||[]).reduce((s,p)=>s+Number(p.amount||0)-Number(p.refundedAmount||0),0);
 const balance=charges-paid;const kind=req.body.kind||'settlement';
 if(kind==='settlement'&&balance<=0)return res.status(409).json({message:'No outstanding balance. Use Advance / Deposit for a prepayment.'});
 if(kind==='settlement'&&amount>balance+0.01)return res.status(409).json({message:`Settlement exceeds outstanding balance ${balance.toFixed(2)}. Use Advance / Deposit for excess prepayment.`});
 const payment={method:req.body.method||'Cash',kind,amount,currency:req.body.currency||f.currency||'INR',reference:req.body.reference||'',status:'captured',paidAt:new Date()};
 f.payments.push(payment);await f.save();await audit(req,{action:kind==='advance'?'ADVANCE_PAYMENT':'PAYMENT',module:'folio',entityType:'Folio',entityId:f._id,newValue:payment});res.status(201).json(f);
}));
router.post('/:id/refunds',permit('folios.*'),asyncHandler(async(req,res)=>{const f=await Folio.findOne(scoped(req,{_id:req.params.id}));if(!f)return res.status(404).json({message:'Folio not found'});const p=f.payments.id(req.body.paymentId);if(!p)return res.status(404).json({message:'Payment not found'});const amount=Number(req.body.amount||0);if(amount<=0)return res.status(400).json({message:'Refund amount must be greater than zero'});if((p.refundedAmount||0)+amount>(p.amount||0))return res.status(409).json({message:'Refund exceeds captured payment'});p.refundedAmount=(p.refundedAmount||0)+amount;await f.save();await audit(req,{action:'REFUND',module:'folio',entityType:'Folio',entityId:f._id,newValue:req.body,reason:req.body.reason});res.json(f)}));
router.post('/:id/credit-notes',permit('folios.*'),asyncHandler(async(req,res)=>{const f=await Folio.findOne(scoped(req,{_id:req.params.id}));if(!f)return res.status(404).json({message:'Folio not found'});f.creditNotes.push({amount:req.body.amount,reason:req.body.reason,date:new Date()});await f.save();await audit(req,{action:'CREDIT_NOTE',module:'folio',entityType:'Folio',entityId:f._id,newValue:req.body,reason:req.body.reason});res.json(f)}));

router.post('/:id/split-folio',permit('folios.*'),asyncHandler(async(req,res)=>{
 const f=await Folio.findOne(scoped(req,{_id:req.params.id}));if(!f)return res.status(404).json({message:'Folio not found'});
 const itemIds=(req.body.itemIds||[]).map(String);if(!itemIds.length)return res.status(400).json({message:'Select at least one folio item'});
 const valid=f.items.filter(i=>itemIds.includes(String(i._id))).map(i=>i._id);if(!valid.length)return res.status(400).json({message:'No valid items selected'});
 f.subFolios.push({name:req.body.name||`Split ${f.subFolios.length+1}`,itemIds:valid,payerType:req.body.payerType||'guest',payerName:req.body.payerName||'',status:'open'});await f.save();
 await audit(req,{action:'SPLIT_FOLIO',module:'folio',entityType:'Folio',entityId:f._id,newValue:req.body});res.status(201).json(f);
}));
router.post('/:id/routing-rules',permit('folios.*'),asyncHandler(async(req,res)=>{
 const f=await Folio.findOne(scoped(req,{_id:req.params.id}));if(!f)return res.status(404).json({message:'Folio not found'});f.routingRules.push({department:req.body.department,target:req.body.target});await f.save();await audit(req,{action:'ROUTING_RULE',module:'folio',entityType:'Folio',entityId:f._id,newValue:req.body});res.json(f);
}));
router.post('/:id/invoice',permit('folios.*'),asyncHandler(async(req,res)=>{
 const f=await Folio.findOne(scoped(req,{_id:req.params.id}));if(!f)return res.status(404).json({message:'Folio not found'});f.invoiceNumber=f.invoiceNumber||`INV-${Date.now().toString().slice(-8)}`;f.invoiceEmail=req.body.email||f.invoiceEmail;await f.save();await audit(req,{action:'INVOICE',module:'folio',entityType:'Folio',entityId:f._id,newValue:{invoiceNumber:f.invoiceNumber,email:f.invoiceEmail}});res.json({invoiceNumber:f.invoiceNumber,email:f.invoiceEmail,status:'generated'});
}));
module.exports=router;
