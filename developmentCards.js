/*
 * functions to execute for the action of each card
 */

function knightCard(p) {
  let player = playerList[p]
  // allow the player to move the robber
  newRobberLocation = true;
  // increase the player's army size
  player.armySize++
  
  disableButtons(true)
  /*
  document.getElementById("shopButton").disabled = true;  
  document.getElementById("endTurnButton").disabled = true;
  document.getElementById("playerCards"+turn).disabled = true;
  document.getElementById("bankTrade").disabled = true; */
  document.getElementById("tradeWithPlayers").disabled = true;
  
  // check if the player now has the largest army
  if(largestArmyPlayer === false && player.armySize >=3) {
    // if no one has the largest army yet and the player's army size is 3 or more, they are now the largest army holder
    largestArmyPlayer = p
    player.largestArmyHolder = true;
    player.points+=2
  } else if(largestArmyPlayer !== false) {
    // if someone already is the largest army holder, check if the player's army size is bigger than that of the current largest army holder
    let largestArmyHolder = playerList[largestArmyPlayer]
    if(player.armySize > largestArmyHolder.armySize) {
      largestArmyPlayer = p
      largestArmyHolder.points-=2
      player.points+=2
      largestArmyHolder.largestArmyHolder = false;
      player.largestArmyHolder = true
    }
  }
  updateSidebar(turn)
}

function roadBuildingCard(p) {
  let player = playerList[p]
  // allow the player to place 2 free roads
  buy("road",true)
}

function yearOfPlentyCard(p) {
  let player = playerList[p]
  addResources = 2;
  // check which resources are available
  for(let r in resourceBank) {
    if(resourceBank[r] > 0) {
      document.getElementById(r+"GetBtn").disabled=false
    } else {
      document.getElementById(r+"GetBtn").disabled=true
    }
  }
  // show the resource pick menu
  document.getElementById("generalInfo").style.display = "none"
  document.getElementById("pickResource").style.display = "block"
}

function monopolyCard(p) {
  let player = playerList[p]
  
  // show the resource pick menu
  document.getElementById("generalInfo").style.display = "none"
  document.getElementById("monopolyResource").style.display = "block"
}

function pointCard(p) {
  let player = playerList[p]
  // give the player a point
  player.points++
}


// pick a resource to get (year of plenty card)
function addResourceCard(resource, player) {
  playerList[player].resources[resource]++
  resourceBank[resource]--
  updateResourcesInBank()
  addResources--
  if(addResources<=0) {
    document.getElementById("generalInfo").style.display = "block"
    document.getElementById("pickResource").style.display = "none"
  }
  updateSidebar(turn)
}

// claim all of a specific resource type (monopoly card)
function claimResources(resource, gp) {
  for(let p in playerList) {
    if(p != gp) {
      let player = playerList[p]
      let getPlayer = playerList[gp]
      getPlayer.resources[resource] += player.resources[resource]
      player.resources[resource] = 0
    }
  }
  document.getElementById("generalInfo").style.display = "block"
  document.getElementById("monopolyResource").style.display = "none"
  updateSidebar(turn)
}



// show all the development cards a player has
function showCards(p) {
  let player = playerList[p]
  let cardDiv = document.getElementById("informationDisplay")
  cardDiv.style.display = "block"
  console.log(player.color)
  // create the table
  cardDiv.innerHTML = "<h1> <span style='color:"+ player.color + "'>" +player.name+"'s </span> Development Cards</h1>"+
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
  // add a button to close the card display
  let closeBtn = document.createElement("BUTTON")
  closeBtn.innerHTML = "Close"
  closeBtn.onclick = function() {cardDiv.style.display = "none"}
  
  cardDiv.appendChild(closeBtn)
}

// function to use a card
function useCard(p, index) {
  let player = playerList[p]
  console.log(p,index)
  document.getElementById("informationDisplay").style.display = "none"
  // use the card
  this.playerList[this.i].developmentCards[index].cardFunc(p)
  // remove the card from the player
  this.playerList[this.i].developmentCards.splice(index, 1)
}



// the data of the different types of development cards
var developmentCards = {
  knightCard : {
    name: "Knight Card",
    desc : "Move the robber. Steal one resource from the owner of a settlement or city adjacent to the robber's new hex.",
    amount: 14,
    immediatelyPlayable: false,
    img :false,
    cardFunc: knightCard
  },
  roadBuildingCard : {
    name: "Road Building",
    desc : "Place 2 new roads as if you had just built them",
    amount: 2,
    immediatelyPlayable: false,
    img : false,
    cardFunc: roadBuildingCard
  },
  yearOfPlentyCard : {
    name: "Year of Plenty",
    desc : "Take any 2 resources from the bank. Add them to your hand. They can be 2 of the same resource or 2 different resources.",
    amount: 2,
    immediatelyPlayable: false,
    img : false,
    cardFunc: yearOfPlentyCard
  },
  monopolyCard : {
    name: "Monopoly",
    desc : "When you play this card announce 1 type of resource. All other players must give you all of their resources of that type.",
    amount: 2,
    immediatelyPlayable: false,
    img : false    ,
    cardFunc: monopolyCard
  },
  victoryPointCard : {
    name: "Victory Point",
    desc : "Reveal this card on your turn if, with it, you reach the number of points required for victory.",
    amount: 5,
    immediatelyPlayable: true,
    img : false,
    cardFunc: pointCard
  }
}