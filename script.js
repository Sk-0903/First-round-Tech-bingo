let team=localStorage.getItem("team");

document.getElementById("teamName").innerText="Team: "+team;

const boardWords=[
"recursion","api","cloud","debug","python",
"stack","git","binary","html","css",
"algorithm","loop","ai","compiler","linux",
"java","sql","iot","cache","kernel",
"encryption","data","network","array","pointer"
];

const questions=[
{q:"Function calling itself",a:"recursion"},
{q:"Rules for communication between systems",a:"api"},
{q:"Internet based storage service",a:"cloud"},
{q:"Process of fixing errors",a:"debug"},
{q:"Programming language named after snake",a:"python"}
];

let current=0;
let score=0;

document.getElementById("question").innerText=questions[current].q;

let board=document.getElementById("board");

boardWords.forEach(word=>{
let div=document.createElement("div");
div.className="cell";
div.innerText=word;
div.id=word;
board.appendChild(div);
});

function submitAnswer(){

let ans=document.getElementById("answer").value.toLowerCase();

if(ans==questions[current].a){

document.getElementById(ans).classList.add("active");

score++;

current++;

if(current<questions.length){

document.getElementById("question").innerText=questions[current].q;

}else{

finish();

}

}

document.getElementById("answer").value="";

}

function finish(){

let data={
team:team,
score:score
};

fetch("https://script.google.com/macros/s/AKfycbwsaD9xHPt_DwKhFwJ8fdtJde0iHezFcXVi5mx8XLnw4TVRKRBYnYsqMblp0isB71GqCA/exec",{

method:"POST",

body:JSON.stringify(data)

});

document.getElementById("result").innerText="Score Submitted!";

}
