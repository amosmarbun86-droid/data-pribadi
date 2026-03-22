/* =========================
   DEVICE SYSTEM API
========================= */

const API_URL =
"https://api.github.com/repos/amosmarbun86-droid/data-pribadi/contents/device.json";

/* =========================
   DEVICE ID (ANTI CLONE)
========================= */

function getDeviceID(){

let id=localStorage.getItem("deviceID");

if(!id){
id="DEV-"+crypto.randomUUID();
localStorage.setItem("deviceID",id);
}

return id;
}

/* =========================
   GET DATABASE
========================= */

async function getDB(){

const res=await fetch(API_URL);
const data=await res.json();

return JSON.parse(atob(data.content));
}

/* =========================
   REGISTER DEVICE (1x INSTALL)
========================= */

async function registerDevice(){

const db=await getDB();

const deviceID=getDeviceID();

let exist=db.devices.find(d=>d.id===deviceID);

if(!exist){

db.devices.push({
id:deviceID,
status:"active",
created:new Date().toISOString()
});

alert("Device registered ✅");
}

}

/* =========================
   CHECK BAN REALTIME
========================= */

async function checkAccess(){

const db=await getDB();

const deviceID=getDeviceID();

let device=db.devices.find(d=>d.id===deviceID);

if(!device){
document.body.innerHTML="<h2>Device not registered</h2>";
return;
}

if(device.status==="banned"){
document.body.innerHTML=
`
<div style="text-align:center;margin-top:50px">
<h1>🚫 DEVICE BANNED</h1>
<p>Hubungi Admin</p>
</div>
`;
}
}

/* =========================
   AUTO RUN
========================= */

registerDevice();
setInterval(checkAccess,5000);
