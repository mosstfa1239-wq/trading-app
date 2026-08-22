

async function verifyAccount(){

try{

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

    alert(data.error || "Verification failed");

  }


}catch(err){

  console.error("verifyAccount error:",err);

  alert("Server connection error");

}

}



function showForgotPage(){

try{

  document
  .querySelectorAll(".page")
  .forEach(p=>p.classList.remove("active"));


  document
  .getElementById("forgotPage")
  .classList.add("active");


}catch(err){

 console.error("showForgotPage error:",err);

}

}





async function sendResetCode(){

try{

  const email =
  document.getElementById("resetEmail").value;


  const res = await fetch("/forgot-password",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({email})

  });


  const data = await res.json();


  alert(data.msg || "Code Sent");


}catch(err){

 console.error("sendResetCode error:",err);

 alert("Server connection error");

}

}





async function resetPassword(){

try{

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
    data.msg || data.error || "Done"
  );


}catch(err){

 console.error("resetPassword error:",err);

 alert("Server connection error");

}

}


