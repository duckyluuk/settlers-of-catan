// costs of all buildings
let buyData = {
  road : {
    name: "road",
    cost : {
      brick: 1,
      lumber: 1
    }
  },
  settlement : {
    name: "settlement",
    cost : {
      brick: 1,
      lumber: 1,
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

// info about tiles
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