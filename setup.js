// set all the main game things
function setupGame(previousAiList=false){
  if(previousAiList){
    if(previousAiList[0].gameWins >= 3){
      console.log("WINNER:" + previousAiList[0].i, JSON.stringify(previousAiList[0].weights))
    }
  }
  let playerAmount = amountInput.value
  let colorCheck = [];
  playerList = []
  // check for duplicate colors
  for(let i = 1; i<=playerAmount; i++){
    if(colorCheck.includes(document.getElementById("playerColor"+i).value)) {
      document.getElementById("errOutput").innerHTML = "You cannot have duplicate colors!" 
      return;
    }
    colorCheck.push(document.getElementById("playerColor"+i).value)
  }
  // set the color and name for each player
  for(let i = 1; i<=playerAmount; i++){
    let name = document.getElementById("playerName"+i).value
    let color = document.getElementById("playerColor"+i).value
    let computerSelection = document.getElementById("aiSelection"+i).value
    if(name.length < 1) name = "player " + i 
    if(computerSelection == "computer"){
      playerList.push(new Player(name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),color,true))
      if(!previousAiList){
        aiList.push(new AI(i-1,0,0,0,0))
      } else {
        console.log(previousAiList)
        console.log(setupPhase, setupAmount)
        if(previousAiList[0].gameWins >= 3){
          console.log("AI " + String(i-1), previousAiList[i-1])
          aiList.push(new AI(i-1,previousAiList.length,i-1,previousAiList[i-1].weights,previousAiList[0].weights))
        } else if(i == playerAmount) {
          console.log("same aiList")
          aiList = [...previousAiList] // this might be broken
        }
      }
    } else {
      playerList.push(new Player(name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),color))
    }
  }  
  if(!previousAiList){
    document.getElementById('backgroundMusic').play()
    document.getElementById('backgroundMusic').loop = true
    document.getElementById('backgroundMusic').volume = 0.2;
  } else {
    console.log("new game")
    createPlayerInfo()
    aiList[0].startTurn()
    updateSidebar(turn)
  }
  gameStarted = createTileList(); // ends menu loop and starts game loop
  console.log(gameStarted)
}

// update the amount of displayed players when the input is updated
const amountInput = document.getElementById("playerAmount")
amountInput.onchange=()=>{
  amountInput.value = Math.round(amountInput.value)
  if(amountInput.value < 3) amountInput.value = 3
  if(amountInput.value > 6) amountInput.value = 6
  // show the player in the list if it fits in the updated amount
  for(let i=1; i<=6; i++) {
    if(i<=amountInput.value) {
      document.getElementById("name"+i).style.display="table-row"
      document.getElementById("color"+i).style.display="table-row"
      document.getElementById("computer"+i).style.display="table-row"
    } else {
      document.getElementById("name"+i).style.display="none"
      document.getElementById("color"+i).style.display="none"
      document.getElementById("computer"+i).style.display="none"
    }
  }
}

/*
  generate the board
 */
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
                  // console.log("reset")
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
  cardStack = []
  for(let c in developmentCards) {
    let card = developmentCards[c]
    for(let i=0; i<card.amount; i++) cardStack.push(card)
  }
  cardStack = cardStack
                .map((value) => ({ value, s: Math.random() }))
                .sort((a, b) => a.s - b.s)
                .map(({ value }) => value)
  return true
}