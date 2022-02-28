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

function buy(item, freeRoad=false) {
  let cost = buyData[item].cost
  let canBuy = true;
  if(!freeRoad) {
    for(let r in cost) {
      if(playerList[turn].resources[r] < cost[r]) canBuy = false;
    } 
  }
  
  if(canBuy) {
    if(item == "developmentCard") {
      // check if there are any cards lef
      if(cardStack.length > 0) {
        // remove the items from the player
        let cost = buyData[item].cost
        for(let r in cost){
          playerList[turn].resources[r] -= cost[r]
          resourceBank[r] += cost[r]
          updateResourcesInBank()
        } 
        soundEffect("https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/512131__beezlefm__coins-small-sound.wav?v=1643481304147")
        showShop(true)
        updateSidebar(turn)        
        // give the card to the player
        playerList[turn].developmentCards.push(cardStack.shift())  
      }
      
    // check if the player has the building left
    } else if(playerList[turn][item+"Left"] > 0) {
      if(freeRoad) {
        buyFreeRoads = 2
        document.getElementById("cancelBuyBtn").style.display = "none"
      }
      
      // if the player has any of the building left, wait for them to place it
      choosingBuilding = item
      document.getElementById("buildingType").innerHTML = item
      document.getElementById("buyData").style.display="block"
      document.getElementById("shop").style.display="none"
    }
    
  }
  
  console.log(canBuy)
}

// cancel waiting for a building to be placed
function cancelBuild() {
  choosingBuilding = false;
  document.getElementById("buyData").style.display="none"
  document.getElementById("shop").style.display="block"
}