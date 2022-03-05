var canvas = document.getElementById("game")
canvas.width  = window.innerWidth*2/3; // the width of the canvas
canvas.height = window.innerHeight; // the height of the canvas

var ctx = canvas.getContext("2d");

window.onresize = () => {
	canvas.width = window.innerWidth*2/3
	canvas.height = window.innerHeight
}

window.onload=()=>{
  canvas.addEventListener('wheel', zoom)
  canvas.addEventListener('click', click)
}


let zoomLevel = 1;

let numImage = new Image()
numImage.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/number_tem_plate.png"
let robberImage = new Image()
robberImage.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/image-removebg-preview%20(3).png?v=1642596709206"

/* important game variables */
let longestRoadPlayer = false; // which player has the longest road, false cus no player has a road of atleast 5 long
let largestArmyPlayer = false; // which player has the largest army, false cus noone has the largest army at the beginning
let rolling = true; // whether the player still has to roll or not
let turn = 0; // variable that shows which player's turn it is
let winner = false; // variable that stores if there is a winner
let tileList = []; // array that contains all the different tiles
let roadList = []; // array that contains all the different roads
let junctionList = []; // array that contains all the different junctions
let cardStack = []; // the left development cards

// variables that keep track of stuff for development cards
let addResources = 0
let buyFreeRoads = 0

// store how far in the setup phase (placing initial buildings) the game is (set false if setup phase is done)
let setupPhase = "settlement";
let setupAmount = 0;
let builtSettlement = false;
let robberPlaced = false
let diceValueList = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
let fieldTypes = ["hills","hills","hills","forest","forest","forest","forest","mountains","mountains","mountains","fields","fields","fields","fields","pasture","pasture","pasture","pasture","desert"]
let tileConnections = [[1,3,4],[0,2,4,5],[1,5,6],[0,4,7,8],[0,1,3,5,8,9],[1,2,4,6,9,10],[2,5,10,11],[3,8,12],[3,4,7,9,12,13],[4,5,8,10,13,14],[5,6,9,11,14,15],[6,10,15],[7,8,13,16],[8,9,12,14,16,17],[9,10,13,15,17,18],[10,11,14,18],[12,13,17],[13,14,16,17],[14,15,17]]
let playerList = [];
let aiList = [];
let colorChoices = ["red","blue","white","yellow","green","brown"];
let gameStarted = false;
let dieResult = false;
let choosingBuilding = false;
var playerAmount = 0;
let robbedPlayers = [];
let newRobberLocation = false;
let stealResource = false;
let tradeAcceptingPlayer = false;
let win = false;
turnCount = 0
let lastChangeCounter = 0;
let lastChangeBuildingsLeft = false;
let resourceBank = {
  lumber:19,
  wool:19,
  ore:19,
  brick:19,
  grain:19
}

requestAnimationFrame(menu) // start menu loop
/* player names and settings will be chosen in this loop */
function menu(){
  ctx.clearRect(0,0,canvas.width,canvas.height) 
  ctx.font = "100px Arial";
  ctx.fillStyle = "black"
  ctx.textAlign = "center";
  //ctx.fillText("Web Catan", canvas.width/2, 120);
  if(!gameStarted){
    requestAnimationFrame(menu) // restarts menu loop
  } else {
    document.getElementById("menu").style.display = "none"
    document.getElementById("sidebar").style.display = "block"
    createPlayerInfo()
    if(playerList[0].ai){
      aiList[0].startTurn()
    }
    updateSidebar(turn)
    requestAnimationFrame(game) // start game loop  
  }
}

function updateSidebar(turn,playerChange = false) {
  for(let p in playerList) {
    let player = playerList[p]
    let playerDiv = document.getElementById("playerInfo"+p)
    document.getElementById("playerPoints"+p).innerHTML = player.points
    
    playerDiv.resources.innerHTML = ""
    for(let r in player.resources) {
      playerDiv.resources.innerHTML += r + ": " + player.resources[r] + "<br>"
    }
    
    playerDiv.rightDiv.style.display = (turn == p ? "block" : "none")
    playerDiv.style.height = (p == turn ? "50%" : "30%")
    playerDiv.style.backgroundColor = (p== turn? player.color.substring(0, player.color.length - 1) + ",0.9)" : player.color.substring(0, player.color.length - 1) + ",0.5)")
  }
  if(playerChange){
    let currentPlayer = document.getElementById("playerInfo"+turn)
    currentPlayer.scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
    if(playerList[turn].ai && setupPhase){
      setTimeout(function() {
      //console.log(aiList.find(ai => ai.i == turn))
      aiList.find(ai => ai.i == turn).startTurn()
      }, 10)
      // console.log()
      // playerList[turn].ai.startTurn()
    }
  }
}

