var canvas = document.getElementById("game")
canvas.width  = window.innerWidth*2/3; // the width of the canvas
canvas.height = window.innerHeight; // the height of the canvas

var ctx = canvas.getContext("2d");

window.onresize = () => {
	canvas.width = window.innerWidth*2/3
	canvas.height = window.innerHeight
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
let winner = false; // variable that stores if ther is a winner
let tileList = []; // array that contains all the different tiles
let roadList = []; // array that contains all the different roads
let junctionList = []; // array that contains all the different junctions
let cardStack = []; // the left development cards

// store how far in the setup phase (placing initial buildings) the game is (set false if setup phase is done)
let setupPhase = "settlement";
let setupAmount = 0;
let builtSettlement = false;

let robberPlaced = false
let diceValueList = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
let fieldTypes = ["hills","hills","hills","forest","forest","forest","forest","mountains","mountains","mountains","fields","fields","fields","fields","pasture","pasture","pasture","pasture","desert"]
let tileConnections = [[1,3,4],[0,2,4,5],[1,5,6],[0,4,7,8],[0,1,3,5,8,9],[1,2,4,6,9,10],[2,5,10,11],[3,8,12],[3,4,7,9,12,13],[4,5,8,10,13,14],[5,6,9,11,14,15],[6,10,15],[7,8,13,16],[8,9,12,14,16,17],[9,10,13,15,17,18],[10,11,14,18],[12,13,17],[13,14,16,17],[14,15,17]]
let playerList = [];
let colorChoices = ["red","blue","white","yellow","green","brown"];
let gameStarted = false;
let dieResult = false;
let choosingBuilding = false;
var playerAmount = 0;

function createTileList(){
  robberPlaced = false
  tileList = []
  roadList = []
  junctionList = []
  let redNumberCheck = [];  
  let diceValueListCopy = [...diceValueList];
  let fieldTypesCopy = [...fieldTypes];
  let positions = [
    [[-3*Math.cos(Math.PI/6),-4.5],[-Math.cos(Math.PI/6),-4.5],[Math.cos(Math.PI/6),-4.5],[3*Math.cos(Math.PI/6),-4.5]],
    [[-4*Math.cos(Math.PI/6),-3],[-2*Math.cos(Math.PI/6),-3],[0,-3],[2*Math.cos(Math.PI/6),-3],[4*Math.cos(Math.PI/6),-3]],
    [[-5*Math.cos(Math.PI/6),-1.5],[-3*Math.cos(Math.PI/6),-1.5],[-Math.cos(Math.PI/6),-1.5],[Math.cos(Math.PI/6),-1.5],[3*Math.cos(Math.PI/6),-1.5],[5*Math.cos(Math.PI/6),-1.5]],
    [[-6*Math.cos(Math.PI/6),0],[-4*Math.cos(Math.PI/6),0],[-2*Math.cos(Math.PI/6),0],[0,0],[2*Math.cos(Math.PI/6),0],[4*Math.cos(Math.PI/6),0],[6*Math.cos(Math.PI/6),0]],
    [[-5*Math.cos(Math.PI/6),1.5],[-3*Math.cos(Math.PI/6),1.5],[-Math.cos(Math.PI/6),1.5],[Math.cos(Math.PI/6),1.5],[3*Math.cos(Math.PI/6),1.5],[5*Math.cos(Math.PI/6),1.5]],
    [[-4*Math.cos(Math.PI/6),3],[-2*Math.cos(Math.PI/6),3],[0,3],[2*Math.cos(Math.PI/6),3],[4*Math.cos(Math.PI/6),3]],
    [[-3*Math.cos(Math.PI/6),4.5],[-Math.cos(Math.PI/6),4.5],[Math.cos(Math.PI/6),4.5],[3*Math.cos(Math.PI/6),4.5]],
  ]
  let portTiles = [1,0,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1,0]
  let portsLeft = ["brick","lumber","ore","grain","wool","general","general","general","general"]
  let portRotations = [4,4,3,5,2,5,1,0,1]
  let c = Math.cos(Math.PI/6)
  let s = Math.sin(Math.PI/6)
  for(let y=0; y<positions.length; y++) {
    for(let x=0; x<positions[y].length; x++) {
      let rotation = 0
      let fieldType;
      let randomDiceValue = Math.floor(Math.random()*diceValueListCopy.length)
      let randomFieldType = Math.floor(Math.random()*fieldTypesCopy.length)   
      let tradeResource = false;
      if(y == 0 || x == 0 || y == positions.length-1 || x == positions[y].length-1) {
        fieldType = "water"
        if(portTiles.shift()) {
          fieldType = "port"
          rotation = portRotations.shift()
          let tradeIndex = Math.floor(Math.random()*portsLeft.length)
          
          tradeResource = portsLeft[tradeIndex]
          portsLeft.splice(tradeIndex,1)
        } else rotation=Math.floor(Math.random()*6)
      } else {
        randomDiceValue = Math.floor(Math.random()*diceValueListCopy.length)
        randomFieldType = Math.floor(Math.random()*fieldTypesCopy.length)    
        fieldType = fieldTypesCopy[randomFieldType];
      }
      let tileInfo = tileData[fieldType]
      let nx = c * positions[y][x][0] + s * positions[y][x][1]
      let ny = s * positions[y][x][0] - c * positions[y][x][1]
      tileList.push(new Tile(fieldType, (fieldType == "port" ? tradeResource : tileInfo.resource), ((tileInfo.resource && fieldType != "port") ? diceValueListCopy[randomDiceValue] : false), (fieldType == "port" ? tileInfo.img[tradeResource] : tileInfo.img), tileInfo.color, nx, ny, rotation))
      if(fieldType != "water" && fieldType != "port") {
        if(fieldType == "desert"){
          redNumberCheck.push(0) 
        } else {
          redNumberCheck.push(diceValueListCopy[randomDiceValue])
        }
        if(tileInfo.resource && fieldType != "port"){
          if(diceValueListCopy[randomDiceValue]==6 || diceValueListCopy[randomDiceValue] == 8){ // this if statement will prevent two red numbers being next to each other
            for(var i = 0; i<tileConnections[redNumberCheck.length-1].length;i++){
              if(tileConnections[redNumberCheck.length-1][i]<tileList.length){
                if(redNumberCheck[tileConnections[redNumberCheck.length-1][i]] == 6 || redNumberCheck[tileConnections[redNumberCheck.length-1][i]] == 8){
                  console.log("reset")
                  createTileList() // restarts the generation
                  return true;
                } 
              }
            }    
          }  
          diceValueListCopy.splice(randomDiceValue,1); 
        }
        fieldTypesCopy.splice(randomFieldType,1); 
      }
    }
  }
  cardStack = []
  for(let c in developmentCards) {
    let card = developmentCards[c]
    for(let i=0; i<card.amount; i++) cardStack.push(card)
  }
  cardStack = cardStack
                .map((value) => ({ value, s: Math.random() }))
                .sort((a, b) => a.s - b.s)
                .map(({ value }) => value)
  console.log(tileList)
  return true
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
    
    updateSidebar(turn)
    requestAnimationFrame(game) // start game loop  
  }
}

