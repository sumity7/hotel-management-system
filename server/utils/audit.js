const {AuditLog}=require('../models/core');
module.exports=async function audit(req,{action,module,entityType,entityId,oldValue,newValue,reason}){
 try{await AuditLog.create({organization:req.user?.organization,property:req.propertyId||req.body?.property,user:req.user?._id,action,module,entityType,entityId:String(entityId||''),oldValue,newValue,reason,ip:req.ip,userAgent:req.headers['user-agent']});}catch(e){console.error('Audit failed',e.message)}
}
