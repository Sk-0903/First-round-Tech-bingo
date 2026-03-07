import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE */

const firebaseConfig = {
apiKey: "AIzaSyDHQCoj35MskNmRoZZAIfS6H8GXrdSs6JA",
authDomain: "tech-bingo-leaderboard.firebaseapp.com",
projectId: "tech-bingo-leaderboard",
storageBucket: "tech-bingo-leaderboard.firebasestorage.app",
messagingSenderId: "614182283202",
appId: "1:614182283202:web:28679433283e05efb2585b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* SETTINGS */

const GAME_CODE="keshav";
const EVENT_DURATION=15*60;

let totalEventTime=EVENT_DURATION;
let timerInterval;

let current=0;
let score=0;
let gameFinished=false;

let teamDocId=null;

let answers=new Array(20).fill("");
let questionLocked=new Array(20).fill(false);

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

/* SHUFFLE */

function shuffle(arr){
for(let i=arr.length-1;i>0;i--){
let j=Math.floor(Math.random()*(i+1));
[arr[i],arr[j]]=[arr[j],arr[i]];
}
return arr;
}

let shuffledQuestions=shuffle([...questions]);

/* FULLSCREEN */

function enterFullscreen(){
if(!document.fullscreenElement){
document.documentElement.requestFullscreen().catch(()=>{});
}
}

/* BLOCK RIGHT CLICK */

document.addEventListener("contextmenu",e=>e.preventDefault());

/* BLOCK COPY PASTE */

document.addEventListener("copy",e=>e.preventDefault());
document.addEventListener("paste",e=>e.preventDefault());

/* BLOCK KEY SHORTCUTS */

document.addEventListener("keydown",function(e){

if(e.key==="F12"){
e.preventDefault();
}

if(e.ctrlKey && e.shiftKey && e.key==="I"){
e.preventDefault();
}

if(e.ctrlKey && e.key==="u"){
e.preventDefault();
}

});

/* TAB SWITCH DETECTION */

document.addEventListener("visibilitychange",function(){

if(document.hidden && !gameFinished){
alert("Tab switch detected. Game submitted.");
finish();
}

});

/* FULLSCREEN EXIT */

document.addEventListener("fullscreenchange",function(){

if(!document.fullscreenElement && !gameFinished){
alert("Fullscreen exited. Game submitted.");
finish();
}

});

/* REFRESH BLOCK */

window.onbeforeunload=function(){
if(!gameFinished){
return "Leaving will submit your game.";
}
};

/* PAGE LOAD */

document.addEventListener("DOMContentLoaded",()=>{

const team=localStorage.getItem("team");

if(team){
document.getElementById("teamName").innerText="Team: "+team;
}

let board=document.getElementById("board");

for(let i=1;i<=20;i++){

let div=document.createElement("div");
div.className="cell";
div.id="cell"+i;
div.innerText=i;

board.appendChild(div);

}

document.getElementById("startBtn").onclick=startGame;
document.getElementById("nextBtn").onclick=nextQuestion;
document.getElementById("prevBtn").onclick=prevQuestion;
document.getElementById("saveBtn").onclick=saveAnswer;
document.getElementById("submitGame").onclick=finish;

});

/* START GAME */

async function startGame(){

let code=document.getElementById("startCode").value.trim().toLowerCase();

if(code!==GAME_CODE){
alert("Wrong start code");
return;
}

let team=localStorage.getItem("team");

if(!team){
alert("Team name missing");
return;
}

enterFullscreen();

document.getElementById("startScreen").style.display="none";
document.getElementById("gameArea").style.display="block";

showQuestion();
startTimer();

const ref=await addDoc(collection(db,"leaderboard"),{
teamName:team,
score:0,
time:0
});

teamDocId=ref.id;

}

/* SHOW QUESTION */

function showQuestion(){

document.getElementById("question").innerText=shuffledQuestions[current].q;

document.getElementById("questionNumber").innerText=
"Question "+(current+1)+" / 20";

document.getElementById("answer").value=answers[current];
document.getElementById("answer").disabled=questionLocked[current];

}

/* TIMER */

function startTimer(){

timerInterval=setInterval(()=>{

let m=Math.floor(totalEventTime/60);
let s=totalEventTime%60;

document.getElementById("eventTimer").innerText=
m+":"+(s<10?"0"+s:s);

totalEventTime--;

if(totalEventTime<=0) finish();

},1000);

}

/* SAVE ANSWER */

function saveAnswer(){

if(questionLocked[current]) return;

let ans=document.getElementById("answer").value.trim().toLowerCase();

if(ans===""){
alert("Enter answer");
return;
}

answers[current]=ans;
questionLocked[current]=true;

document.getElementById("answer").disabled=true;

if(ans===shuffledQuestions[current].a){

document.getElementById("cell"+shuffledQuestions[current].cell)
.classList.add("active");

score++;

}

}

/* NEXT */

function nextQuestion(){

if(current<19){
current++;
showQuestion();
}

if(current===19){
document.getElementById("submitGame").style.display="block";
}

}

/* PREV */

function prevQuestion(){

if(current>0){
current--;
showQuestion();
}

}

/* FINISH */

async function finish(){

if(gameFinished) return;

gameFinished=true;

clearInterval(timerInterval);

let timeUsed=EVENT_DURATION-totalEventTime;

await updateDoc(doc(db,"leaderboard",teamDocId),{
score:score,
time:timeUsed
});

document.getElementById("result").innerText="Submission successful";

setTimeout(()=>{
window.location="completed.html";
},2000);

}
