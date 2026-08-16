const router=require('express').Router();
const asyncHandler=require('../utils/asyncHandler');
const auth=require('../middleware/auth');
const tenant=require('../middleware/tenant');
const permit=require('../middleware/permit');
const defs=require('../config/enterpriseModules');
const models=require('../models/enterprise');
const audit=require('../utils/audit');
const {scoped,enforceWriteScope}=require('../utils/scope');

router.use(auth,tenant);
router.get('/meta',(req,res)=>res.json(defs));
router.use('/:module',(req,res,next)=>{
  if(!defs[req.params.module])return res.status(404).json({message:'Unknown module'});
  req.Model=models[req.params.module];
  next();
});

router.get('/:module',(req,res,next)=>permit(`modules.${req.params.module}.view`)(req,res,next),asyncHandler(async(req,res)=>{
  const extra={};
  for(const [k,v] of Object.entries(req.query))if(k.startsWith('filter.'))extra[k.slice(7)]=v;
  const globalModules=['plans','feature-flags','subscriptions'];
  const q=globalModules.includes(req.params.module)?scoped(req,extra,{optional:true}):scoped(req,extra);
  const docs=await req.Model.find(q).sort({updatedAt:-1}).limit(Math.min(Number(req.query.limit)||200,500));
  res.json(docs);
}));

router.post('/:module',(req,res,next)=>permit(`modules.${req.params.module}.create`)(req,res,next),asyncHandler(async(req,res)=>{
  const doc=await req.Model.create(enforceWriteScope(req,req.body));
  await audit(req,{action:'CREATE',module:req.params.module,entityType:req.Model.modelName,entityId:doc._id,newValue:doc});
  res.status(201).json(doc);
}));

router.get('/:module/:id',(req,res,next)=>permit(`modules.${req.params.module}.view`)(req,res,next),asyncHandler(async(req,res)=>{
  const doc=await req.Model.findOne(scoped(req,{_id:req.params.id}));
  if(!doc)return res.status(404).json({message:'Not found'});
  res.json(doc);
}));

router.patch('/:module/:id',(req,res,next)=>permit(`modules.${req.params.module}.update`)(req,res,next),asyncHandler(async(req,res)=>{
  const q=scoped(req,{_id:req.params.id});
  const old=await req.Model.findOne(q);
  if(!old)return res.status(404).json({message:'Not found'});
  const update={...req.body};delete update.organization;delete update.property;
  const doc=await req.Model.findOneAndUpdate(q,update,{new:true,runValidators:true});
  await audit(req,{action:'UPDATE',module:req.params.module,entityType:req.Model.modelName,entityId:doc._id,oldValue:old,newValue:doc,reason:req.body.reason});
  res.json(doc);
}));

router.delete('/:module/:id',(req,res,next)=>permit(`modules.${req.params.module}.delete`)(req,res,next),asyncHandler(async(req,res)=>{
  const q=scoped(req,{_id:req.params.id});
  const old=await req.Model.findOneAndDelete(q);
  if(!old)return res.status(404).json({message:'Not found'});
  await audit(req,{action:'DELETE',module:req.params.module,entityType:req.Model.modelName,entityId:old._id,oldValue:old});
  res.json({ok:true});
}));
module.exports=router;
