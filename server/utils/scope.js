function orgFilter(req){
  return req.user?.role==='saas_super_admin'?{}:{organization:req.user.organization};
}
function propertyFilter(req,{optional=true}={}){
  if(req.propertyId)return {property:req.propertyId};
  return optional?{}:{property:null};
}
function scoped(req,extra={},options={}){
  return {...orgFilter(req),...propertyFilter(req,options),...extra};
}
function enforceWriteScope(req,body={}){
  const out={...body};
  if(req.user?.role!=='saas_super_admin')out.organization=req.user.organization;
  else if(!out.organization&&req.user?.organization)out.organization=req.user.organization;
  if(req.propertyId)out.property=req.propertyId;
  return out;
}
module.exports={orgFilter,propertyFilter,scoped,enforceWriteScope};
