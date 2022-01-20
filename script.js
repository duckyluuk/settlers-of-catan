var canvas = document.getElementById("game")
canvas.width  = window.innerWidth*2/3; // the width of the canvas
canvas.height = window.innerHeight; // the height of the canvas

var ctx = canvas.getContext("2d");

window.onresize = () => {
	canvas.width = window.innerWidth*2/3
	canvas.height = window.innerHeight
}

let zoomLevel = 1;

class Player {
  constructor(name,color){
    this.name = name; // stores the name of the player
    this.color = color; // stores the color of a player    
    this.materials = // stores the amount of resources a player has
    {
      lumber:0,
      wool:0,
      ore:0,
      brick:0,
      grain:0
    }
    this.totalResources = 0; // stores the total amount of resources a player has
    this.developmentCards = []; // stores all the development cards a player has
    this.roads = []; // stores the roads owned by a player
    this.buildings = []; // stores the junctions owned by a player
    this.maritimeTrades = [];// more favorible trades at the side of the board
    this.citiesInHand = 4; // the total amount of cities a player can put on the board
    this.settelmentsInHand = 5; // the total amount of settelments a player can put on the board
    this.roadsInHand = 15; // the total amount of roads a player can put on the board
    this.longestRoad = 0; // stores how long their longest road is
    this.longestRoadHolder = false; // stores whether or not the player is the one with the longest road
    this.armySize = 0; // size of a players army needed for the biggest army card worth 2 points
    this.biggestArmyHolder = false; // stores whether or not the player is the one with the biggest army
    this.points = 0; // stores the total amount of points a player has
  }
}

let numImage = new Image()
numImage.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/number_tem_plate.png"
let robberImage = new Image()
robberImage.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/image-removebg-preview%20(3).png?v=1642596709206"

