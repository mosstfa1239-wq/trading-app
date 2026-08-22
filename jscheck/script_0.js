

window.addEventListener("load",()=>{

const intro=document.getElementById("brandIntro");

if(!intro)return;

const logo=document.querySelector(".logo3d");

const title=document.querySelector(".brand-title");

let finished=false;

setTimeout(()=>{

logo.style.animationPlayState="running";

},100);

setTimeout(()=>{

title.style.transition="1s";

title.style.opacity="0";

title.style.transform="translateY(40px)";

},4500);

setTimeout(()=>{

intro.style.transition="1.2s";

intro.style.opacity="0";

intro.style.transform="scale(1.15)";

},5500);

setTimeout(()=>{

intro.remove();

},6800);

});

document.addEventListener("visibilitychange",()=>{

const logo=document.querySelector(".logo3d");

if(!logo)return;

if(document.hidden){

logo.style.animationPlayState="paused";

}else{

logo.style.animationPlayState="running";

}

});

