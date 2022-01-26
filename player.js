class Player {
  constructor(name,color){
    this.name = name; // stores the name of the player
    this.color = color; // stores the color of a player    
    this.resources = // stores the amount of resources a player has
    {
      lumber:0,
      wool:0,
      ore:0,
      brick:0,
      grain:0
    }
    this.developmentCards = []; // stores all the development cards a player has
    this.roads = []; // stores the roads owned by a player
    this.buildings = []; // stores the junctions owned by a player
    this.maritimeTrades = [];// more favorible trades at the side of the board
    this.cityLeft = 4; // the total amount of cities a player can put on the board
    this.settlementLeft = 5; // the total amount of settlements a player can put on the board
    this.roadLeft = 15; // the total amount of roads a player can put on the board
    this.longestRoad = 0; // stores how long their longest road is
    this.longestRoadHolder = false; // stores whether or not the player is the one with the longest road
    this.armySize = 0; // size of a players army needed for the biggest army card worth 2 points
    this.biggestArmyHolder = false; // stores whether or not the player is the one with the biggest army
    this.points = 0; // stores the total amount of points a player has
  }
}

function createPlayerInfo() {
  for(let p in playerList){ 
    // create div for each player
    let player = playerList[p]
    let playerDiv = document.createElement("DIV")
    playerDiv.id="playerInfo"+p
    playerDiv.style.width = "80%"
    playerDiv.style.backgroundColor = player.color
    playerDiv.style.position = "relative"
    playerDiv.style.opacity = "0.5"
    playerDiv.style.border = "5px solid black"
    playerDiv.style.height = "35%"
    playerDiv.style.color = "black"
    playerDiv.style.marginLeft = "auto"
    playerDiv.style.marginRight = "auto"
    playerDiv.style.marginTop = "3%"
    playerDiv.style.marginBottom = "3%"
    playerDiv.style.overflow = "hidden"

    // div on the left side of the player box
    let leftDiv = document.createElement("DIV") 
    leftDiv.style.position = "absolute"
    leftDiv.style.left = "0px"
    leftDiv.style.top = "0px"
    leftDiv.style.height = "100%"
    leftDiv.style.width = "50%"
    leftDiv.style.textAlign = "center"

    leftDiv.innerHTML = "<h3>"+player.name+"</h3>Points: <span id='playerPoints"+p+"'>"+player.points+"</span>"

    // div on the right side of the player box
    let rightDiv = document.createElement("DIV") 
    rightDiv.style.position = "absolute"
    rightDiv.style.right = "0px"
    rightDiv.style.top = "0px"
    rightDiv.style.height = "100%"
    rightDiv.style.width = "50%"
    rightDiv.style.textAlign = "center"
    rightDiv.innerHTML = "<h3>Resources</h3>"

    // list of resources the player has
    let resourceList = document.createElement("SPAN")
    rightDiv.appendChild(resourceList)
    playerDiv.resources = resourceList

    // create button in div
    let cardsButton = document.createElement("BUTTON")
    cardsButton.id = "playerCards"+p
    cardsButton.onclick = function() {showCards(p)}
    cardsButton.innerHTML = "Show Cards"

    rightDiv.appendChild(cardsButton)

    // add the div to the sidebar
    playerDiv.appendChild(leftDiv)
    playerDiv.appendChild(rightDiv)
    playerDiv.leftDiv = leftDiv
    playerDiv.rightDiv = rightDiv
    document.getElementById("playerInfo").appendChild(playerDiv)
  }  
}