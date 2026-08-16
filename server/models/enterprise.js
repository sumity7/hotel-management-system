const mongoose = require('mongoose');
const defs = require('../config/enterpriseModules');
const {Schema} = mongoose;
const typeMap = {String:String, Number:Number, Boolean:Boolean, Date:Date, Mixed:Schema.Types.Mixed, ObjectId:Schema.Types.ObjectId};
const models = {};
for(const [key, def] of Object.entries(defs)){
  const shape = {
    organization:{type:Schema.Types.ObjectId,ref:'Organization',index:true},
    property:{type:Schema.Types.ObjectId,ref:'Property',index:true}
  };
  for(const [name,typeName] of Object.entries(def.fields)){
    const t=typeMap[typeName] || Schema.Types.Mixed;
    shape[name]= typeName==='ObjectId' ? {type:t} : {type:t};
  }
  const schema = new Schema(shape,{timestamps:true,strict:true});
  schema.index({organization:1,property:1,createdAt:-1});
  const modelName='Ent'+key.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');
  models[key]=mongoose.models[modelName] || mongoose.model(modelName,schema,key.replace(/-/g,'_'));
}
module.exports=models;
