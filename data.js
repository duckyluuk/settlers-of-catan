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
    img: new Image(),
    color: "red"
  },
  forest : {
    resource: "lumber",
    img: new Image(),
    color: "green"
  },
  mountains: {
    resource: "ore",
    img: new Image(),
    color: "grey"
  },
  fields: {
    resource: "grain",
    img: new Image(),
    color: "yellow"
  },
  pasture: {
    resource: "wool",
    img: new Image(),
    color: "lightgreen"
  },
  desert: {
    resource: false,
    img: new Image(),
    color: "rgb(247,244,216)"
  },
  water: {
    resource: false,
    img: new Image(),
    color: "aqua"
  },
  port: {
    resource: false,
    img: {
      "brick": new Image(),
      "lumber": new Image(),
      "ore": new Image(),
      "grain": new Image(),
      "wool": new Image(),
      "general": new Image()
    },
    color: "blue"
  }
}

tileData.hills.img.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/brick_tile.png"
tileData.forest.img.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/lumber_tile.png" 
tileData.mountains.img.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/ore_tile.png" 
tileData.fields.img.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/wheat_tile.png" 
tileData.pasture.img.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/sheep_tile.png" 
tileData.desert.img.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/desert_tile.png" 
tileData.water.img.src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/ocean_tile.png" 
tileData.port.img["brick"].src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_brick_tile.png" 
tileData.port.img["lumber"].src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_lumber_tile.png" 
tileData.port.img["ore"].src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_ore_tile.png" 
tileData.port.img["grain"].src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_wheat_tile.png" 
tileData.port.img["wool"].src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_sheep_tile.png" 
tileData.port.img["general"].src = "https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/port_general_tile.png" 