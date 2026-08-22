

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


}catch(err){

console.error(err);

alert("Server Error");

}

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


