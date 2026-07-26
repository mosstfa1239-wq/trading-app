
// 🔐 تسجيل دخول

async function login(){

  document.getElementById(
  "loginStatus"
  ).innerText =
  "Logging in...";


  document.querySelector(
  'button[onclick="login()"]'
  ).disabled = true;

  try{

    const res = await fetch(
    "/login", {

      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body: JSON.stringify({

        email: email.value,

        password: pass.value
      })
    });

    const data =
    await res.json();

    if(data.error){

      document.getElementById(
      "loginStatus"
      ).innerText =
      data.error;

      document.querySelector(
      'button[onclick="login()"]'
      ).disabled = false;

      return;
    }

    // ✅ حفظ تسجيل الدخول
    localStorage.setItem(
    "userId",
    data._id
    );

    // ✅ المهام
    window.userTasks =
    data.tasks || [];

    // ✅ البيانات
    document.getElementById(
    "userinfo"
    ).innerText =
    data.firstName;

    document.getElementById(
    "bal"
    ).innerText =
    data.wbalance;

document.getElementById("vipLevel")
.innerText =
"VIP " + (data.vip || 0);

    document.getElementById(
    "p_name"
    ).innerText =
    data.firstName;

    document.getElementById(
    "p_last"
    ).innerText =
    data.lastName;

    document.getElementById(
    "p_email"
    ).innerText =
    data.email;

    document.getElementById(
    "p_phone"
    ).innerText =
    data.phone;

    document.getElementById(
    "p_country"
    ).innerText =
    data.country;

    document.getElementById(
    "p_address"
    ).innerText =
    data.address;

   document.getElementById(
"p_ref"
).innerText =

location.origin +
"/?ref=" +
data.referralCode;

    document.getElementById(
    "adminMsg"
    ).innerText =
    data.adminMessage ||
    "No messages";

    loadTeam(
    data.referralCode
    );

    document.getElementById(
    "loginStatus"
    ).innerText =
    "Login successful";

    // ✅ فتح التطبيق
    document.querySelectorAll(
    ".page"
    ).forEach(p =>
      p.classList.remove(
      "active")
    );

    document.getElementById("app").style.display = "block";
// ===== Load Application =====

if(typeof loadTasks === "function") loadTasks();

if(typeof loadHistory === "function") loadHistory();

if(typeof loadChart === "function") loadChart();

if(typeof loadLeaderboard === "function") loadLeaderboard();

if(typeof loadAdminTasks === "function") loadAdminTasks();

if(typeof loadStats === "function") loadStats();

if(typeof loadFinance === "function") loadFinance();

if(typeof loadAnnouncements === "function") loadAnnouncements();

if(typeof loadNotifications === "function") loadNotifications();

if(typeof updateTasks === "function") updateTasks();

if(typeof updateProgress === "function") updateProgress();

if(typeof checkBlocked === "function"){

setInterval(checkBlocked,10000);

}

}catch(err){

console.error(err);

document.getElementById("loginStatus").innerText =
err.message;

document.querySelector(
'button[onclick="login()"]'
).disabled = false;

}

}


