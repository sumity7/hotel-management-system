const roles=require('../config/roles');
function matches(grant, need){
  if(grant==='*') return true;
  if(grant===need) return true;
  if(grant.endsWith('.*')) return need.startsWith(grant.slice(0,-1));
  return false;
}
module.exports=function permission(need){
  return (req,res,next)=>{
    const grants=[...(roles[req.user?.role]||[]),...(req.user?.permissions||[])];
    if(grants.some(g=>matches(g,need))) return next();
    return res.status(403).json({message:`Permission denied: ${need}`});
  };
};
