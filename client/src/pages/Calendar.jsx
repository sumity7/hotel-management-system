import React,{useMemo,useState}from'react';
import{useMutation,useQuery,useQueryClient}from'@tanstack/react-query';
import{api}from'../api';import{Page}from'../components';import{addDays,format,startOfDay}from'date-fns';
export default function Calendar(){
 const qc=useQueryClient(),from=startOfDay(new Date()),to=addDays(from,13);const[message,setMessage]=useState('');
 const{data}=useQuery({queryKey:['calendar'],queryFn:()=>api.get('/reservations/calendar',{params:{from:from.toISOString(),to:addDays(to,1).toISOString()}}).then(r=>r.data)});
 const days=useMemo(()=>Array.from({length:14},(_,i)=>addDays(from,i)),[]);
 const move=useMutation({mutationFn:({id,room})=>api.post(`/reservations/${id}/move-room`,{room,reason:'Tape chart drag/drop'}),onSuccess:()=>{setMessage('Room moved successfully');qc.invalidateQueries({queryKey:['calendar']})},onError:e=>setMessage(e.response?.data?.message||e.message)});
 const resize=useMutation({mutationFn:({id,checkOut})=>api.patch(`/reservations/${id}`,{checkOut,reason:'Tape chart resize'}),onSuccess:()=>qc.invalidateQueries({queryKey:['calendar']}),onError:e=>setMessage(e.response?.data?.message||e.message)});
 function booking(room,day){return data?.reservations?.find(r=>String(r.room?._id||r.room)===String(room._id)&&new Date(r.checkIn)<addDays(day,1)&&new Date(r.checkOut)>day)}
 function drop(e,room){const id=e.dataTransfer.getData('reservationId');if(id)move.mutate({id,room:room._id})}
 return <Page title="Visual Reservation Calendar / Tape Chart" subtitle="Drag reservations between rooms. Extend or shorten stays with the booking controls.">
  {message&&<div className="notice">{message}</div>}
  <div className="tape"><div className="tapeHead"><div className="roomCell">Room</div>{days.map(d=><div key={d.toISOString()}>{format(d,'dd MMM')}</div>)}</div>
   {data?.rooms?.map(room=><div className="tapeRow" key={room._id}><div className="roomCell"><b>{room.number}</b><small>{room.roomType?.code||room.roomType?.name}</small></div>{days.map(d=>{const b=booking(room,d);return <div key={`${room._id}-${d.toISOString()}`} className={`dayCell ${b?'booked':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>drop(e,room)}>{b?<div className="tapeBooking" draggable onDragStart={e=>e.dataTransfer.setData('reservationId',b._id)} title={`${b.guest?.fullName} • ${b.status}`}><span>{b.guest?.fullName?.split(' ')[0]||'Booked'}</span><div className="tapeMiniActions"><button title="Shorten one day" onClick={()=>resize.mutate({id:b._id,checkOut:addDays(new Date(b.checkOut),-1).toISOString()})}>−</button><button title="Extend one day" onClick={()=>resize.mutate({id:b._id,checkOut:addDays(new Date(b.checkOut),1).toISOString()})}>+</button></div></div>:null}</div>})}</div>)}
  </div>
 </Page>
}