function game(){
  // draw everything
  ctx.clearRect(0,0,canvas.width,canvas.height)
  for(let t of tileList) t.draw()
  for(let r of roadList) r.draw()
  for(let j of junctionList) j.draw()
  
  if(gameStarted) requestAnimationFrame(game)  // restart game loop
}

function rollDie(){
  // roll a random number for both dice
  let redDice = Math.ceil(Math.random()*6)
  let yellowDice = Math.ceil(Math.random()*6)
  soundEffect("https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/353975__nettimato__rolling-dice-1.wav?v=1643480529229")
  dieResult = redDice + yellowDice
  // show dice rolls in sidebar
  document.getElementById("redDice").innerHTML = redDice  
  document.getElementById("yellowDice").innerHTML = yellowDice
  disableButtons(false, "dieButton")
  /*
  document.getElementById("dieButton").disabled = true;
  document.getElementById("shopButton").disabled = false;  
  document.getElementById("endTurnButton").disabled = false;
  document.getElementById("bankTrade").disabled = false;
  document.getElementById("tradeWithPlayers").disabled = false;*/
  if(dieResult == 7){ // checks if something needs to be done with the robber
    robberActions()
  } else {
    let resourcePayout = {
      lumber:0,
      wool:0,
      ore:0,
      brick:0,
      grain:0
    }
    // loop through all players and their building checking if there is enough in the bank   
    for(let player of playerList) {
      for(let building of player.buildings) {
        for(let resource of building.resources) {
          // if the number for the resource is rolled, give the player the resource.
          if(dieResult == resource.num && !building.robber) {
            resourcePayout[resource.type] += 1 + +(building.building == "city")
          }
        }
      }
    }
    //console.log(resourcePayout)
    // loop through all players and their building paying out the resource
    for(let player of playerList) {
      for(let building of player.buildings) {
        for(let resource of building.resources) {
          // if the number for the resource is rolled, give the player the resource.
          if(dieResult == resource.num && !building.robber) {
            if(resourcePayout[resource.type]<=resourceBank[resource.type]){
              player.resources[resource.type] += 1 + +(building.building == "city") // give 2 of the resource if the building is a city
              resourceBank[resource.type] -= 1 - -(building.building == "city") 
              resourcePayout[resource.type] -= 1 - -(building.building == "city")
              updateResourcesInBank()
            } else {
              console.log("not enough resources")
            }
          }
        }
      }
    }
  }
  updateSidebar(turn)
}

function playerSteals(victim,totalResources){
  if(totalResources!=0){
    let stolenResource = Math.ceil(Math.random()*totalResources)
    for(let r in playerList[victim].resources){
      stolenResource -= playerList[victim].resources[r]
      if(stolenResource <=0){
        playerList[victim].resources[r] -=1
        playerList[turn].resources[r] += 1
        break;
      }
    }
  }
  disableButtons(false)
  /*
  document.getElementById("shopButton").disabled = false;  
  document.getElementById("endTurnButton").disabled = false;
  document.getElementById("bankTrade").disabled = false;
  document.getElementById("tradeWithPlayers").disabled = false;
  document.getElementById("playerCards"+turn).disabled = false; */
  document.getElementById("informationDisplay").style.display = "none"  
  updateSidebar(turn)
}

function winCheck(){
  if(playerList[turn].points >= 10){
    console.log("winner winner chicken dinner")
    if(aiList.length != playerList.length){
      document.getElementById("winnerPlayer").innerHTML = playerList[turn].name
      document.getElementById("winnerPlayer").style.color = playerList[turn].color
      document.getElementById("winnerDisplay").style.display = "block"
    }
    win = true
    disableButtons(true)
    // document.getElementById("shopButton").disabled = false;  
    // document.getElementById("endTurnButton").disabled = false;
    // document.getElementById("bankTrade").disabled = false;
    // document.getElementById("tradeWithPlayers").disabled = false;
    // document.getElementById("playerCards"+turn).disabled = false;
  } else {
    //console.log("no winner")
  }
}

