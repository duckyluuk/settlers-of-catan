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

/*
 * function to execute for the action of each card
 */

function knightCard(p) {
  let player = playerList[p]
  newRobberLocation = true;
  player.armySize++
  document.getElementById("shopButton").disabled = true;  
  document.getElementById("endTurnButton").disabled = true;
  document.getElementById("playerCards"+turn).disabled = true;
}

function roadBuildingCard(p) {
  let player = playerList[p]
  buy("road",true)
}

function yearOfPlentyCard(p) {
  let player = playerList[p]
  addResources = 2;
  document.getElementById("generalInfo").style.display = "none"
  document.getElementById("pickResource").style.display = "block"
}

function monopolyCard(p) {
  let player = playerList[p]
  
  document.getElementById("generalInfo").style.display = "none"
  document.getElementById("monopolyResource").style.display = "block"
}

function pointCard(p) {
  let player = playerList[p]
  player.points++
}



// pick a resource to get (year of plenty card)
function addResourceCard(resource, player) {
  playerList[player].resources[resource]++
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
}