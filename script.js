import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
updateDoc,
doc,
getDocs
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

{q:"Function calling itself is called?",options:["Loop","Recursion","Iteration","Compilation"],a:"recursion",cell:1},

{q:"Rules for communication between systems?",options:["Protocol","API","Compiler","Socket"],a:"api",cell:2},

{q:"Internet based storage service?",options:["Server","Cloud","RAM","Drive"],a:"cloud",cell:3},

{q:"Process of fixing errors?",options:["Testing","Debug","Compilation","Execution"],a:"debug",cell:4},

{q:"Programming language named after snake?",options:["Ruby","Python","Java","Go"],a:"python",cell:5},

{q:"Data structure used in BFS?",options:["Stack","Queue","Tree","Graph"],a:"queue",cell:6},

{q:"Data structure used in DFS?",options:["Queue","Stack","Heap","Array"],a:"stack",cell:7},

{q:"Language used to style web pages?",options:["HTML","CSS","JS","PHP"],a:"css",cell:8},

{q:"Language used to structure web pages?",options:["HTML","CSS","Python","SQL"],a:"html",cell:9},

{q:"Short form of Structured Query Language?",options:["SQL","HTML","CSS","XML"],a:"sql",cell:10},

{q:"Brain of the computer?",options:["RAM","ROM","CPU","GPU"],a:"cpu",cell:11},

{q:"Temporary memory of a computer?",options:["ROM","RAM","HDD","SSD"],a:"ram",cell:12},

{q:"Permanent memory of a computer?",options:["RAM","ROM","Cache","Register"],a:"rom",cell:13},

{q:"Collection of interconnected computers?",options:["Internet","Network","Server","Cloud"],a:"network",cell:14},

{q:"Technology for secure communication online?",options:["Encryption","Firewall","Protocol","Cloud"],a:"encryption",cell:15},

{q:"Technology connecting physical devices to internet?",options:["AI","ML","IoT","Cloud"],a:"iot",cell:16},

{q:"Program translating source code to machine code?",options:["Interpreter","Compiler","Debugger","Assembler"],a:"compiler",cell:17},

{q:"Step-by-step problem solving method?",options:["Program","Algorithm","Process","Loop"],a:"algorithm",cell:18},

{q:"Collection of structured data?",options:["Database","File","Server","Index"],a:"database",cell:19},

{q:"Process of converting encoded data to original?",options:["Encoding","Decoding","Encryption","Compression"],a:"decoding",cell:20}

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

/* SECURITY */

document.addEventListener("contextmenu",e=>e.preventDefault());

document.addEventListener("visibilitychange",function(){
if(document.hidden && !gameFinished){
alert("Tab switch detected. Game submitted.");
finish();
}
});

document.addEventListener("fullscreenchange",function(){
if(!document.fullscreenElement && !gameFinished){
alert("Fullscreen exited. Game submitted.");
finish();
}
});

/* CHECK DUPLICATE TEAM */

async function checkTeamExists(team){

const snapshot = await getDocs(collection(db,"leaderboard"));

let exists=false;

snapshot.forEach((docData)=>{
if(docData.data().teamName.toLowerCase()===team.toLowerCase()){
exists=true;
}
});

return exists;

}

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

let exists = await checkTeamExists(team);

if(exists){
alert("Team name already used");
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

let q=shuffledQuestions[current];

let html=`<div class="questionText">${q.q}</div><br>`;

q.options.forEach((opt,index)=>{
html+=`<div class="optionLine">${String.fromCharCode(65+index)}. ${opt}</div>`;
});

document.getElementById("question").innerHTML=html;

document.getElementById("questionNumber").innerText=
"Question "+(current+1)+" / 20";

let input=document.getElementById("answer");
let saveBtn=document.getElementById("saveBtn");

input.value=answers[current];

input.disabled=questionLocked[current];
saveBtn.disabled=questionLocked[current];

}

/* TIMER */

function startTimer(){

timerInterval=setInterval(()=>{

let m=Math.floor(totalEventTime/60);
let s=totalEventTime%60;

document.getElementById("eventTimer").innerText=
m+":"+(s<10?"0"+s:s);

totalEventTime--;

if(totalEventTime<=0){
totalEventTime=0;
finish();
}

},1000);

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
let diagonals=[[1,7,13,19],[5,9,13,17]];

let bingo=false;

rows.forEach(r=>{ if(r.every(x=>active.includes(x))) bingo=true; });
cols.forEach(c=>{ if(c.every(x=>active.includes(x))) bingo=true; });
diagonals.forEach(d=>{ if(d.every(x=>active.includes(x))) bingo=true; });

if(bingo){
alert("🎉 BINGO ACHIEVED!");
}

}

/* SAVE ANSWER */

function saveAnswer(){

if(questionLocked[current]) return;

let input=document.getElementById("answer");
let saveBtn=document.getElementById("saveBtn");

let ans=input.value.trim().toLowerCase();

if(ans===""){
alert("Enter answer");
return;
}

answers[current]=ans;
questionLocked[current]=true;

input.disabled=true;
saveBtn.disabled=true;

if(ans===shuffledQuestions[current].a){

document.getElementById("cell"+shuffledQuestions[current].cell)
.classList.add("active");

score++;

checkBingo();

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

if(teamDocId){

await updateDoc(doc(db,"leaderboard",teamDocId),{
score:score,
time:timeUsed
});

}

document.getElementById("result").innerText="Submission successful";

setTimeout(()=>{
window.location="completed.html";
},2000);

}