function showCards(p) {
  let player = playerList[p]
  // idk just show the cards or something
  let cardDiv = document.getElementById("cardDisplay")
  cardDiv.style.display = "block"
  
  // create the table
  cardDiv.innerHTML = "<h1>"+player.name+"'s Development Cards</h1>"+
                       "<table id='cardTable'><tr><th><h2>name</h2></th><th><h2>description</h2></th><th><h2>Use</h2></th></tr></table><br>"
  // create an element in the table for each card
  for(let c in player.developmentCards) {
    let card = player.developmentCards[c]
    
    let cardTr = document.createElement("TR")
    
    let td1 = document.createElement("TD")
    td1.innerHTML = card.name
    let td2 = document.createElement("TD")
    td2.innerHTML = card.desc
    let td3 = document.createElement("TD")
    
    let useBtn = document.createElement("BUTTON")
    useBtn.innerHTML = "Use Card"
    useBtn.onclick = function() {useCard(p, c)}
    
    td3.appendChild(useBtn)
    
    // add stuff to the table
    cardTr.appendChild(td1)
    cardTr.appendChild(td2)
    cardTr.appendChild(td3)
    document.getElementById("cardTable").appendChild(cardTr)
  }
  let closeBtn = document.createElement("BUTTON")
  closeBtn.innerHTML = "Close"
  closeBtn.onclick = function() {cardDiv.style.display = "none"}
  
  cardDiv.appendChild(closeBtn)
}

function useCard(p, index) {
  let player = playerList[p]
  console.log(p,index)
  document.getElementById("cardDisplay").style.display = "none"
  // use the card
  player.developmentCards[index].cardFunc(p)
  // remove the card from the player
  player.developmentCards.splice(index, 1)
}

// setup for player amount
const amountInput = document.getElementById("playerAmount")
amountInput.onchange=()=>{
  amountInput.value = Math.round(amountInput.value)
  if(amountInput.value < 1) amountInput.value = 1
  if(amountInput.value > 6) amountInput.value = 6
  // show the player in the list if it fits in the updated amount
  for(let i=1; i<=6; i++) {
    if(i<=amountInput.value) {
      document.getElementById("name"+i).style.display="table-row"
      document.getElementById("color"+i).style.display="table-row"
    } else {
      document.getElementById("name"+i).style.display="none"
      document.getElementById("color"+i).style.display="none"
    }
  }
}

