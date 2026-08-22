

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

function toggleMerchant(show){

const merchant =
document.getElementById("merchantFields");

if(show){

merchant.style.display = "block";

}else{

merchant.style.display = "none";

}

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
        referralCode: reg_ref.value,

accountType:
document.querySelector('input[name="accountType"]:checked').value,

companyName:
merchant_company.value,

businessType:
merchant_type.value,

companyCity:
merchant_city.value,

website:
merchant_website.value,

licenseNumber:
merchant_license.value,

commercialRegister:
merchant_register.value,

companyDescription:
merchant_description.value


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

