

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

