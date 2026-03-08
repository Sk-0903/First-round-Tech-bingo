import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getFirestore,
collection,
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

const GAME_CODE="kesha";
const EVENT_DURATION=10*60;

let totalEventTime=EVENT_DURATION;
let timerInterval;

let current=0;
let score=0;
let gameFinished=false;
let showingBingo=false;
let bingoAchieved=false;

let teamDocId=null;

let answers=new Array(20).fill("");
let questionLocked=new Array(20).fill(false);

/* QUESTIONS */

const questions=[

{q:`What will be the output?
int a = 5;
int b = 10;
printf("%d", a+++b);`,
options:["15","16","Compilation Error","5"],
a:btoa("15"),cell:1},

{q:"Which programming language is mainly used for Android app development?",
options:["Swift","Kotlin","Ruby","Go"],
a:btoa("kotlin"),cell:2},

{q:"Which company owns GitHub?",
options:["Google","Microsoft","Amazon","Meta"],
a:btoa("microsoft"),cell:3},

{q:"Which programming language was named after a comedy show?",
options:["Ruby","Python","Java","Swift"],
a:btoa("python"),cell:4},

{q:"What is the full form of GPT in ChatGPT?",
options:["General Processing Tool","Generative Pre-trained Transformer","Global Programming Tool","General Purpose Transformer"],
a:btoa("generative pre-trained transformer"),cell:5},

{q:"Which company created TensorFlow?",
options:["Meta","Google","Microsoft","Amazon"],
a:btoa("google"),cell:6},

{q:"Which database type is MongoDB?",
options:["Relational","NoSQL","Graph","Distributed"],
a:btoa("nosql"),cell:7},

{q:"What was Java called before it was renamed Java?",
options:["Oak","Pine","Coffee","Maple"],
a:btoa("oak"),cell:8},

{q:"Which AI tool is famous for text-to-image generation?",
options:["ChatGPT","DALL-E","GitHub","Docker"],
a:btoa("dall-e"),cell:9},

{q:`Which programming language has the motto
"Write once, run anywhere"?`,
options:["C++","Java","Python","Go"],
a:btoa("java"),cell:10},

{q:"How many bits are in an IPv4 address?",
options:["16","32","64","128"],
a:btoa("32"),cell:11},

{q:"Which Indian IT company started as a vegetable oil company?",
options:["Infosys","Wipro","TCS","HCL"],
a:btoa("wipro"),cell:12},

{q:"What type of electromagnetic waves does WiFi use?",
options:["Infrared","Microwaves","Radio waves","Gamma rays"],
a:btoa("radio waves"),cell:13},

{q:"What was the first computer virus?",
options:["Creeper","Morris Worm","Melissa","Brain"],
a:btoa("creeper"),cell:14},

{q:"Maximum length of a single post on Twitter/X?",
options:["140","200","280","500"],
a:btoa("280"),cell:15},

{q:"The Firefox logo actually represents which animal?",
options:["Fox","Panda","Red Panda","Wolf"],
a:btoa("red panda"),cell:16},

{q:"Approximately how much data exists in the digital universe today?",
options:["2.7 MB","2.7 GB","2.7 Zettabytes","2.7 TB"],
a:btoa("2.7 zettabytes"),cell:17},

{q:"Before being renamed Meta, what was the company originally known as?",
options:["SocialNet","Facebook Inc","Meta Labs","Connect Inc"],
a:btoa("facebook inc"),cell:18},

{q:"Identify the logo shown below",
image:"github.png",
options:["GitHub","Source Forge","Bitbucket","Azure"],
a:btoa("github"),cell:19},

{q:"ChatGPT is based on which architecture?",
options:["CNN","RNN","Transformer","Decision Tree"],
a:btoa("transformer"),cell:20}

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

document.addEventListener("keydown",function(e){

if(e.key==="F12") e.preventDefault();
if(e.ctrlKey && e.shiftKey && e.key==="I") e.preventDefault();
if(e.ctrlKey && e.shiftKey && e.key==="J") e.preventDefault();
if(e.ctrlKey && e.key==="U") e.preventDefault();

});

/* DEVTOOLS DETECTION */

setInterval(function(){

const threshold = 160;

if(
window.outerWidth - window.innerWidth > threshold ||
window.outerHeight - window.innerHeight > threshold
){
if(!gameFinished){
alert("Developer tools detected. Game submitted.");
finish();
}
}

},1000);

/* TAB SWITCH */

document.addEventListener("visibilitychange",function(){
if(document.hidden && !gameFinished){
alert("Tab switch detected. Game submitted.");
finish();
}
});

/* FULLSCREEN EXIT */

document.addEventListener("fullscreenchange",function(){
if(!document.fullscreenElement && !gameFinished && !showingBingo){
alert("Fullscreen exited. Game submitted.");
finish();
}
});

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

/* FIND TEAM ENTRY CREATED IN index.html */

const snapshot = await getDocs(collection(db,"leaderboard"));

snapshot.forEach((docData)=>{

if(docData.data().teamName.toLowerCase()===team.toLowerCase()){

teamDocId = docData.id;

}

});

if(teamDocId===null){
alert("Team not registered correctly");
return;
}

enterFullscreen();

document.getElementById("startScreen").style.display="none";
document.getElementById("gameArea").style.display="block";

showQuestion();
startTimer();

}