// 🧠 حفظ تسجيل الدخول
window.onload =
async function(){

  const userId =
  localStorage.getItem(
  "userId"
  );

  if(!userId){

    console.log(
    "no userId"
    );

    return;
  }

  try{

    const res = await fetch(
    `/user?userId=${userId}`
    );

    const data =
    await res.json();

    if(data.error){

      localStorage.removeItem(
      "userId"
      );

      return;
    }

    // ✅ المهام
    window.userTasks =
    data.tasks || [];

    // ✅ فتح التطبيق
    document.querySelectorAll(
    ".page"
    ).forEach(p =>
      p.classList.remove(
      "active")
    );

   document.getElementById("app").style.display = "block";

console.log("OPEN APP");

    // ✅ البيانات
    document.getElementById(
    "userinfo"
    ).innerText =
    data.firstName;

    document.getElementById(
    "bal"
    ).innerText =
    data.balance;

document.getElementById("vipLevel")
.innerText =
"VIP " + (data.vip || 0);

    document.getElementById(
    "p_name"
    ).innerText =
    data.firstName;

    document.getElementById(
    "p_last"
    ).innerText =
    data.lastName;

    document.getElementById(
    "p_email"
    ).innerText =
    data.email;

    document.getElementById(
    "p_phone"
    ).innerText =
    data.phone;

    document.getElementById(
    "p_country"
    ).innerText =
    data.country;

    document.getElementById(
    "p_address"
    ).innerText =
    data.address;

    document.getElementById(
"p_ref"
).innerText =

location.origin +
"/?ref=" +
data.referralCode;

    document.getElementById(
    "adminMsg"
    ).innerText =
    data.adminMessage ||
    "No messages";

    loadTeam(
    data.referralCode
    );

// ===== Load Application =====

if(typeof loadTasks === "function") loadTasks();

if(typeof loadHistory === "function") loadHistory();

if(typeof loadChart === "function") loadChart();

if(typeof loadLeaderboard === "function") loadLeaderboard();

if(typeof loadAdminTasks === "function") loadAdminTasks();

if(typeof loadStats === "function") loadStats();

if(typeof loadFinance === "function") loadFinance();

if(typeof loadAnnouncements === "function") loadAnnouncements();

if(typeof loadNotifications === "function") loadNotifications();

if(typeof updateTasks === "function") updateTasks();

if(typeof updateProgress === "function") updateProgress();

if(typeof checkBlocked === "function"){

setInterval(checkBlocked,10000);

}

}catch(err){

console.error(err);

localStorage.removeItem("userId");

location.reload();

}


}

</script>
<script>

// 🔄 تبديل الصفحات
function showTab(id){

document.querySelectorAll(".tab")
.forEach(tab=>tab.classList.remove("active"));

const page=document.getElementById(id);

if(page){

page.classList.add("active");

}

if(id==="historyPage" && typeof loadHistory==="function"){

loadHistory();

}

}

function logout(){

localStorage.removeItem("userId");

document.getElementById("app").style.display="none";

document.querySelectorAll(".page")
.forEach(p=>p.classList.remove("active"));

document.getElementById("loginPage")
.classList.add("active");

}

// 👇 حطها هون
async function loadLeaderboard(){

try{

const res=await fetch("/leaderboard");

const users=await res.json();

let text="";

users.forEach(user=>{

text+=`🏆 ${user.firstName || "User"} - ${user.balance} USDT | `;

});

const board=document.getElementById("leaderboard");

if(board){

board.innerText=text;

}

}catch(err){

console.error(err);

}

}
// 🛒 شراء
async function buyTask(taskId){
  const userId = localStorage.getItem("userId");
updateTasks();


  const res = await fetch("/buy-task", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ userId, taskId })
  });

  const data = await res.json();

if(data.error){

alert(data.error);

return;

}

document.getElementById("bal").innerText=data.balance;

if(typeof loadTasks==="function"){

loadTasks();

 }

}

// ✅ تنفيذ
async function completeTask(taskId){

  const res = await fetch("/complete-task", {

    method: "POST",

    headers:{
      "Content-Type":"application/json"
    },

    body: JSON.stringify({

      userId:
      localStorage.getItem("userId"),

      taskId
    })
  });

  const data = await res.json();

  alert(data.msg || data.error);

  if(data.balance !== undefined){

    document.getElementById("bal")
      .innerText = data.balance;
  }

const daily=document.getElementById("dailyLeft");

if(daily){

daily.innerText=
"Remaining Tasks: "+
data.dailyTasks;

}

  loadTasks();
}

// 💸 سحب
async function withdraw(){

const userId=localStorage.getItem("userId");

const wallet=document.getElementById("wallet").value.trim();

const amount=Number(document.getElementById("amount").value);

if(!wallet){

alert("Enter Wallet Address");

return;

}

if(amount<=0){

alert("Invalid Amount");

return;

}

try{

const res=await fetch("/withdraw",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
userId,
wallet,
amount
})

});

const data=await res.json();

if(data.error){

alert(data.error);

return;

}

document.getElementById("bal").innerText=data.balance;

