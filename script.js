let team=localStorage.getItem("team");

document.getElementById("teamName").innerText="Team: "+team;

let board=document.getElementById("board");

for(let i=1;i<=25;i++){

let div=document.createElement("div");

div.className="cell";

div.innerText=i;

div.id="cell"+i;

board.appendChild(div);

}


const questions=[
{q:"Function calling itself",a:"recursion",cell:1},
{q:"Rules for communication between systems",a:"api",cell:2},
{q:"Internet based storage service",a:"cloud",cell:3},
{q:"Process of fixing errors",a:"debug",cell:4},
{q:"Programming language named after snake",a:"python",cell:5}
];


let current=0;
let score=0;

document.getElementById("question").innerText=questions[current].q;

function submitAnswer(){

let ans=document.getElementById("answer").value.toLowerCase().trim();

// check if answer is correct
if(ans==questions[current].a){

document.getElementById("cell"+questions[current].cell).classList.add("active");

score++;

}

// move to next question whether correct or wrong
current++;

if(current<questions.length){

document.getElementById("question").innerText=questions[current].q;

}else{

finish();

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
