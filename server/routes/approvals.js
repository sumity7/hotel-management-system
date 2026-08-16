const router=require('express').Router();
const asyncHandler=require('../utils/asyncHandler');
const auth=require('../middleware/auth');
const tenant=require('../middleware/tenant');
const permit=require('../middleware/permit');
const {ApprovalRequest}=require('../models/core');
const ent=require('../models/enterprise');
const audit=require('../utils/audit');
const {scoped,enforceWriteScope}=require('../utils/scope');

router.use(auth,tenant);

router.get('/',permit('approvals.view'),asyncHandler(async(req,res)=>{
  res.json(await ApprovalRequest.find(scoped(req)).populate('requestedBy assignedTo decidedBy').sort({createdAt:-1}));
}));

router.post('/',permit('approvals.*'),asyncHandler(async(req,res)=>{
  res.status(201).json(await ApprovalRequest.create({...enforceWriteScope(req,req.body),requestedBy:req.user._id}));
}));

router.post('/:id/decision',permit('approvals.*'),asyncHandler(async(req,res)=>{
  if(!['approved','rejected'].includes(req.body.status))return res.status(400).json({message:'Decision must be approved or rejected'});
  const x=await ApprovalRequest.findOne(scoped(req,{_id:req.params.id}));
  if(!x)return res.status(404).json({message:'Not found'});
  if(x.status!=='pending')return res.status(409).json({message:'This approval has already been decided'});

  x.status=req.body.status;
  x.decisionReason=req.body.reason||'';
  x.decidedBy=req.user._id;
  x.decidedAt=new Date();
  await x.save();

  if(x.referenceType==='PurchaseRequest'&&x.referenceId){
    const pr=await ent['purchase-requests'].findOne(scoped(req,{_id:x.referenceId}));
    if(pr){
      pr.status=req.body.status==='approved'?'Approved':'Rejected';
      await pr.save();
    }
  }

  await audit(req,{action:`APPROVAL_${x.status.toUpperCase()}`,module:'approvals',entityType:'ApprovalRequest',entityId:x._id,newValue:x,reason:req.body.reason});
  res.json(x);
}));

module.exports=router;
