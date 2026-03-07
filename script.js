const GAME_CODE = "keshav";

/* TOTAL EVENT TIME (15 MIN) */
const EVENT_DURATION = 15 * 60;

let totalEventTime = EVENT_DURATION;
let timerInterval;

let current = 0;
let score = 0;

let gameFinished = false;

let answers = new Array(20).fill("");
let answeredCorrect = new Array(20).fill(false);
let questionLocked = new Array(20).fill(false);

/* FULLSCREEN FUNCTION */

function enterFullscreen(){
if(!document.fullscreenElement){
document.documentElement.requestFullscreen().catch(()=>{});
}
}

/* BLOCK BACK BUTTON ONLY AFTER GAME START */

function blockBackNavigation(){

history.pushState(null,null,location.href);

window.onpopstate=function(){

alert("Back navigation is disabled during the game.");
history.pushState(null,null,location.href);

};

}

/* BLOCK TAB SWITCH */

document.addEventListener("visibilitychange",function(){

if(document.hidden && !gameFinished){

alert("You left the game tab. Game submitted.");
finish();

}

});

/* QUESTIONS */

const questions=[

{q:"Function calling itself",a:"recursion",cell:1},
{q:"Rules for communication between systems",a:"api",cell:2},
{q:"Internet based storage service",a:"cloud",cell:3},
{q:"Process of fixing errors",a:"debug",cell:4},
{q:"Programming language named after snake",a:"python",cell:5},

{q:"Data structure used in BFS",a:"queue",cell:6},
{q:"Data structure used in DFS",a:"stack",cell:7},
{q:"Language used to style web pages",a:"css",cell:8},
{q:"Language used to structure web pages",a:"html",cell:9},
{q:"Short form of Structured Query Language",a:"sql",cell:10},

{q:"Brain of the computer",a:"cpu",cell:11},
{q:"Temporary memory of a computer",a:"ram",cell:12},
{q:"Permanent memory of a computer",a:"rom",cell:13},
{q:"Collection of interconnected computers",a:"network",cell:14},
{q:"Technology for secure communication online",a:"encryption",cell:15},

{q:"Technology connecting physical devices to internet",a:"iot",cell:16},
{q:"Program translating source code to machine code",a:"compiler",cell:17},
{q:"Step-by-step problem solving method",a:"algorithm",cell:18},
{q:"Collection of structured data",a:"database",cell:19},
{q:"Process of converting encoded data to original",a:"decoding",cell:20}

];

/* SHUFFLE QUESTIONS */

function shuffle(array){

for(let i=array.length-1;i>0;i--){

let j=Math.floor(Math.random()*(i+1));
[array[i],array[j]]=[array[j],array[i]];

}

return array;

}

let shuffledQuestions = shuffle([...questions]);

/* EVENT TIMER */

function startEventTimer(){

timerInterval=setInterval(function(){

let minutes=Math.floor(totalEventTime/60);
let seconds=totalEventTime%60;

document.getElementById("eventTimer").innerText =
minutes+":"+(seconds<10?"0"+seconds:seconds);

totalEventTime--;

if(totalEventTime < 0){

clearInterval(timerInterval);
finish();

}

},1000);

}

/* START GAME */

async function checkCode(){

let code=document.getElementById("startCode").value.trim().toLowerCase();

if(code!==GAME_CODE){
alert("Wrong start code");
return;
}

let team=localStorage.getItem("team");

if(!team){
alert("Team name not found.");
return;
}

/* START GAME UI */

document.getElementById("startScreen").style.display="none";
document.getElementById("gameArea").style.display="block";

enterFullscreen();
blockBackNavigation();

/* ADD TEAM TO LEADERBOARD */

fetch("https://script.google.com/macros/s/AKfycbyd0thWhb7M7X5b5_rCIyx8jV3okI1PhjRGlmFbUPc0pKyvLxeusjZXsfFI8Hk6XdqIng/exec",{
method:"POST",
body:JSON.stringify({
team:team,
score:0,
time:0
})
});

/* SHOW FIRST QUESTION */

document.getElementById("question").innerText =
shuffledQuestions[current].q;

updateProgress();

startEventTimer();

}

