import React,{createContext,useContext,useEffect,useMemo,useState}from'react';
import{api}from'./api';

const C=createContext(null);
export const useAuth=()=>useContext(C);

function syncProperty(user){
  const allowed=(user?.properties||[]).map(p=>String(p?._id||p));
  const current=localStorage.getItem('hotel_property');
  if(current&&allowed.includes(String(current)))return current;
  if(allowed[0]){localStorage.setItem('hotel_property',allowed[0]);return allowed[0]}
  localStorage.removeItem('hotel_property');
  return null;
}

function matches(grant,need){
  if(grant==='*'||grant===need)return true;
  return grant?.endsWith('.*')&&need.startsWith(grant.slice(0,-1));
}

export function AuthProvider({children}){
  const[user,setUser]=useState(null),[loading,setLoading]=useState(true);

  useEffect(()=>{
    const token=localStorage.getItem('hotel_token');
    if(!token){setLoading(false);return}
    api.get('/auth/me')
      .then(({data})=>{setUser(data.user);syncProperty(data.user)})
      .catch(()=>{localStorage.removeItem('hotel_token');localStorage.removeItem('hotel_property');setUser(null)})
      .finally(()=>setLoading(false));
  },[]);

  const login=async(email,password)=>{
    localStorage.removeItem('hotel_property');
    const{data}=await api.post('/auth/login',{email,password});
    localStorage.setItem('hotel_token',data.token);
    setUser(data.user);
    syncProperty(data.user);
    return data;
  };

  const logout=()=>{
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('hotel_property');
    setUser(null);
  };

  const can=useMemo(()=>need=>{
    const grants=user?.grants||[];
    return grants.some(g=>matches(g,need));
  },[user]);

  return <C.Provider value={{user,loading,login,logout,can}}>{children}</C.Provider>;
}
