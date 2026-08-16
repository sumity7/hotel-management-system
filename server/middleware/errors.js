module.exports=(err,req,res,next)=>{
  console.error(err);
  if(res.headersSent)return next(err);
  if(err?.name==='ValidationError'){
    const errors=Object.fromEntries(Object.entries(err.errors||{}).map(([k,v])=>[k,v.message]));
    return res.status(400).json({message:'Validation failed',errors});
  }
  if(err?.name==='CastError')return res.status(400).json({message:`Invalid ${err.path||'identifier'}`,value:err.value});
  if(err?.code===11000)return res.status(409).json({message:'Duplicate record',key:err.keyValue});
  if(err?.name==='MongoServerError')return res.status(500).json({message:'Database operation failed'});
  const status=Number(err?.status||err?.statusCode||500);
  res.status(status>=400&&status<600?status:500).json({message:err?.message||'Server error'});
};