class Tile{
  constructor(name,resource,dice,img,color,x,y,rot){
    this.x = x // position of the tile
    this.y = y // position of the tile
    this.rot = rot*Math.PI/3 // rotation of the tile
    this.name = name // stores the tile name
    this.img = new Image()
    this.img.src = img // stores the image that will be used to show the tile
    this.color = color // just for testing fase, probably will be removed later
    this.resource = resource // stores the resource that the field gives when its value is roled on the dice
    this.dice = dice // what number has to be rolled for this field to give away resources  
    this.robber = false; // stores whether the robber is on this tile
    
    if(name == "desert" && !robberPlaced) {
      this.robber = true;
      robberPlaced = true;
    }
    
    //setup stuff for adjacent roads/junctions
    let points = []
    let a = Math.PI/3
    for(let i=0; i<6; i++) {
      points.push([Math.round((Math.cos(a * i)+x)*100000)/100000,Math.round((Math.sin(a * i)+y)*100000)/100000])
    }
    for(let p in points) {
      p=+p
      let tradeResource = resource
      let point = points[p]
      let nextPoint = (p+1 < points.length ? points[p+1] : points[0])
      let floor = (name == "water" || name == "port" ? "water" : "land")
      if(name == "port") {
        let r1 = rot+1
        let r2 = rot+2
        if(r1 >= 6) r1-=6
        if(r2 >= 6) r2-=6
        if(p == r1 || p == r2) {} else tradeResource = false
      }
      let existJunction = junctionList.find(j => (j.x == point[0] && j.y == point[1]))
      if(existJunction) {
        if(!existJunction.floorType.includes(floor)) existJunction.floorType.push(floor)
        if(name == "port" && tradeResource) existJunction.tradeResources.push(tradeResource)
        else if(name != "water") existJunction.resources.push({type: resource, num: dice})
      } else junctionList.push(new Junction(point[0],point[1], floor, (name == "port" ? false : {type: resource, num: dice}), (name == "port" ? tradeResource : false)))
      
      
      let existRoad = roadList.find(r => (
                             [r.x1, r.x2].includes(point[0]) && [r.x1, r.x2].includes(nextPoint[0]) && 
                             [r.y1, r.y2].includes(point[1]) && [r.y1, r.y2].includes(nextPoint[1])
                      )) 
      if(existRoad) {
        if(!existRoad.floorType.includes(floor)) existRoad.floorType.push(floor)
      } else roadList.push(new Road(point[0],point[1],nextPoint[0],nextPoint[1], floor))
    }
  }
  draw() {
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel
    let rot = this.rot
    let x = this.x*scl
    let y = this.y*scl

    let w = (Math.cos(0)-Math.cos(Math.PI))*scl
    let h = (Math.sin(60*Math.PI/180)-Math.sin(240*Math.PI/180))*scl

    let image = this.img

    ctx.save()
    ctx.translate(x+canvas.width/2,y+canvas.height/2)

    if(rot) ctx.rotate(rot)
    let nr = scl*0.6
    ctx.drawImage(image, -0.5*w, -0.5*h, w, h)
    if(this.dice) {
      if(rot) ctx.rotate(-rot)
      ctx.drawImage(numImage,-nr/2,-nr/2,nr,nr)
      nr = scl*0.7*(1/Math.sqrt(Math.abs(7-this.dice)))
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = (this.dice == 6 || this.dice == 8 ? "#ff0000" : "#000000")
      ctx.font = nr*0.8 + 'px serif';
      ctx.fillText(this.dice, 0, 0.03*nr)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
    if(this.robber){
      ctx.drawImage(robberImage,-0.5*w, -0.65*h, w, h)
    }
    ctx.restore()
  }
}

class Road {
  constructor(sx, sy, fx, fy, floor) {
    this.x1 = sx
    this.y1 = sy
    this.x2 = fx
    this.y2 = fy
    
    let cx = (sx+fx)/2
    let cy = (sy+fy)/2
    
    this.p1 = [(sx-cx)*0.6+cx,(sy-cy)*0.6+cy]
    this.p2 = [(fx-cx)*0.6+cx,(fy-cy)*0.6+cy]
    
    this.player = false 
    this.floorType = [floor] //land/water
  } 
  draw() { 
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let x1 = this.p1[0]*scl + canvas.width/2
    let y1 = this.p1[1]*scl + canvas.height/2
    let x2 = this.p2[0]*scl + canvas.width/2
    let y2 = this.p2[1]*scl + canvas.height/2
    
    if(this.player||this.player===0){
      ctx.strokeStyle = playerList[this.player].color
      ctx.lineWidth = scl*0.2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }
  checkClickCollision(clickX, clickY) {
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let p1 = [this.p1[0]*scl+ canvas.width/2,this.p1[1]*scl+ canvas.height/2]
    let p2 = [this.p2[0]*scl+ canvas.width/2,this.p2[1]*scl+ canvas.height/2]
    if(distToSegment([clickX, clickY],p1,p2) < 0.1*scl) {
      return true;
    } else return false;
  }
}

class Junction {
  constructor(x,y,floor,resource,tradeResource) {
    this.x = x
    this.y = y
    this.player = false
    this.building = false
    
    this.floorType = [floor] //land/water
    this.resources = []
    this.tradeResources = []
    if(resource && resource.type) this.resources.push(resource)
    if(tradeResource) this.tradeResources.push(tradeResource)
  }
  draw() {
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let x = this.x*scl + canvas.width/2
    let y = this.y*scl + canvas.height/2
    // console.log(this.player)
    if(this.player||this.player===0){
      if(this.building=="settlement"){
        ctx.strokeStyle = playerList[this.player].color
      } else {
        ctx.fillStyle = playerList[this.player].color
      }
      ctx.lineWidth = 0.05*scl
      ctx.beginPath();      
      ctx.arc(x, y, scl*0.175, 0, 2*Math.PI);
      ctx.stroke();
      if(this.building=="city"){
        ctx.fill()
      }
    }
    
  }
  checkClickCollision(clickX, clickY) {
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let x = this.x*scl + canvas.width/2
    let y = this.y*scl + canvas.height/2
    
    let r = scl*0.175
    if(Math.sqrt(Math.abs(x-clickX)**2+Math.abs(y-clickY)**2) < r) {
      return true;
    } else return false;
  }
}

var buyData = { // contains the costs of everything that can be bought
  road : {
    name: "road",
    cost : {
      brick: 1,
      lumber: 1
    }
  },
  settelment : {
    name: "settelment",
    cost : {
      brick: 1,
      lubmer: 1,
      wool: 1,
      grain:1,
    }
  },
  city : {
    name: "city",
    cost: {
      grain : 2,
      ore : 3
    }
  },
  developmentCard : {
    name: "developmentCard",
    cost: {
      wool : 1,
      grain : 1,
      ore : 1
    }
  }
}

var tileData = {
  hills: {
    resource: "brick",
    img: "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/brick_tile.png",
    color: "red"
  },
  forest : {
    resource: "lumber",
    img: "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/lumber_tile.png",
    color: "green"
  },
  mountains: {
    resource: "ore",
    img: "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/ore_tile.png",
    color: "grey"
  },
  fields: {
    resource: "grain",
    img: "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/wheat_tile.png",
    color: "yellow"
  },
  pasture: {
    resource: "wool",
    img: "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/sheep_tile.png",
    color: "lightgreen"
  },
  desert: {
    resource: false,
    img: "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/desert_tile.png",
    color: "rgb(247,244,216)"
  },
  water: {
    resource: false,
    img: "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/ocean_tile.png",
    color: "aqua"
  },
  port: {
    resource: false,
    img: {
      "brick": "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_brick_tile.png",
      "lumber": "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_lumber_tile.png",
      "ore": "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_ore_tile.png",
      "grain": "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_wheat_tile.png",
      "wool": "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_sheep_tile.png",
      "general": "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_general_tile.png"
    },
    color: "blue"
  }
}

var developmentCards = {
  knightCard : {
    desc : "Move the robber. Steal one resource from the owner of a settlement or city adjecent to the robber's new hex",
    amount: 14,
    immediatelyPlayable: false,
    img :false
  },
  roadBuildingCard : {
    desc : "Place 2 new roads as if you had just built them",
    amount: 2,
    immediatelyPlayable: false,
    img : false
  },
  yearOfPlentyCard : {
    desc : "Take any 2 resources from the bank. Add them to your hand. They can be 2 of the same resource or 2 different resources",
    amount: 2,
    immediatelyPlayable: false,
    img : false    
  },
  monopolyCard : {
    desc : "When you play this card announce 1 type of resource. All other players must give you all of their resources of that type",
    amount: 2,
    immediatelyPlayable: false,
    img : false    
  },
  victoryPointCard : {
    desc : "Reveal this card on your turn if, with it, you reach the number of points required for victory",
    amount: 5,
    immediatelyPlayable: true,
    img : false    
  }
}

/* important game variables */
let longestRoadPlayer = false; // which player has the longest road, false cus no player has a road of atleast 5 long
let largestArmyPlayer = false; // which player has the largest army, false cus noone has the largest army at the beginning
let rolling = true; // whether the player still has to roll or not
let turn = 0; // variable that shows which player's turn it is
let winner = false; // variable that stores if ther is a winner
let tileList = []; // array that contains all the different tiles
let roadList = []; // array that contains all the different roads
let junctionList = []; // array that contains all the different junctions

let robberPlaced = false
let diceValueList = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
let fieldTypes = ["hills","hills","hills","forest","forest","forest","forest","mountains","mountains","mountains","fields","fields","fields","fields","pasture","pasture","pasture","pasture","desert"]
let tileConnections = [[1,3,4],[0,2,4,5],[1,5,6],[0,4,7,8],[0,1,3,5,8,9],[1,2,4,6,9,10],[2,5,10,11],[3,8,12],[3,4,7,9,12,13],[4,5,8,10,13,14],[5,6,9,11,14,15],[6,10,15],[7,8,13,16],[8,9,12,14,16,17],[9,10,13,15,17,18],[10,11,14,18],[12,13,17],[13,14,16,17],[14,15,17]]
let playerList = [];
let colorChoices = ["red","blue","white","yellow","green","brown"];
let gameStarted = false;
let dieResult = false;
let choosingBuilding = "settlement";
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
  ctx.fillText("Web Catan", canvas.width/2, 120);
  if(!gameStarted){
    requestAnimationFrame(menu) // restarts menu loop
  } else {
    document.getElementById("menu").style.display = "none"
    document.getElementById("sidebar").style.display = "block"
    for(let p in playerList){ 
      let player = playerList[p]
      let playerDiv = document.createElement("DIV")
      playerDiv.id="playerInfo"+p
      playerDiv.style.width = "80%"
      playerDiv.style.backgroundColor = player.color
      playerDiv.style.position = "relative"
      playerDiv.style.opacity = "0.5"
      playerDiv.style.border = "5px solid black"
      playerDiv.style.height = "20%"
      playerDiv.style.color = "black"
      playerDiv.style.marginLeft = "auto"
      playerDiv.style.marginRight = "auto"
      playerDiv.style.marginTop = "3%"
      playerDiv.style.marginBottom = "3%"
      playerDiv.style.paddingLeft = "3%"
      playerDiv.style.paddingRight = "3%"
      playerDiv.innerHTML = "<h3>"+player.name+"</h3><br>Points: "+player.points      
      document.getElementById("playerInfo").appendChild(playerDiv)
    }
    updateSidebar(turn)
    requestAnimationFrame(game) // start game loop  
  }
}

const amountInput = document.getElementById("playerAmount")
amountInput.onchange=()=>{
  amountInput.value = Math.round(amountInput.value)
  if(amountInput.value < 3) amountInput.value = 3
  if(amountInput.value > 6) amountInput.value = 6
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
  
  for(let i = 1; i<=playerAmount; i++){
    if(colorCheck.includes(document.getElementById("playerColor"+i).value)) {
      document.getElementById("errOutput").innerHTML = "You cannot have duplicate colors!" 
      return;
    }
    colorCheck.push(document.getElementById("playerColor"+i).value)
  }
  for(let i = 1; i<=playerAmount; i++){
    let name = document.getElementById("playerName"+i).value
    let color = document.getElementById("playerColor"+i).value
    if(name.length < 1) name = "player " + i 
    playerList.push(new Player(name,color))
  }  
  gameStarted = createTileList(); // ends menu loop and starts game loop
  console.log(gameStarted)
}

function updateSidebar(turn) {
  for(let p in playerList) {
    let player = playerList[p]
    let playerDiv = document.getElementById("playerInfo"+p)
    playerDiv.style.height = (p == turn ? "30%" : "20%")
    playerDiv.style.opacity = (p == turn ? "0.9" : "0.5")
  }
}

function game(){
  ctx.clearRect(0,0,canvas.width,canvas.height)
  for(let t of tileList) t.draw()
  for(let r of roadList) r.draw()
  for(let j of junctionList) j.draw()
  
  requestAnimationFrame(game)  // restart game loop
}

canvas.addEventListener('wheel', function(e) {
    if(e.deltaY < 0) zoomLevel += 0.05
    if(e.deltaY > 0) zoomLevel -= 0.05
    if(zoomLevel < 0.5) zoomLevel = 0.5
    if(zoomLevel > 2) zoomLevel = 2
})

canvas.addEventListener('click', function(e) {
  let clicked = false;
  for(let j of junctionList) {
    let canBuild = false;
    // check if a junction is clicked
    if(j.checkClickCollision(e.offsetX, e.offsetY)) {
      clicked = {type: "junction", info: j}
      // find the junctions close to this junction
      let attachedRoads = roadList.filter(r => (r.x1 == j.x && r.y1 == j.y) || (r.x2 == j.x && r.y2 == j.y))
      let closeJunctions = []
      for(let road of attachedRoads) {
        // allow the player to build if there's a road owned by that player next to it
        // THIS WONT WORK FOR SETUP PHASE
        // SO IT NEEDS TO BE ADJUSTED LATER
        // BUT IT WORKS FOR NOW
        // SO WE'LL TEMPORARILY LEAVE IT
        if(road.player === turn) canBuild = true;
        closeJunctions.push(junctionList.find(j => j.x == road.x1 && j.y == road.y1))
        closeJunctions.push(junctionList.find(j => j.x == road.x2 && j.y == road.y2))
      }
      // check if there are any settlements too close to the clicked junction
      for(let closeJunction of closeJunctions.filter(junc => junc!=j)) {
        if(closeJunction.player || closeJunction.player===0) canBuild = false
      }
      if(canBuild) {
        if(choosingBuilding){
          if(!j.player&&j.player!==0){
            if(j.floorType.includes("land")) {
              // if the junction can be built on, place the building.
              j.player = turn;
              j.building = choosingBuilding
              playerList[turn].buildings.push(j)
            }
          }
        }
      }
      
      break;
    }
  }
  if(!clicked) {
    // check if a road is clicked
    for(let r of roadList) {
      if(r.checkClickCollision(e.offsetX, e.offsetY)) {
        clicked = {type: "road", info: r}
        if(!r.player&&r.player!==0) {
          if(r.floorType.includes("land")) {
            r.player = turn;
            playerList[turn].roads.push(r)
          }
        }
        break;
      }
    }
  }
  console.log(clicked)
});

function rollDie(){
  let redDice = Math.ceil(Math.random()*6)
  let yellowDice = Math.ceil(Math.random()*6)
  dieResult = redDice + yellowDice
  document.getElementById("redDice").innerHTML = redDice  
  document.getElementById("yellowDice").innerHTML = yellowDice
  document.getElementById("dieButton").disabled = true;
  document.getElementById("endTurnButton").disabled = false;
  
  for(let player of playerList) {
    for(let building of player.buildings) {
      for(let resource of building.resources) {
        if(dieResult == resource.num && !building.robber) {
          player.materials[resource.type] += 1 + +(building.building == "city")
        }
      }
    }
  }
}

function endTurn() {
  turn = (turn+1)%playerList.length
  updateSidebar(turn)
  document.getElementById("dieButton").disabled = false;
  document.getElementById("endTurnButton").disabled = true;
}



// Find distance from point to line segment
// https://gist.github.com/mattdesl/47412d930dcd8cd765c871a65532ffac
// p - point; v - start point of segment; w - end point of segment
function distToSegment (p, v, w) {
  let dist2 = (v, w) => (v[0] - w[0])**2 + (v[1] - w[1])**2;
  var l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]))
}