function setupGame(){
  let playerAmount = amountInput.value
  let colorCheck = [];
  playerList = []
  // check for duplicate colors
  for(let i = 1; i<=playerAmount; i++){
    if(colorCheck.includes(document.getElementById("playerColor"+i).value)) {
      document.getElementById("errOutput").innerHTML = "You cannot have duplicate colors!" 
      return;
    }
    colorCheck.push(document.getElementById("playerColor"+i).value)
  }
  // set the color and name for each player
  for(let i = 1; i<=playerAmount; i++){
    let name = document.getElementById("playerName"+i).value
    let color = document.getElementById("playerColor"+i).value
    if(name.length < 1) name = "player " + i 
    playerList.push(new Player(name,color))
  }  
  gameStarted = createTileList(); // ends menu loop and starts game loop
  console.log(gameStarted)
}

function updateSidebar(turn,playerChange = true) {
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
    playerDiv.style.opacity = (p == turn ? "0.9" : "0.5")
  }
  if(playerChange){
    let currentPlayer = document.getElementById("playerInfo"+turn)
    currentPlayer.scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
  }
}

function game(){
  // draw everything
  ctx.clearRect(0,0,canvas.width,canvas.height)
  for(let t of tileList) t.draw()
  for(let r of roadList) r.draw()
  for(let j of junctionList) j.draw()
  
  requestAnimationFrame(game)  // restart game loop
}

function rollDie(){
  // roll a random number for both dice
  let redDice = Math.ceil(Math.random()*6)
  let yellowDice = Math.ceil(Math.random()*6)
  dieResult = redDice + yellowDice
  // show dice rolls in sidebar
  document.getElementById("redDice").innerHTML = redDice  
  document.getElementById("yellowDice").innerHTML = yellowDice
  document.getElementById("dieButton").disabled = true;
  document.getElementById("shopButton").disabled = false;  
  document.getElementById("endTurnButton").disabled = false;
  
  if(dieResult == 7){ // checks if something needs to be done with the robber
    let robbedPlayers = []
    let totalResources = 0;
    for(let player in playerList){
      totalResources = 0;
      for(let resource in playerList[player].resources){
        totalResources += playerList[player].resources[resource]
      }
      if(totalResources > 7){
        robbedPlayers.push([player, Math.floor(totalResources/2)])
      }
    }
    console.log(robbedPlayers)
  } else {
    // loop through all players and their building
    for(let player of playerList) {
      for(let building of player.buildings) {
        for(let resource of building.resources) {
          // if the number for the resource is rolled, give the player the resource.
          if(dieResult == resource.num && !building.robber) {
            player.resources[resource.type] += 1 + +(building.building == "city") // give 2 of the resource if the building is a city
          }
        }
      }
    }
  }
  updateSidebar(turn)
}

function showShop(show){
  // enable or disable shop screen
  if(show){
    document.getElementById("diceRoll").style.display="none"
    document.getElementById("shop").style.display="block"
    for(var r in playerList[turn].resources){
      document.getElementById(r+"Amount").innerHTML = playerList[turn].resources[r];
    }
  } else {
    document.getElementById("diceRoll").style.display="block"
    document.getElementById("shop").style.display="none"
  }
}

function winCheck(){
  if(playerList[turn].points >= 10){
    console.log("winner winner chicken dinner")
  } else {
    console.log("no winner")
  }
}

function endTurn() {
  // increment turn and update sidebar stuff
  turn = (turn+1)%playerList.length
  updateSidebar(turn)
  document.getElementById("dieButton").disabled = false;
  document.getElementById("shopButton").disabled = true;  
  document.getElementById("endTurnButton").disabled = true;
  document.getElementById("cardDisplay").style.display = "none"
}

function buy(item) {
  let cost = buyData[item].cost
  let canBuy = true;
  for(let r in cost) {
    if(playerList[turn].resources[r] < cost[r]) canBuy = false;
  }
  if(canBuy) {
    if(item == "developmentCard") {
      // remove the items from the player
      let cost = buyData[item].cost
      for(let r in cost) playerList[turn].resources[r] -= cost[r]
      updateSidebar(turn)
      // give the card to the player
      playerList[turn].developmentCards.push(cardStack.shift())
    } else if(playerList[turn][item+"Left"] > 0) {
      // if the player has any of the building left, wait for them to place it
      choosingBuilding = item
      document.getElementById("buildingType").innerHTML = item
      document.getElementById("buyData").style.display="block"
      document.getElementById("shop").style.display="none"
    }
    
  }
  
  console.log(canBuy)
}

function cancelBuild() {
  choosingBuilding = false;
  document.getElementById("buyData").style.display="none"
  document.getElementById("shop").style.display="block"
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