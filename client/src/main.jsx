import React from'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter}from'react-router-dom';
import{QueryClient,QueryClientProvider}from'@tanstack/react-query';
import App from'./App';
import'./styles.css';

const qc=new QueryClient({
 defaultOptions:{
  queries:{
   retry:(count,error)=>{
    const status=error?.response?.status;
    if(status&&status<500)return false;
    return count<1;
   },
   refetchOnWindowFocus:false
  },
  mutations:{retry:false}
 }
});

createRoot(document.getElementById('root')).render(
 <React.StrictMode>
  <QueryClientProvider client={qc}>
   <BrowserRouter><App/></BrowserRouter>
  </QueryClientProvider>
 </React.StrictMode>
);