function disableButtons(disable, exception = false){
  if(playerList[turn].ai){ // prevents clickable buttons when bot is playing
    disable = true
  }
  document.getElementById("shopButton").disabled = disable;  
  document.getElementById("endTurnButton").disabled = disable;
  document.getElementById("bankTrade").disabled = disable;
  document.getElementById("tradeWithPlayers").disabled = disable;
  document.getElementById("playerCards"+turn).disabled = disable;
  if(exception && !playerList[turn].ai){
    document.getElementById(exception).disabled = !disable;
  }
}

function endTurn() {
  updateLongestRoad()
  // increment turn and update sidebar stuff
  turn = (turn+1)%playerList.length
  updateSidebar(turn, true)
  disableButtons(true, "dieButton")
  /*
  document.getElementById("dieButton").disabled = false;
  document.getElementById("shopButton").disabled = true;  
  document.getElementById("endTurnButton").disabled = true;
  document.getElementById("bankTrade").disabled = true;
  document.getElementById("tradeWithPlayers").disabled = true; */
  turnCount++
  if(!win && aiList.length == playerList.length && turnCount > 1000) {
    aiList.sort((a,b) => playerList[b.i].points- playerList[a.i].points)
    let aiListCopy = [...aiList]
    resetGame(false)
    setupGame(aiListCopy)
  }
  
  document.getElementById("informationDisplay").style.display = "none"
  if(playerList[turn].ai && !win){
    setTimeout(function() {
    //console.log(aiList.find(ai => ai.i == turn))
    aiList.find(ai => ai.i == turn).startTurn()
    }, 10)
    // console.log()
    // playerList[turn].ai.startTurn()
  } else  if(win){
    if(playerList.length == aiList.length){
      aiList.sort((a,b) => playerList[b.i].points- playerList[a.i].points)
      let aiListCopy = [...aiList]
      
      resetGame(false)
      console.log(aiListCopy)
      setupGame(aiListCopy)
    }
  }
}

function soundEffect(sound){
  var audio = new Audio(sound);
  audio.volume = .6;
  audio.play();
}

function updateResourcesInBank(){
  for(let r in resourceBank){
    document.getElementById(r+"InBank").innerHTML = resourceBank[r]
  }
}



// Find distance from point to line segment
// https://gist.github.com/mattdesl/47412d930dcd8cd765c871a65532ffac
// p - point; v - start point of segment; w - end point of segment
function distToSegment (p, v, w) {
  let dist2 = (v, w) => (v[0] - w[0])**2 + (v[1] - w[1])**2;
  let l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]))
}

// reset the game
function resetGame(showMenu=true) {
  gameStarted = false;
  
  /* reset important game variables */
  longestRoadPlayer = false;
  largestArmyPlayer = false;
  rolling = true;
  turn = 0;
  winner = false;
  tileList = [];
  roadList = [];
  junctionList = [];
  cardStack = [];
  
  // variables that keep track of stuff for development cards
  addResources = 0
  buyFreeRoads = 0

  // store how far in the setup phase (placing initial buildings) the game is (set false if setup phase is done)
  setupPhase = "settlement";
  setupAmount = 0;
  builtSettlement = false;
  robberPlaced = false
  diceValueList = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
  fieldTypes = ["hills","hills","hills","forest","forest","forest","forest","mountains","mountains","mountains","fields","fields","fields","fields","pasture","pasture","pasture","pasture","desert"]
  tileConnections = [[1,3,4],[0,2,4,5],[1,5,6],[0,4,7,8],[0,1,3,5,8,9],[1,2,4,6,9,10],[2,5,10,11],[3,8,12],[3,4,7,9,12,13],[4,5,8,10,13,14],[5,6,9,11,14,15],[6,10,15],[7,8,13,16],[8,9,12,14,16,17],[9,10,13,15,17,18],[10,11,14,18],[12,13,17],[13,14,16,17],[14,15,17]]
  playerList = [];
  aiList = [];
  colorChoices = ["red","blue","white","yellow","green","brown"];
  gameStarted = false;
  dieResult = false;
  choosingBuilding = false;
  playerAmount = 0;
  robbedPlayers = [];
  newRobberLocation = false;
  stealResource = false;
  win = false;
  turnCount = 0
  lastChangeCounter = 0;
  lastChangeBuildingsLeft = false;
  resourceBank = {
    lumber:19,
    wool:19,
    ore:19,
    brick:19,
    grain:19
  }
  
  if(showMenu){
    document.getElementById("menu").style.display = "block"
    document.getElementById("sidebar").style.display = "none"
    document.getElementById("winnerDisplay").style.display = "none"  
    requestAnimationFrame(menu)
  }
}