/* SHOW QUESTION */

function showQuestion(){

let q = shuffledQuestions[current];

let questionHTML = `<div class="questionText">${q.q}</div>`;

if(q.image){
questionHTML += `<img src="${q.image}" class="questionImage">`;
}

document.getElementById("question").innerHTML = questionHTML;

document.getElementById("questionNumber").innerText =
"Question "+(current+1)+" / 20";

let optionsHTML="";

q.options.forEach((opt,index)=>{

let checked = answers[current] === opt ? "checked" : "";

optionsHTML += `
<label class="optionItem">
<input type="radio" name="option" value="${opt}" ${checked} ${questionLocked[current]?"disabled":""}>
${String.fromCharCode(65+index)}. ${opt}
</label>
`;

});

document.getElementById("optionsContainer").innerHTML = optionsHTML;

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
finish();
}

},1000);

}

/* BINGO */

function triggerBingo(cells){

bingoAchieved=true;
showingBingo=true;

cells.forEach(c=>{
document.getElementById("cell"+c).classList.add("bingoGlow");
});

let msg=document.getElementById("bingoMessage");

msg.style.display="block";

setTimeout(()=>{
msg.style.display="none";
showingBingo=false;
},3000);

}

/* CHECK BINGO */

function checkBingo(){

if(bingoAchieved) return;

let active=[];

for(let i=1;i<=20;i++){
if(document.getElementById("cell"+i).classList.contains("active")){
active.push(i);
}
}

let rows=[[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20]];
let cols=[[1,6,11,16],[2,7,12,17],[3,8,13,18],[4,9,14,19],[5,10,15,20]];
let diagonals=[[1,7,13,19],[5,9,13,17]];

for(let r of rows){
if(r.every(x=>active.includes(x))){
triggerBingo(r);
return;
}
}

for(let c of cols){
if(c.every(x=>active.includes(x))){
triggerBingo(c);
return;
}
}

for(let d of diagonals){
if(d.every(x=>active.includes(x))){
triggerBingo(d);
return;
}
}

}

/* SAVE ANSWER */

function saveAnswer(){

if(questionLocked[current]) return;

let selected = document.querySelector('input[name="option"]:checked');

if(!selected){
alert("Select an option");
return;
}

let ans = selected.value.toLowerCase();

answers[current]=ans;
questionLocked[current]=true;

document.querySelectorAll('input[name="option"]').forEach(o=>{
o.disabled=true;
});

let correctAnswer = atob(shuffledQuestions[current].a);

if(ans === correctAnswer){

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

if(teamDocId!==null){

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
