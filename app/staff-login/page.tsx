'use client';
import {useEffect,useState} from 'react';
type Item=any;
export default function StaffLogin(){const [me,setMe]=useState<Item>(null),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
async function who(){try{const r=await fetch('/api/staff-login');const d:any=await r.json();if(r.ok)setMe(d);}catch{}}
useEffect(()=>{who();},[]);
async function login(e:any){e.preventDefault();setBusy(true);setNotice('');const f=Object.fromEntries(new FormData(e.currentTarget));try{const r=await fetch('/api/staff-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email:f.email,password:f.password})});const d:any=await r.json();if(!r.ok)throw Error(d.error);window.location.href='/';}catch(e:any){setNotice(e.message);}finally{setBusy(false);}}
async function logout(){setBusy(true);try{await fetch('/api/staff-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});setMe(null);setNotice('Signed out.');}finally{setBusy(false);}}
return <main className="publicwrap"><div className="logorow"><img src="/Onplan%20logo%20black.png" alt="Onplan Real Estate"/><img src="/Imtiaz%20logo.svg" alt="Imtiaz"/></div><div className="brand">◎ Kore fitness challenge<span>STAFF SIGN-IN</span></div><h1>Coach & admin sign-in</h1><p>Sign in with your staff email and password.</p>
{notice&&<div role="status" className="notice">{notice}</div>}
{me?<section className="panel"><h2>Signed in</h2><p>{me.name} ({me.email}) · {me.role}</p><div><button className="primary" onClick={()=>window.location.href='/'}>Open event desk</button> <button onClick={logout} disabled={busy}>Sign out</button></div></section>:<section className="panel"><h2>Sign in</h2><form onSubmit={login}><label>Email<input name="email" type="email" required maxLength={160}/></label><label>Password<input name="password" type="password" required/></label><button className="primary" disabled={busy}>Sign in</button></form><p>Passwords are set by the site owner in Coaches & admins.</p></section>}<p><a href="/">Back to home</a></p></main>;}
