const lumberRobber = document.getElementById("lumberRobberAmount")
const woolRobber = document.getElementById("woolRobberAmount")
const oreRobber = document.getElementById("oreRobberAmount")
const brickRobber = document.getElementById("brickRobberAmount")
const grainRobber = document.getElementById("grainRobberAmount")

lumberRobber.onchange=()=>losingResources("lumber")
woolRobber.onchange=()=>losingResources("wool")
oreRobber.onchange=()=>losingResources("ore")
brickRobber.onchange=()=>losingResources("brick")
grainRobber.onchange=()=>losingResources("grain")

function robberActions() {
  robbedPlayers = []
  let totalResources = 0;
  for(let player in playerList){
    totalResources = 0;
    for(let resource in playerList[player].resources){
      totalResources += playerList[player].resources[resource]
    }
    if(totalResources > 7){
      robbedPlayers.push([player, totalResources, Math.floor(totalResources/2)])
    }
  }
  if(robbedPlayers.length!=0){
    disableButtons(true)
    /*
    document.getElementById("endTurnButton").disabled = true
    document.getElementById("bankTrade").disabled = true
    document.getElementById("shopButton").disabled = true
    document.getElementById("tradeWithPlayers").disabled = true;*/
    let player = robbedPlayers[0][0]
    if(playerList[player].ai){
      aiList.find(ai => ai.i == robbedPlayers[0][0]).robberLosing(robbedPlayers[0][2]) // does the robbing for a computer
      confirmRobber()
    } else {
      document.getElementById("robberConfirmationButton").disabled = true 
      let robberDiv = document.getElementById("robberDisplay")
      robberDiv.style.display = "block"
      document.getElementById("robberPlayer").innerHTML = playerList[player].name
      document.getElementById("robberPlayer").style.color = playerList[player].color
      document.getElementById("robberTotal").innerHTML = robbedPlayers[0][1]
      document.getElementById("robberLoss").innerHTML = robbedPlayers[0][2]
      document.getElementById("totalResourcesSelected").innerHTML = 0
      document.getElementById("totalResourcesToSelect").innerHTML = robbedPlayers[0][2]
      for(let resource in playerList[player].resources){
        document.getElementById(resource + "RobberAmount").max = playerList[player].resources[resource]
        document.getElementById(resource + "RobberAmount").value = 0
        document.getElementById(resource + "TotalRobber").innerHTML = playerList[player].resources[resource]
      }
    } 
  } else {
    if(playerList[turn].ai){
      aiList.find(ai => ai.i == turn).moveRobber()
    } else{
      newRobberLocation = true;
      disableButtons(true)
      /*
      document.getElementById("shopButton").disabled = true;  
      document.getElementById("endTurnButton").disabled = true;
      document.getElementById("bankTrade").disabled = true
      document.getElementById("tradeWithPlayers").disabled = true;
      document.getElementById("playerCards"+turn).disabled = true;*/
      document.getElementById("placeRobberInfo").style.display="block"
    }
  }
}

function confirmRobber(){
  // still not created yet
  let robberDiv = document.getElementById("robberDisplay")  
  robberDiv.style.display = "none"
  let player = robbedPlayers[0][0]
  if(!playerList[player].ai){
    for(let resource in playerList[player].resources){
      playerList[player].resources[resource] -= parseInt(document.getElementById(resource + "RobberAmount").value) 
      resourceBank[resource] += parseInt(document.getElementById(resource + "RobberAmount").value)
      updateResourcesInBank()
    }
  }
  if(player == turn){
    updateSidebar(turn)
  }
  let lastRobbedPlayer = robbedPlayers[0][0]
  robbedPlayers.shift()
  if(robbedPlayers.length == 0){
    if(playerList[turn].ai){
      aiList.find(ai => ai.i == turn).moveRobber()
      console.log(lastRobbedPlayer,playerList[lastRobbedPlayer])
      if(!playerList[lastRobbedPlayer].ai){
        endTurn()
      }
    } else {
      newRobberLocation = true;
      document.getElementById("placeRobberInfo").style.display="block"
    }
    // document.getElementById("buttonDiv").style.display="none"
  } else { /* could be put in a function cus its double */
    if(playerList[robbedPlayers[0][0]].ai){
      aiList.find(ai => ai.i == robbedPlayers[0][0]).robberLosing(robbedPlayers[0][2]) // does the robbing for a computer
      confirmRobber()
    } else {
      document.getElementById("robberConfirmationButton").disabled = true
      robberDiv = document.getElementById("robberDisplay")
      robberDiv.style.display = "block"
      player = robbedPlayers[0][0]
      document.getElementById("robberPlayer").innerHTML = playerList[player].name
      document.getElementById("robberTotal").innerHTML = robbedPlayers[0][1]
      document.getElementById("robberLoss").innerHTML = robbedPlayers[0][2]
      document.getElementById("totalResourcesSelected").innerHTML = 0
      document.getElementById("totalResourcesToSelect").innerHTML = robbedPlayers[0][2]
      for(let resource in playerList[player].resources){
        document.getElementById(resource + "RobberAmount").max = playerList[player].resources[resource]
        document.getElementById(resource + "RobberAmount").value = 0
        document.getElementById(resource + "TotalRobber").innerHTML = playerList[player].resources[resource]
      }
    }
  }
}

function losingResources(resource){
  amountInput.value = Math.round(amountInput.value)
  if(isNaN(parseInt(document.getElementById(resource + "RobberAmount").value))) document.getElementById(resource + "RobberAmount").value = 0
  if(parseInt(document.getElementById(resource + "RobberAmount").value) < 0) document.getElementById(resource + "RobberAmount").value = 0
  if(parseInt(document.getElementById(resource + "RobberAmount").value) > document.getElementById(resource + "RobberAmount").value) document.getElementById(resource + "RobberAmount").value = document.getElementById(resoure + "RobberAmount").value
  let totalRobberResources = parseInt(lumberRobber.value) + parseInt(woolRobber.value) + parseInt(oreRobber.value) + parseInt(brickRobber.value) + parseInt(grainRobber.value)
  if(robbedPlayers[0][2]<totalRobberResources){
    document.getElementById(resource + "RobberAmount").value = parseInt(document.getElementById(resource + "RobberAmount").value) + robbedPlayers[0][2] - totalRobberResources
    totalRobberResources = parseInt(lumberRobber.value) + parseInt(woolRobber.value) + parseInt(oreRobber.value) + parseInt(brickRobber.value) + parseInt(grainRobber.value)
  }
  document.getElementById("totalResourcesSelected").innerHTML = totalRobberResources
  document.getElementById("totalResourcesToSelect").innerHTML = robbedPlayers[0][2] - totalRobberResources
  if(robbedPlayers[0][2] - totalRobberResources == 0){
    document.getElementById("robberConfirmationButton").disabled = false
  } else {
    document.getElementById("robberConfirmationButton").disabled = true
  }
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