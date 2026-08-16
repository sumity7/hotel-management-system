import axios from 'axios';

export const api=axios.create({
  baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api',
});

api.interceptors.request.use(config=>{
  const token=localStorage.getItem('hotel_token');
  const propertyId=localStorage.getItem('hotel_property');
  if(token)config.headers.Authorization=`Bearer ${token}`;
  if(propertyId)config.headers['X-Property-Id']=propertyId;
  return config;
},error=>Promise.reject(error));

api.interceptors.response.use(
  response=>response,
  async error=>{
    const status=error.response?.status;
    const message=String(error.response?.data?.message||error.response?.data?.error||'').toLowerCase();
    const original=error.config||{};

    if(status===401){
      localStorage.removeItem('hotel_token');
      localStorage.removeItem('hotel_property');
      if(!window.location.pathname.includes('/login'))window.location.href='/login';
      return Promise.reject(error);
    }

    const propertyError=status===403&&(message.includes('property')||message.includes('tenant')||message.includes('organization'));
    if(propertyError&&!original.__propertyRetry){
      localStorage.removeItem('hotel_property');
      original.__propertyRetry=true;
      if(original.headers)delete original.headers['X-Property-Id'];
      return api(original);
    }

    return Promise.reject(error);
  }
);