/* PAGE LOAD */

document.addEventListener("DOMContentLoaded",function(){

let team=localStorage.getItem("team");
document.getElementById("teamName").innerText="Team: "+team;

let board=document.getElementById("board");

/* FULLSCREEN ON FIRST CLICK */

document.addEventListener("click",enterFullscreen,{once:true});

/* DETECT FULLSCREEN EXIT */

document.addEventListener("fullscreenchange",function(){

if(!document.fullscreenElement && !gameFinished){

alert("Fullscreen exited. Game submitted.");
finish();

}

});

/* CREATE BINGO BOARD */

for(let i=1;i<=20;i++){

let div=document.createElement("div");

div.className="cell";
div.innerText=i;
div.id="cell"+i;

board.appendChild(div);

}

});

/* UPDATE PROGRESS */

function updateProgress(){

document.getElementById("questionNumber").innerText =
"Question "+(current+1)+" / 20";

let answered=answers.filter(a=>a!=="").length;

document.getElementById("progress").innerText =
"Answered "+answered+" / 20";

}

/* SAVE ANSWER (ONLY ONE ATTEMPT) */

function saveAnswer(){

if(questionLocked[current]){
alert("You have already answered this question.");
return;
}

let ans=document.getElementById("answer").value.toLowerCase().trim();

if(ans===""){
alert("Enter an answer first.");
return;
}

answers[current]=ans;
questionLocked[current]=true;

document.getElementById("answer").disabled=true;

if(ans===shuffledQuestions[current].a){

document.getElementById("cell"+shuffledQuestions[current].cell)
.classList.add("active");

score++;
answeredCorrect[current]=true;

checkBingo();

}

checkAllAnswered();
updateProgress();

}

/* NEXT QUESTION */

function nextQuestion(){

if(current<19){

current++;

document.getElementById("question").innerText =
shuffledQuestions[current].q;

document.getElementById("answer").value =
answers[current];

document.getElementById("answer").disabled =
questionLocked[current];

updateProgress();

}

}

/* PREVIOUS QUESTION */

function prevQuestion(){

if(current>0){

current--;

document.getElementById("question").innerText =
shuffledQuestions[current].q;

document.getElementById("answer").value =
answers[current];

document.getElementById("answer").disabled =
questionLocked[current];

updateProgress();

}

}

/* SHOW SUBMIT BUTTON */

function checkAllAnswered(){

let done=answers.every(a=>a!=="");

if(done){
document.getElementById("submitGame").style.display="block";
}

}

/* BINGO CHECK */

function checkBingo(){

let active=[];

for(let i=1;i<=20;i++){

if(document.getElementById("cell"+i).classList.contains("active")){
active.push(i);
}

}

let rows=[[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20]];
let cols=[[1,6,11,16],[2,7,12,17],[3,8,13,18],[4,9,14,19],[5,10,15,20]];

let bingo=false;

rows.forEach(r=>{if(r.every(x=>active.includes(x)))bingo=true});
cols.forEach(c=>{if(c.every(x=>active.includes(x)))bingo=true});

if(bingo){
document.getElementById("result").innerText="🎉 BINGO ACHIEVED!";
}

}

/* FINISH GAME */

function finish(){

if(gameFinished) return;
gameFinished=true;

clearInterval(timerInterval);

let team=localStorage.getItem("team");

/* TIME USED = TOTAL TIME - REMAINING */

let totalTime = EVENT_DURATION - totalEventTime;

if(totalTime < 0){
totalTime = 0;
}

/* SEND RESULT */

fetch("https://script.google.com/macros/s/AKfycbyd0thWhb7M7X5b5_rCIyx8jV3okI1PhjRGlmFbUPc0pKyvLxeusjZXsfFI8Hk6XdqIng/exec",{
method:"POST",
body:JSON.stringify({
team:team,
score:score,
time:totalTime
})
});

document.getElementById("result").innerText =
"Submission successful. Thank you!";

/* REDIRECT */

setTimeout(function(){
window.location.href="completed.html";
},2000);

}
