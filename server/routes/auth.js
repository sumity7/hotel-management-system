const router=require('express').Router();
const jwt=require('jsonwebtoken');
const asyncHandler=require('../utils/asyncHandler');
const auth=require('../middleware/auth');
const {User,Organization,Property}=require('../models/core');
const roleGrants=require('../config/roles');

function sign(u){return jwt.sign({id:u._id,role:u.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'12h'})}
function withGrants(user){const obj=user?.toObject?user.toObject():user;return{...obj,grants:[...(roleGrants[obj?.role]||[]),...(obj?.permissions||[])]}}

router.post('/login',asyncHandler(async(req,res)=>{
 const u=await User.findOne({email:String(req.body.email||'').toLowerCase()}).select('+password');
 if(!u||!(await u.comparePassword(req.body.password||'')))return res.status(401).json({message:'Invalid email or password'});
 u.lastLogin=new Date();await u.save();
 const safe=await User.findById(u._id).populate('properties','name code');
 res.json({token:sign(u),user:withGrants(safe)});
}));

router.get('/me',auth,asyncHandler(async(req,res)=>{
 const user=await User.findById(req.user._id).populate('organization').populate('properties');
 res.json({user:withGrants(user)});
}));

router.post('/bootstrap',asyncHandler(async(req,res)=>{
 if(await User.countDocuments())return res.status(409).json({message:'System already bootstrapped'});
 const org=await Organization.create({name:req.body.organizationName||process.env.SEED_ORGANIZATION_NAME||'Demo Hospitality Group',code:req.body.organizationCode||process.env.SEED_ORGANIZATION_CODE||'HMS'});
 const prop=await Property.create({organization:org._id,name:req.body.propertyName||process.env.SEED_PROPERTY_NAME||'Demo Hotel',code:req.body.propertyCode||process.env.SEED_PROPERTY_CODE||'HTL001',city:req.body.city||process.env.SEED_CITY||'Demo City',state:req.body.state||process.env.SEED_STATE||'',country:req.body.country||process.env.SEED_COUNTRY||'India'});
 const user=await User.create({organization:org._id,properties:[prop._id],name:req.body.name||'Platform Admin',email:req.body.email||process.env.SEED_ADMIN_EMAIL||'admin@hms.local',password:req.body.password||process.env.SEED_ADMIN_PASSWORD||'Admin@123',role:'saas_super_admin'});
 res.status(201).json({token:sign(user),user:withGrants(user)});
}));

module.exports=router;
