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

/* CHECK DUPLICATE TEAM FROM FIREBASE */

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
alert("Team name already used. Choose another team name.");
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

/* EVENT TIMER */

function startEventTimer(){

timerInterval=setInterval(function(){

let minutes=Math.floor(totalEventTime/60);
let seconds=totalEventTime%60;

document.getElementById("eventTimer").innerText =
minutes+":"+(seconds<10?"0"+seconds:seconds);

totalEventTime--;

if(totalEventTime <= 0){

totalEventTime = 0;
clearInterval(timerInterval);
finish();

}

},1000);

}

/* FINISH GAME */

async function finish(){

if(!gameStarted) return;
if(gameFinished) return;

gameFinished=true;

clearInterval(timerInterval);

let team=localStorage.getItem("team");

let timeRemaining = Math.max(0,totalEventTime);
let totalTime = EVENT_DURATION - timeRemaining;

if(totalTime < 0) totalTime = 0;
if(totalTime > EVENT_DURATION) totalTime = EVENT_DURATION;

/* UPDATE FIREBASE */

if(teamDocId){

await updateDoc(doc(db,"leaderboard",teamDocId),{
score:score,
time:totalTime
});

}

document.getElementById("result").innerText=
"Submission successful. Thank you!";

setTimeout(function(){
window.location.href="completed.html";
},2000);

}
