document.addEventListener("DOMContentLoaded", function(){

let team = localStorage.getItem("team");

document.getElementById("teamName").innerText = "Team: " + team;

let board = document.getElementById("board");

// GAME TIMER START
let startTime = Date.now();

// CREATE 4 x 5 BINGO GRID (20 CELLS)
for(let i = 1; i <= 20; i++){

let div = document.createElement("div");

div.className = "cell";

div.innerText = i;

div.id = "cell" + i;

board.appendChild(div);

}

// QUESTIONS + ANSWERS
const questions = [

{q:"Function calling itself", a:"recursion", cell:1},

{q:"Rules for communication between systems", a:"api", cell:2},

{q:"Internet based storage service", a:"cloud", cell:3},

{q:"Process of fixing errors in a program", a:"debug", cell:4},

{q:"Programming language named after a snake", a:"python", cell:5},

{q:"Data structure used in BFS", a:"queue", cell:6},

{q:"Data structure used in DFS", a:"stack", cell:7},

{q:"Language used to style web pages", a:"css", cell:8},

{q:"Language used to structure web pages", a:"html", cell:9},

{q:"Short form of Structured Query Language", a:"sql", cell:10},

{q:"Brain of the computer", a:"cpu", cell:11},

{q:"Temporary memory of a computer", a:"ram", cell:12},

{q:"Permanent memory of a computer", a:"rom", cell:13},

{q:"Collection of interconnected computers", a:"network", cell:14},

{q:"Technology for secure communication online", a:"encryption", cell:15},

{q:"Technology connecting physical devices to internet", a:"iot", cell:16},

{q:"Program that translates source code to machine code", a:"compiler", cell:17},

{q:"Step-by-step procedure to solve a problem", a:"algorithm", cell:18},

{q:"A collection of data stored in rows and columns", a:"database", cell:19},

{q:"Process of converting encoded data back to original", a:"decoding", cell:20}

];

// SHUFFLE FUNCTION
function shuffle(array){

for (let i = array.length - 1; i > 0; i--){

const j = Math.floor(Math.random() * (i + 1));

[array[i], array[j]] = [array[j], array[i]];

}

return array;

}

// RANDOM QUESTION ORDER
let shuffledQuestions = shuffle([...questions]);

let current = 0;

let score = 0;

// SHOW FIRST QUESTION
document.getElementById("question").innerText = shuffledQuestions[current].q;

// SUBMIT ANSWER FUNCTION
window.submitAnswer = function(){

let ans = document.getElementById("answer").value.toLowerCase().trim();

if(ans === "") return;

// CHECK CORRECT ANSWER
if(ans === shuffledQuestions[current].a){

document.getElementById("cell" + shuffledQuestions[current].cell).classList.add("active");

score++;

}

// MOVE TO NEXT QUESTION
current++;

if(current < shuffledQuestions.length){

document.getElementById("question").innerText = shuffledQ





