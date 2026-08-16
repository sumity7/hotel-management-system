module.exports=(...roles)=>(req,res,next)=>{if(req.user?.role==='saas_super_admin'||roles.includes(req.user?.role))return next(); return res.status(403).json({message:'Insufficient permission'});};
