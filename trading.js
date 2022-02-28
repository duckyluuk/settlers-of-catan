function showBankTrade(show){
  // enable or disable shop screen
  if(show){
    document.getElementById("diceRoll").style.display="none"
    document.getElementById("tradeWithBank").style.display="block"
    for(let r in playerList[turn].trades){
      document.getElementById(r+"TradingAmount").innerHTML = playerList[turn].trades[r]
      document.getElementById(r+"Trading").checked = false
      document.getElementById(r+"BankTrading").checked = false
      if(playerList[turn].trades[r]>playerList[turn].resources[r]){
        document.getElementById(r+"Trading").disabled = true
      } else {
        document.getElementById(r+"Trading").disabled = false
      }
      if(resourceBank[r]==0){
        document.getElementById(r+"BankTrading").disabled = true
      } else {
        document.getElementById(r+"BankTrading").disabled = false
      }
    }
  } else {
    document.getElementById("diceRoll").style.display="block"
    document.getElementById("tradeWithBank").style.display="none"
  }
}

function confirmBankTrade(){
  let playerResource = false
  let bankResource = false
  for(let r in playerList[turn].trades){
    if(document.getElementById(r+"Trading").checked){
      playerResource = r 
    }
    if(document.getElementById(r+"BankTrading").checked){
      bankResource = r 
    } 
  }
  if(bankResource && playerResource){
    playerList[turn].resources[playerResource] -= playerList[turn].trades[playerResource]
    resourceBank[playerResource] += playerList[turn].trades[playerResource]
    playerList[turn].resources[bankResource] += 1
    resourceBank[bankResource] -= 1
    updateSidebar(turn)
    updateResourcesInBank()
    showBankTrade(true)
  }
}

function tradeWithPlayers(){
  document.getElementById("playerTradeDisplay").style.display = "block"
  document.getElementById("RequestingPlayer").innerHTML = playerList[turn].name
  document.getElementById("RequestingPlayer").style.color = playerList[turn].color
  for(let r in playerList[turn].resources){
    document.getElementById(r+"TotalOffer").innerHTML = playerList[turn].resources[r]
    document.getElementById(r+"OfferAmount").value = 0
    document.getElementById(r+"RequestAmount").value = 0
    document.getElementById(r+"OfferAmount").max = playerList[turn].resources[r]
    document.getElementById(r+"RequestAmount").max = resourceBank[r] - playerList[turn].resources[r]
  }
  disableButtons(true)
  /*
  document.getElementById("shopButton").disabled = true;  
  document.getElementById("endTurnButton").disabled = true;
  document.getElementById("playerCards"+turn).disabled = true;
  document.getElementById("bankTrade").disabled = true;
  document.getElementById("tradeWithPlayers").disabled = true;*/
  document.getElementById("confirmRequestButton").disabled = true      
}

function confirmTradeRequest(confirm){
  document.getElementById("playerTradeDisplay").style.display = "none"   
  if(!confirm){
    disableButtons(false)
    /*
    document.getElementById("shopButton").disabled = false;  
    document.getElementById("endTurnButton").disabled = false;
    document.getElementById("playerCards"+turn).disabled = false;
    document.getElementById("bankTrade").disabled = false;
    document.getElementById("tradeWithPlayers").disabled = false;    */
    return
  }
  document.getElementById("acceptTradeDisplay").style.display = "block"
  tradeAcceptingPlayer = (turn == 0)? 1 : 0;
  let resourceCheck = true
  document.getElementById("tradeAcceptPlayer").innerHTML = playerList[tradeAcceptingPlayer].name
  document.getElementById("tradeAcceptPlayer").style.color = playerList[tradeAcceptingPlayer].color
  for(let r in playerList[tradeAcceptingPlayer].resources){
    document.getElementById(r+"OfferAccept").innerHTML = document.getElementById(r+"OfferAmount").value
    document.getElementById(r+"AcceptingTotal").innerHTML = playerList[tradeAcceptingPlayer].resources[r];
    document.getElementById(r+"RequestAccept").innerHTML = document.getElementById(r+"RequestAmount").value
    if(playerList[tradeAcceptingPlayer].resources[r]<document.getElementById(r+"RequestAmount").value){ 
      resourceCheck = false;
    }
  }
  document.getElementById("noResourcesAccepting").style.display = resourceCheck ? "none" : "block"
  document.getElementById("acceptTrade").disabled = !resourceCheck
}

