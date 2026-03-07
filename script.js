/* FIREBASE IMPORT */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
updateDoc,
doc,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE CONFIG */

const firebaseConfig = {
apiKey: "AIzaSyDHQCoj35MskNmRoZZAIfS6H8GXrdSs6JA",
authDomain: "tech-bingo-leaderboard.firebaseapp.com",
projectId: "tech-bingo-leaderboard",
storageBucket: "tech-bingo-leaderboard.firebasestorage.app",
messagingSenderId: "614182283202",
appId: "1:614182283202:web:28679433283e05efb2585b",
measurementId: "G-BN4V2GQJPB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let teamDocId = null;

/* GAME CODE */

const GAME_CODE = "keshav";

/* TOTAL EVENT TIME */

const EVENT_DURATION = 15 * 60;

let totalEventTime = EVENT_DURATION;
let timerInterval;

let current = 0;
let score = 0;

let gameFinished = false;
let gameStarted = false;

let answers = new Array(20).fill("");
let answeredCorrect = new Array(20).fill(false);
let questionLocked = new Array(20).fill(false);

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

/* FULLSCREEN */

function enterFullscreen(){
if(!document.fullscreenElement){
document.documentElement.requestFullscreen().catch(()=>{});
}
}

/* BLOCK BACK BUTTON */

function blockBackNavigation(){

history.pushState(null,null,location.href);

window.onpopstate=function(){
alert("Back navigation is disabled during the game.");
history.pushState(null,null,location.href);
};

}

/* PAGE LOAD */

document.addEventListener("DOMContentLoaded",function(){

let team=localStorage.getItem("team");

if(team){
document.getElementById("teamName").innerText="Team: "+team;
}

let board=document.getElementById("board");

for(let i=1;i<=20;i++){

let div=document.createElement("div");
div.className="cell";
div.innerText=i;
div.id="cell"+i;

board.appendChild(div);

}

});

/* CHECK DUPLICATE TEAM */

async function checkTeamExists(team){

const snapshot = await getDocs(collection(db,"leaderboard"));

let exists = false;

snapshot.forEach((d)=>{

let data = d.data();

if(data.teamName.toLowerCase() === team.toLowerCase()){
exists = true;
}

});

return exists;

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

let exists = await checkTeamExists(team);

if(exists){
alert("Team name already used.");
return;
}

/* CREATE TEAM ENTRY */

const docRef = await addDoc(collection(db,"leaderboard"),{
teamName:team,
score:0,
time:0
});

teamDocId = docRef.id;

document.getElementById("startScreen").style.display="none";
document.getElementById("gameArea").style.display="block";

gameStarted=true;

enterFullscreen();
blockBackNavigation();

document.getElementById("question").innerText=
shuffledQuestions[current].q;

updateProgress();

startEventTimer();

}

/* TIMER */

function startEventTimer(){

timerInterval=setInterval(function(){

let minutes=Math.floor(totalEventTime/60);
let seconds=totalEventTime%60;

document.getElementById("eventTimer").innerText =
minutes+":"+(seconds<10?"0"+seconds:seconds);

totalEventTime--;

if(totalEventTime <= 0){

clearInterval(timerInterval);
finish();

}

},1000);

}

/* UPDATE PROGRESS */

function updateProgress(){

document.getElementById("questionNumber").innerText=
"Question "+(current+1)+" / 20";

let answered=answers.filter(a=>a!=="").length;

document.getElementById("progress").innerText=
"Answered "+answered+" / 20";

}

/* SAVE ANSWER */

function saveAnswer(){

if(questionLocked[current]) return;

let ans=document.getElementById("answer").value.toLowerCase().trim();

if(ans===""){
alert("Enter answer");
return;
}

answers[current]=ans;
questionLocked[current]=true;

if(ans===shuffledQuestions[current].a){

document.getElementById("cell"+shuffledQuestions[current].cell)
.classList.add("active");

score++;
answeredCorrect[current]=true;

}

checkAllAnswered();
updateProgress();

}

/* NEXT QUESTION */

function nextQuestion(){

if(current<19){

current++;

document.getElementById("question").innerText=
shuffledQuestions[current].q;

document.getElementById("answer").value=answers[current];

updateProgress();

}

}

/* PREVIOUS QUESTION */

function prevQuestion(){

if(current>0){

current--;

document.getElementById("question").innerText=
shuffledQuestions[current].q;

document.getElementById("answer").value=answers[current];

updateProgress();

}

}

/* SHOW SUBMIT BUTTON */

function checkAllAnswered(){

let done=answers.every(a=>a!=="");

if(done && current===19){
document.getElementById("submitGame").style.display="block";
}

}

/* FINISH GAME */

async function finish(){

if(!gameStarted) return;
if(gameFinished) return;

gameFinished=true;

clearInterval(timerInterval);

let timeRemaining = Math.max(0,totalEventTime);
let totalTime = EVENT_DURATION - timeRemaining;

/* UPDATE FIREBASE */

if(teamDocId){

await updateDoc(doc(db,"leaderboard",teamDocId),{
score:score,
time:totalTime
});

}

document.getElementById("result").innerText=
"Submission successful.";

setTimeout(function(){
window.location.href="completed.html";
},2000);

}

/* MAKE FUNCTIONS ACCESSIBLE FROM HTML */

window.checkCode = checkCode;
window.saveAnswer = saveAnswer;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.finish = finish;