alert("Withdrawal Request Sent");

}catch(err){

console.error(err);

alert("Withdraw Failed");

}

}

function showRegister(){
  document.getElementById("loginPage").classList.remove("active");
  document.getElementById("registerPage").classList.add("active");
}

function showLogin(){
  document.getElementById("registerPage").classList.remove("active");
  document.getElementById("loginPage").classList.add("active");
}

const params =
new URLSearchParams(
window.location.search
);

const ref =
params.get("ref");

if(ref){

  document.getElementById(
  "reg_ref"
  ).value = ref;

}

async function register(){

  try{

    console.log("REGISTER START");

if(!reg_email.value ||
!reg_pass.value ||
!reg_first.value){

alert("Please Fill All Required Fields");

return;

}

    const res = await fetch("/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email: reg_email.value,
        password: reg_pass.value,
        firstName: reg_first.value,
        lastName: reg_last.value,
        phone: reg_phone.value,
        country: reg_country.value,
        address: reg_address.value,
        referralCode: reg_ref.value
      })
    });

    console.log("RESPONSE RECEIVED");

    const data = await res.json();

    console.log(data);

    if(data.error){
      alert(data.error);
      return;
    }
alert("Account created successfully");

localStorage.setItem(
  "verifyEmail",
  reg_email.value
);

document.getElementById("registerPage")
.classList.remove("active");

document.getElementById("verifyPage")
.classList.add("active");


  }catch(err){

    console.log(err);
    alert(err.message);

  }

}

let myChart;

function loadChart(){

const canvas=document.getElementById("profitChart");

if(!canvas)return;

if(myChart){

myChart.destroy();

}

myChart=new Chart(canvas,{

type:"line",

data:{

labels:["Mon","Tue","Wed","Thu","Fri"],

datasets:[{

label:"Profit",

data:[2,5,3,8,6],

borderWidth:2,

tension:0.4,

fill:true

}]

}

});

}

function updateTasks(){

try{

const el=document.getElementById("doneTasks");

if(!el)return;

const tasks=window.userTasks || [];

el.innerText=tasks.length;

}catch(err){

console.error(err);

}

}

function updateProgress(){

try{

const bal=document.getElementById("bal");

const progress=document.getElementById("progress");

if(!bal || !progress)return;

const balance=Number(bal.innerText)||0;

const percent=Math.min((balance/10)*100,100);

progress.innerText=
balance+" USDT / 10 USDT ("+
percent.toFixed(0)+"%)";

}catch(err){

console.error(err);

}

}

</script>
<script>
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
</script>
<script>

async function deposit(){

try{

  const amount =
    document.getElementById("depositAmount").value;

  const res = await fetch("/deposit",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({
      amount,
      userId:localStorage.getItem("userId")
    })

  });

  const data = await res.json();

  if(data.payment_url){

    window.location.href = data.payment_url;

  }else{

    alert(data.error || "Deposit error");

  }

}catch(err){

console.error(err);

alert("Deposit Failed");

}

}


async function addTask(){

  const title =
    document.getElementById("taskTitle").value;

  const reward =
    document.getElementById("taskReward").value;

  const res = await fetch("/admin/add-task", {

    method: "POST",

    headers:{
      "Content-Type":"application/json"
    },

    body: JSON.stringify({
      title,
      reward
    })
  });

  const data = await res.json();

  alert(data.msg || data.error);
}

async function addBalance(){

try{

  const email =
    document.getElementById("userEmail").value;

  const balance =
    document.getElementById("userBalance").value;

  const res = await fetch("/admin/add-balance", {

    method: "POST",

    headers:{
      "Content-Type":"application/json"
    },

    body: JSON.stringify({
      email,
      balance
    })
  });

  const data = await res.json();

  alert(data.msg || data.error);
}


}catch(err){

console.error(err);

alert("Server Error");

}

function copyReferral(){

const ref=document.getElementById("p_ref").innerText;

if(!ref){

alert("No Referral Link");

return;

}

navigator.clipboard.writeText(ref);

alert("Referral Link Copied");

}

</script>
<script>

