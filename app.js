const DEVICE_ID =
localStorage.getItem("device_id")
|| crypto.randomUUID();

localStorage.setItem("device_id",DEVICE_ID);

// register 1x install
async function registerDevice(){

  const {db} = await getDatabase();

  let exist =
    db.devices.find(d=>d.id===DEVICE_ID);

  if(!exist){

    db.devices.push({
      id:DEVICE_ID,
      status:"active",
      install:Date.now()
    });

    await updateDatabase(db);
  }
}

// realtime sync tiap 5 detik
async function syncStatus(){

  const {db} = await getDatabase();

  let me =
    db.devices.find(d=>d.id===DEVICE_ID);

  if(me && me.status==="banned"){
      alert("Device anda di BAN admin");
      document.body.innerHTML="<h1>ACCESS BLOCKED</h1>";
  }
}

registerDevice();
setInterval(syncStatus,5000);
