const GAME_CODE = "keshav";

let totalEventTime = 15 * 60;
let timerInterval;

let startTime;
let current = 0;
let score = 0;

let gameFinished = false;

let answers = new Array(20).fill("");
let answeredCorrect = new Array(20).fill(false);

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

function shuffle(array){

for(let i=array.length-1;i>0;i--){

let j=Math.floor(Math.random()*(i+1));
[array[i],array[j]]=[array[j],array[i]];

}

return array;

}

let shuffledQuestions = shuffle([...questions]);

async function checkTeamExists(team){

const sheetURL="https://docs.google.com/spreadsheets/d/e/2PACX-1vTurGPFhvpCPsl96tbGW8S3IJ4ShqOax69sr-qTici25dGvF5v_scJbLm8HPHHD9BBWDmV1od5bj2LP/pub?gid=0&single=true&output=csv";

let res = await fetch(sheetURL);
let data = await res.text();

let rows = data.split("\n");

for(let i=1;i<rows.length;i++){

let cols = rows[i].split(",");

if(cols[1] && cols[1].toLowerCase() === team.toLowerCase()){
return true;
}

}

return false;

}

function startEventTimer(){

timerInterval=setInterval(function(){

let minutes=Math.floor(totalEventTime/60);
let seconds=totalEventTime%60;

document.getElementById("eventTimer").innerText =
minutes+":"+(seconds<10?"0"+seconds:seconds);

totalEventTime--;

if(totalEventTime<=0){

clearInterval(timerInterval);
finish();

}

},1000);

}

async function checkCode(){

let code=document.getElementById("startCode").value.trim().toLowerCase();

if(code!==GAME_CODE){

alert("Wrong start code");
return;

}

let team=localStorage.getItem("team");

if(!team){

alert("Team name not found. Please register again.");
return;

}

let exists=await checkTeamExists(team);

if(exists){

alert("Team name already used. Choose another team name.");
return;

}

document.getElementById("startScreen").style.display="none";
document.getElementById("gameArea").style.display="block";

document.documentElement.requestFullscreen();

fetch("https://script.google.com/macros/s/AKfycbyd0thWhb7M7X5b5_rCIyx8jV3okI1PhjRGlmFbUPc0pKyvLxeusjZXsfFI8Hk6XdqIng/exec",{
method:"POST",
body:JSON.stringify({
team:team,
score:0,
time:0
})
});

document.getElementById("question").innerText=
shuffledQuestions[current].q;

updateProgress();

startEventTimer();

startTime=Date.now();

}

document.addEventListener("DOMContentLoaded",function(){

let team=localStorage.getItem("team");

document.getElementById("teamName").innerText="Team: "+team;

let board=document.getElementById("board");

document.addEventListener("visibilitychange",function(){

if(document.hidden){

alert("You left the game tab. Game submitted.");
finish();

}

});

document.addEventListener("fullscreenchange",function(){

if(!document.fullscreenElement){

alert("Fullscreen exited. Game submitted.");
finish();

}

});

for(let i=1;i<=20;i++){

let div=document.createElement("div");

div.className="cell";
div.innerText=i;
div.id="cell"+i;

board.appendChild(div);

}

});

function updateProgress(){

document.getElementById("questionNumber").innerText=
"Question "+(current+1)+" / 20";

let answered=answers.filter(a=>a!=="").length;

document.getElementById("progress").innerText=
"Answered "+answered+" / 20";

}

function saveAnswer(){

let ans=document.getElementById("answer").value.toLowerCase().trim();

answers[current]=ans;

if(ans===shuffledQuestions[current].a && !answeredCorrect[current]){

document.getElementById("cell"+shuffledQuestions[current].cell)
.classList.add("active");

score++;

answeredCorrect[current]=true;

checkBingo();

}

checkAllAnswered();
updateProgress();

}

function nextQuestion(){

if(current<19){

current++;

document.getElementById("question").innerText=
shuffledQuestions[current].q;

document.getElementById("answer").value=
answers[current];

updateProgress();

}

}

function prevQuestion(){

if(current>0){

current--;

document.getElementById("question").innerText=
shuffledQuestions[current].q;

document.getElementById("answer").value=
answers[current];

updateProgress();

}

}

function checkAllAnswered(){

let done=answers.every(a=>a!=="");

if(done){

document.getElementById("submitGame").style.display="block";

}

}

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

function finish(){

if(gameFinished) return;
gameFinished=true;

clearInterval(timerInterval);

let team=localStorage.getItem("team");

let endTime=Date.now();

let totalTime=Math.floor((endTime-startTime)/1000);

fetch("https://script.google.com/macros/s/AKfycbyd0thWhb7M7X5b5_rCIyx8jV3okI1PhjRGlmFbUPc0pKyvLxeusjZXsfFI8Hk6XdqIng/exec",{
method:"POST",
body:JSON.stringify({
team:team,
score:score,
time:totalTime
})
});

document.getElementById("result").innerText=
"Submission successful. Thank you!";

setTimeout(function(){

window.location.href="about:blank";

},2000);

}