async function loadTasks(){

try{

  const res = await fetch(

    "/daily-tasks?userId=" +
    localStorage.getItem("userId")

  );

  const tasks = await res.json();
const daily=document.getElementById("dailyLeft");

if(daily){

daily.innerText=
"Remaining Tasks: " + tasks.length;

}

  let html = "";

  tasks.forEach(task => {

   html += `

<div class="card">

  <img
  src="${task.image || ''}"
  style="
    width:120px;
    height:120px;
    object-fit:cover;
    border-radius:15px;
    margin-bottom:10px;
  ">

  <h2>${task.title}</h2>

  <p>
  💰 Order Amount:
  $${task.price}
  </p>

  <p>
  📈 Commission:
  $${task.profit}
  </p>

  <p>
  🔥 Expected Return:
$${(Number(task.price)+Number(task.profit)).toFixed(2)}
  </p>

  <button
  onclick="completeTask('${task._id}')">

  Execute Order

  </button>

</div>
`;
  });

const box=document.getElementById("tasks");

if(box){

box.innerHTML=html;

}

}catch(err){

console.error(err);

const box=document.getElementById("tasks");

if(box){

box.innerHTML="<div class='card'>No Tasks Available</div>";

}

}
}

</script>
<script>

async function sendToAdmin(){

  const res = await fetch(
    "/send-to-admin",
  {

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({

      userId:
      localStorage.getItem(
      "userId"),

      message:
      document.getElementById(
      "userMessage").value

    })
  });

  const data = await res.json();

  alert(data.msg || data.error);
}



async function upgradeVip(vip){

  const res =
  await fetch("/upgrade-vip",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({

      userId:
      localStorage.getItem("userId"),

      vip

    })

  });

  const data =
  await res.json();

  alert(data.msg || data.error);

  if(data.balance !== undefined){

    document.getElementById("bal")
    .innerText =
    data.balance;

  }

  if(data.vip !== undefined){

    document.getElementById("vipLevel")
    .innerText =
    data.vip;

  }

}
</script>
<script>

async function verifyAccount(){

  const email =
    localStorage.getItem("verifyEmail");

  const code =
    document.getElementById("verifyCode").value;

  const res = await fetch("/verify-email",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({
      email,
      code
    })

  });

  const data = await res.json();

  if(data.msg){

    alert("Email Verified");

    showLogin();

  }else{

    alert(data.error);

  }
}

function showForgotPage(){

  document
  .querySelectorAll(".page")
  .forEach(p=>p.classList.remove("active"));

  document
  .getElementById("forgotPage")
  .classList.add("active");

}

async function sendResetCode(){

  const email =
  document.getElementById("resetEmail").value;

  await fetch("/forgot-password",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({email})

  });

  alert("Code Sent");

}

async function resetPassword(){

  const email =
  document.getElementById("resetEmail").value;

  const code =
  document.getElementById("resetCode").value;

  const password =
  document.getElementById("newPassword").value;

  const res =
  await fetch("/reset-password",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({

      email,
      code,
      password

    })

  });

  const data =
  await res.json();

  alert(
    data.msg || data.error
  );

}

</script>
<script>
async function loadNotifications(){

  const res =
  await fetch(

    "/notifications?userId=" +
    localStorage.getItem("userId")

  );

  const data =
  await res.json();

  let html = "";

  data.forEach(n=>{

    html += `
      <div class="card">
        ${n.text}
      </div>
    `;

  });

  document.getElementById(
    "notifications"
  ).innerHTML = html;

}

async function loadAnnouncements(){

  const res = await fetch(

    "/announcements"

  );

  const data =
  await res.json();

  let html = "";

  data.forEach(a=>{

    html += `

<div class="card">

${a.text}

</div>

`;

  });

  document.getElementById(
  "announcements"
  ).innerHTML = html;

}

//الطرد
async function checkBlocked(){

  const userId =
  localStorage.getItem("userId");

  if(!userId) return;

  const res =
  await fetch(
    "/user/status?userId=" + userId
  );

  const data =
  await res.json();

  if(data.blocked){

    alert(
      "🚫 Your account has been blocked"
    );

    localStorage.removeItem(
      "userId"
    );

    location.reload();

  }

}

