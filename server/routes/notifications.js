const router=require('express').Router();const asyncHandler=require('../utils/asyncHandler');const auth=require('../middleware/auth');const tenant=require('../middleware/tenant');const permit=require('../middleware/permit');const {Notification}=require('../models/core');const audit=require('../utils/audit');
router.use(auth,tenant);
router.get('/',permit('modules.notifications.view'),asyncHandler(async(req,res)=>res.json(await Notification.find({...req.organizationFilter,...(req.propertyId?{property:req.propertyId}:{})}).sort({createdAt:-1}).limit(300))));
router.post('/send',permit('modules.notifications.create'),asyncHandler(async(req,res)=>{const n=await Notification.create({...req.body,organization:req.user.organization,property:req.propertyId,status:'queued'});await audit(req,{action:'QUEUE_NOTIFICATION',module:'notifications',entityType:'Notification',entityId:n._id,newValue:n});res.status(201).json(n)}));
module.exports=router;
