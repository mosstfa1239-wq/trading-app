

async function sendToAdmin(){

  try{

    const input =
    document.getElementById("userMessage");

    if(!input){
      console.warn("userMessage not found");
      return;
    }


    const res = await fetch(
      "/send-to-admin",
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          userId:
          localStorage.getItem("userId"),

          message:
          input.value

        })
      }
    );


    if(!res.ok){
      throw new Error("sendToAdmin server error");
    }


    const data =
    await res.json();


    alert(data.msg || data.error);


  }catch(err){

    console.error("sendToAdmin error:",err);

  }

}





async function upgradeVip(vip){

  try{


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



    if(!res.ok){
      throw new Error("upgradeVip server error");
    }



    const data =
    await res.json();



    alert(data.msg || data.error);



    const bal =
    document.getElementById("bal");


    if(bal && data.balance !== undefined){

      bal.innerText =
      data.balance;

    }



    const vipLevel =
    document.getElementById("vipLevel");


    if(vipLevel && data.vip !== undefined){

      vipLevel.innerText =
      data.vip;

    }



  }catch(err){

    console.error("upgradeVip error:",err);

  }

}

