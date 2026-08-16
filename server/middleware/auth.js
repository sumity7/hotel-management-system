const jwt=require('jsonwebtoken');
const {User,Property}=require('../models/core');

module.exports=async function(req,res,next){
  try{
    const h=req.headers.authorization||'';
    const token=h.startsWith('Bearer ')?h.slice(7):null;
    if(!token)return res.status(401).json({message:'Authentication required'});
    const d=jwt.verify(token,process.env.JWT_SECRET);
    const u=await User.findById(d.id);
    if(!u||u.status!=='active')return res.status(401).json({message:'User unavailable'});
    req.user=u;

    const requested=req.headers['x-property-id'];
    if(requested){
      if(u.role==='saas_super_admin'){
        req.propertyId=requested;
      }else if(['system_admin','regional_corporate_admin'].includes(u.role)){
        const ok=await Property.exists({_id:requested,organization:u.organization});
        if(!ok)return res.status(403).json({message:'Property is outside your organization'});
        req.propertyId=requested;
      }else{
        const allowed=(u.properties||[]).some(id=>String(id)===String(requested));
        if(!allowed)return res.status(403).json({message:'Property access denied'});
        req.propertyId=requested;
      }
    }else{
      req.propertyId=u.properties?.[0];
    }
    next();
  }catch(e){
    res.status(401).json({message:'Invalid or expired token'});
  }
};
