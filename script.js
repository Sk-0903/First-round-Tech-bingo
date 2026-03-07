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
  appId: "1:614182283202:web:28679433283e05efb2585b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* SETTINGS */
const GAME_CODE = "keshav";
const EVENT_DURATION = 15 * 60;

let totalEventTime = EVENT_DURATION;
let timerInterval;

let current = 0;
let score = 0;
let gameStarted = false;
let gameFinished = false;
let teamDocId = null;

let answers = new Array(20).fill("");

/* QUESTIONS */
const questions = [
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

let shuffledQuestions = shuffle([...questions]);

/* PAGE LOAD */
document.addEventListener("DOMContentLoaded", () => {

  const team = localStorage.getItem("team");
  const teamNameEl = document.getElementById("teamName");
  if(teamNameEl && team){
    teamNameEl.innerText = "Team: " + team;
  }

  /* create bingo board */
  const board = document.getElementById("board");
  if(board){
    for(let i=1;i<=20;i++){
      const div=document.createElement("div");
      div.className="cell";
      div.id="cell"+i;
      div.innerText=i;
      board.appendChild(div);
    }
  }

  /* attach button events safely */
  const startBtn = document.getElementById("startBtn");
  if(startBtn) startBtn.addEventListener("click", checkCode);

  const nextBtn = document.getElementById("nextBtn");
  if(nextBtn) nextBtn.addEventListener("click", nextQuestion);

  const prevBtn = document.getElementById("prevBtn");
  if(prevBtn) prevBtn.addEventListener("click", prevQuestion);

  const saveBtn = document.getElementById("saveBtn");
  if(saveBtn) saveBtn.addEventListener("click", saveAnswer);

  const submitBtn = document.getElementById("submitGame");
  if(submitBtn) submitBtn.addEventListener("click", finish);
});

/* CHECK TEAM */
async function checkTeamExists(team){
  const snapshot = await getDocs(collection(db,"leaderboard"));
  let exists=false;
  snapshot.forEach(d=>{
    if(d.data().teamName.toLowerCase()===team.toLowerCase()){
      exists=true;
    }
  });
  return exists;
}

/* START GAME */
async function checkCode(){

  const inputCode=document.getElementById("startCode").value.trim().toLowerCase();

  if(inputCode !== GAME_CODE.toLowerCase()){
    alert("Wrong start code");
    return;
  }

  const team=localStorage.getItem("team");
  if(!team){
    alert("Team not found. Go back and enter team name.");
    return;
  }

  const exists = await checkTeamExists(team);
  if(exists){
    alert("Team already used");
    return;
  }

  const ref=await addDoc(collection(db,"leaderboard"),{
    teamName:team,
    score:0,
    time:0
  });

  teamDocId=ref.id;

  document.getElementById("startScreen").style.display="none";
  document.getElementById("gameArea").style.display="block";

  gameStarted=true;

  showQuestion();
  startTimer();
}

/* SHOW QUESTION */
function showQuestion(){
  document.getElementById("question").innerText = shuffledQuestions[current].q;
  document.getElementById("questionNumber").innerText = "Question "+(current+1)+" / 20";
}

/* TIMER */
function startTimer(){
  timerInterval=setInterval(()=>{
    let m=Math.floor(totalEventTime/60);
    let s=totalEventTime%60;
    document.getElementById("eventTimer").innerText = m+":"+(s<10?"0"+s:s);
    totalEventTime--;
    if(totalEventTime<=0) finish();
  },1000);
}

/* SAVE */
function saveAnswer(){
  let ans=document.getElementById("answer").value.trim().toLowerCase();
  answers[current]=ans;

  if(ans===shuffledQuestions[current].a){
    const cell=document.getElementById("cell"+shuffledQuestions[current].cell);
    if(cell) cell.classList.add("active");
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
    const submitBtn=document.getElementById("submitGame");
    if(submitBtn) submitBtn.style.display="block";
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
