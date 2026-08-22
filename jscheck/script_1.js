

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

// إذا كان الحساب تاجر افتح لوحة التاجر
if (data.accountType === "merchant") {

    window.location.href = "/merchant/index.html";

    return;

}

    // ✅ فتح التطبيق
    document.querySelectorAll(
    ".page"
    ).forEach(p =>
      p.classList.remove(
      "active")
    );

    document.getElementById("app").style.display = "block";

console.log("APP =", document.getElementById("app"));
console.log("DISPLAY =", document.getElementById("app").style.display);
console.log("CARDS =", document.querySelectorAll(".card").length);

// ===== Load Application =====

console.log("1");
if(typeof loadTasks === "function") loadTasks();

console.log("2");
if(typeof loadHistory === "function") loadHistory();

console.log("3");
if(typeof loadChart === "function") loadChart();

console.log("4");
if(typeof loadLeaderboard === "function") loadLeaderboard();

console.log("5");
if(typeof loadAdminTasks === "function") loadAdminTasks();

console.log("6");
if(typeof loadStats === "function") loadStats();

console.log("7");
if(typeof loadFinance === "function") loadFinance();

console.log("8");
if(typeof loadAnnouncements === "function") loadAnnouncements();

console.log("9");
if(typeof loadNotifications === "function") loadNotifications();

console.log("10");
if(typeof updateTasks === "function") updateTasks();

console.log("11");
if(typeof updateProgress === "function") updateProgress();

console.log("12");
if(typeof checkBlocked === "function"){
    setInterval(checkBlocked,10000);
}

console.log("END");

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

