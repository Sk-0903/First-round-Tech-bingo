import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
onSnapshot,
getDocs,
deleteDoc,
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

/* FORMAT TIME */

function formatTime(sec){

sec=parseInt(sec)||0;

let m=Math.floor(sec/60);
let s=sec%60;

return m+":"+(s<10?"0"+s:s);

}

/* REALTIME LEADERBOARD */

onSnapshot(collection(db,"leaderboard"),(snapshot)=>{

let teams=[];

snapshot.forEach((docData)=>{

let data=docData.data();

teams.push({
team:data.teamName,
score:data.score||0,
time:data.time||0
});

});

/* SORT */

teams.sort((a,b)=>{

if(b.score!==a.score) return b.score-a.score;

return a.time-b.time;

});

/* UPDATE PODIUM DATA */

document.getElementById("p1").innerText = teams[0]?.team || "---";
document.getElementById("p2").innerText = teams[1]?.team || "---";
document.getElementById("p3").innerText = teams[2]?.team || "---";

/* UPDATE TABLE */

let table=document.getElementById("board");
table.innerHTML="";

teams.forEach((team,index)=>{

let row=document.createElement("tr");

row.innerHTML=`

<td>${index+1}</td>
<td>${team.team}</td>
<td>${team.score}</td>
<td>${formatTime(team.time)}</td>
`;

table.appendChild(row);

});

});

/* SHOW RESULTS BUTTON */

window.showResults=function(){
document.getElementById("podium").style.display="flex";
}

/* RESET */

window.resetLeaderboard=async function(){

if(!confirm("Reset leaderboard?")) return;

let snapshot=await getDocs(collection(db,"leaderboard"));

snapshot.forEach((d)=>{
deleteDoc(doc(db,"leaderboard",d.id));
});

}
