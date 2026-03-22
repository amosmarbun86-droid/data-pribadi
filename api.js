const API_URL =
"https://api.github.com/repos/amosmarbun86-droid/data-pribadi/contents/device.json";

const BRANCH = "main";

// ambil database
async function getDatabase(){

  const res = await fetch(API_URL);
  const data = await res.json();

  const content =
    JSON.parse(atob(data.content));

  return {
    sha:data.sha,
    db:content
  };
}

// kirim update (dipanggil admin panel)
async function updateDatabase(newData){

  const token = window.GH_PROXY_TOKEN; // dari github action proxy

  const current = await getDatabase();

  await fetch(API_URL,{
    method:"PUT",
    headers:{
      "Authorization":"Bearer "+token,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      message:"update device database",
      content:btoa(JSON.stringify(newData,null,2)),
      sha:current.sha,
      branch:BRANCH
    })
  });
}
