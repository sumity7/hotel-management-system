const router=require('express').Router();
const asyncHandler=require('../utils/asyncHandler');
const auth=require('../middleware/auth');
const authorize=require('../middleware/authorize');
const {Organization,Brand,Region,Property,Building,Floor,User}=require('../models/core');
router.use(auth);

router.get('/properties',asyncHandler(async(req,res)=>{
  const q=req.user.role==='saas_super_admin'?{}:{organization:req.user.organization};
  res.json(await Property.find(q).populate('brand region'));
}));
router.post('/properties',authorize('saas_super_admin','system_admin'),asyncHandler(async(req,res)=>{
  const organization=req.user.role==='saas_super_admin'?(req.body.organization||req.user.organization):req.user.organization;
  res.status(201).json(await Property.create({...req.body,organization}));
}));
router.get('/users',authorize('saas_super_admin','system_admin','general_manager'),asyncHandler(async(req,res)=>{
  const q=req.user.role==='saas_super_admin'?{}:{organization:req.user.organization};
  res.json(await User.find(q).populate('properties','name code'));
}));
router.post('/users',authorize('saas_super_admin','system_admin','general_manager'),asyncHandler(async(req,res)=>{
  const organization=req.user.role==='saas_super_admin'?(req.body.organization||req.user.organization):req.user.organization;
  const allowedProps=req.user.role==='saas_super_admin'?req.body.properties:(req.body.properties||[]);
  if(req.user.role!=='saas_super_admin'&&allowedProps.length){
    const count=await Property.countDocuments({_id:{$in:allowedProps},organization:req.user.organization});
    if(count!==allowedProps.length)return res.status(403).json({message:'One or more properties are outside your organization'});
  }
  res.status(201).json(await User.create({...req.body,organization,properties:allowedProps}));
}));
router.patch('/users/:id',authorize('saas_super_admin','system_admin','general_manager'),asyncHandler(async(req,res)=>{
  const q=req.user.role==='saas_super_admin'?{_id:req.params.id}:{_id:req.params.id,organization:req.user.organization};
  const user=await User.findOne(q).select('+password');
  if(!user)return res.status(404).json({message:'User not found'});
  const blocked=['organization','_id'];for(const k of blocked)delete req.body[k];
  Object.assign(user,req.body);await user.save();
  const safe=await User.findById(user._id).populate('properties','name code');res.json(safe);
}));
router.get('/organizations',authorize('saas_super_admin'),asyncHandler(async(req,res)=>res.json(await Organization.find())));
router.post('/organizations',authorize('saas_super_admin'),asyncHandler(async(req,res)=>res.status(201).json(await Organization.create(req.body))));
router.get('/structure',asyncHandler(async(req,res)=>{
  const organization=req.user.role==='saas_super_admin'?req.query.organization:req.user.organization;
  if(!organization)return res.status(400).json({message:'Organization is required'});
  const [brands,regions,properties,buildings,floors]=await Promise.all([Brand.find({organization}),Region.find({organization}),Property.find({organization}),Building.find({organization}),Floor.find({organization})]);
  res.json({brands,regions,properties,buildings,floors});
}));
module.exports=router;