function acceptTrade(accepted){
  if(accepted){
    for(let r in playerList[tradeAcceptingPlayer].resources){
      playerList[tradeAcceptingPlayer].resources[r] += parseInt(document.getElementById(r+"OfferAccept").innerHTML)
      playerList[turn].resources[r] -= parseInt(document.getElementById(r+"OfferAccept").innerHTML)
      playerList[tradeAcceptingPlayer].resources[r] -= parseInt(document.getElementById(r+"RequestAccept").innerHTML)
      playerList[turn].resources[r] += parseInt(document.getElementById(r+"RequestAccept").innerHTML)
      updateSidebar(turn)
    }
    document.getElementById("acceptTradeDisplay").style.display = "none"
    disableButtons(false)
    /*
    document.getElementById("shopButton").disabled = false;  
    document.getElementById("endTurnButton").disabled = false;
    document.getElementById("playerCards"+turn).disabled = false;
    document.getElementById("bankTrade").disabled = false;
    document.getElementById("tradeWithPlayers").disabled = false; 
    */
    return;
  }
  tradeAcceptingPlayer += 1
  if(tradeAcceptingPlayer == turn){
    tradeAcceptingPlayer += 1
  }
  if(tradeAcceptingPlayer >= playerList.length){
    document.getElementById("acceptTradeDisplay").style.display = "none"
    disableButtons(false)
    /*
    document.getElementById("shopButton").disabled = false;  
    document.getElementById("endTurnButton").disabled = false;
    document.getElementById("playerCards"+turn).disabled = false;
    document.getElementById("bankTrade").disabled = false;
    document.getElementById("tradeWithPlayers").disabled = false; 
    */
    return
  }
  let resourceCheck = true  
  document.getElementById("tradeAcceptPlayer").innerHTML = playerList[tradeAcceptingPlayer].name
  document.getElementById("tradeAcceptPlayer").style.color = playerList[tradeAcceptingPlayer].color
  for(let r in playerList[tradeAcceptingPlayer].resources){
    document.getElementById(r+"AcceptingTotal").innerHTML = playerList[tradeAcceptingPlayer].resources[r];
    if(playerList[tradeAcceptingPlayer].resources[r]<document.getElementById(r+"RequestAmount").value){ 
      resourceCheck = false;
    }
  }
  document.getElementById("noResourcesAccepting").style.display = resourceCheck ? "none" : "block"
  document.getElementById("acceptTrade").disabled = !resourceCheck  
}

const lumberOffer = document.getElementById("lumberOfferAmount")
const woolOffer = document.getElementById("woolOfferAmount")
const oreOffer = document.getElementById("oreOfferAmount")
const brickOffer = document.getElementById("brickOfferAmount")
const grainOffer = document.getElementById("grainOfferAmount")
const lumberRequest = document.getElementById("lumberRequestAmount")
const woolRequest = document.getElementById("woolRequestAmount")
const oreRequest = document.getElementById("oreRequestAmount")
const brickRequest = document.getElementById("brickRequestAmount")
const grainRequest = document.getElementById("grainRequestAmount")

lumberOffer.onchange=()=>playerTradingResources("lumber","Offer")
woolOffer.onchange=()=>playerTradingResources("wool","Offer")
oreOffer.onchange=()=>playerTradingResources("ore","Offer")
brickOffer.onchange=()=>playerTradingResources("brick","Offer")
grainOffer.onchange=()=>playerTradingResources("grain","Offer")
lumberRequest.onchange=()=>playerTradingResources("lumber","Request")
woolRequest.onchange=()=>playerTradingResources("wool","Request")
oreRequest.onchange=()=>playerTradingResources("ore","Request")
brickRequest.onchange=()=>playerTradingResources("brick","Request")
grainRequest.onchange=()=>playerTradingResources("grain","Request")

function playerTradingResources(resource, prefix){
  if(isNaN(parseInt(document.getElementById(resource + prefix + "Amount").value))) document.getElementById(resource + prefix + "Amount").value = 0
  if(parseInt(document.getElementById(resource + prefix + "Amount").value) < 0) document.getElementById(resource + prefix + "Amount").value = 0
  if(prefix=="Offer"){
    if(parseInt(document.getElementById(resource + prefix + "Amount").value) > parseInt(document.getElementById(resource + "TotalOffer").innerHTML)) document.getElementById(resource + prefix + "Amount").value = parseInt(document.getElementById(resource + "TotalOffer").innerHTML)
  } else {
    if(parseInt(document.getElementById(resource + prefix + "Amount").value) > (resourceBank[resource]-parseInt(document.getElementById(resource + "TotalOffer").innerHTML))) document.getElementById(resource + prefix + "Amount").value = resourceBank[resource]-parseInt(document.getElementById(resource + "TotalOffer").innerHTML)
  }
  let offerExists = false
  let requestExists = false
  for(let r in resourceBank){
    offerExists = (offerExists||document.getElementById(r + "OfferAmount").value !=0)
    requestExists =  (requestExists||document.getElementById(r + "RequestAmount").value !=0)
  }
  if(offerExists && requestExists){
    document.getElementById("confirmRequestButton").disabled = false
  } else {
    document.getElementById("confirmRequestButton").disabled = true    
  }
}