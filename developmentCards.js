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
}

function roadBuildingCard(p) {
  let player = playerList[p]
}

function yearOfPlentyCard(p) {
  let player = playerList[p]
}

function monopolyCard(p) {
  let player = playerList[p]
}

function pointCard(p) {
  let player = playerList[p]
}