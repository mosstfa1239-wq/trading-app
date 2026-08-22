
function openSupport(){
  document.getElementById("chatBox").style.display = "block";
  loadMyMessages();
}

async function sendMsg(){
  const userId = localStorage.getItem("userId");
  const userName = document.getElementById("userinfo").innerText;
  const text = document.getElementById("msg").value;

  await fetch("/send-message", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId, userName, text })
  });

  document.getElementById("msg").value = "";
  loadMyMessages();
}

async function loadMyMessages(){

try{

const userId = localStorage.getItem("userId");

const res = await fetch("/messages");

const data = await res.json();

let html = "";

data
.filter(m=>m.userId===userId)
.forEach(m=>{

html += `
<div style="margin:10px;padding:10px;border:1px solid #444">

🧑‍💻 ${m.text}<br>

🤖 ${m.reply || "⏳ Waiting..."}

</div>
`;

});

document.getElementById("myMessages").innerHTML = html;

}catch(err){

console.error(err);

}

}

async function loadTeam(refCode){

try{

const res = await fetch(`/team?code=${refCode}`);

const users = await res.json();

document.getElementById("teamCount").innerText = users.length;

let html="";

users.forEach(u=>{

html += `
<div class="card">

👤 ${u.firstName} - ${u.country}

</div>
`;

});

document.getElementById("teamList").innerHTML = html;

}catch(err){

console.error(err);

}

}

async function loadHistory(){

  const userId =
  localStorage.getItem("userId");

  const res =
  await fetch(
  "/history?userId=" + userId
  );

  const data =
  await res.json();

  let html = "";

  data.forEach(item => {

    html += `
    <div class="card">

      <b>${item.text}</b>

      <br>

      ${item.amount}$

      <br>

      ${new Date(item.date)
      .toLocaleString()}

    </div>
    `;

  });

const box=document.getElementById("historyBox");

if(box){

box.innerHTML=
html || "No History";

}

}

function showPage(id){

document.querySelectorAll(".page,.tab")
.forEach(p=>p.classList.remove("active"));

  document
  .getElementById(id)
  .classList.add("active");

  if(id === "historyPage"){
    loadHistory();
  }

  if(id === "announcementPage"){
    loadAnnouncements();
}

  if(id === "notificationsPage"){
    loadNotifications();
  }

}
