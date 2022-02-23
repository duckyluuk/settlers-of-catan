
/*
 * lc: amount of players in the last game
 * lp: position in the last game (lower is better)
 * lw: weights in last game
 * ww: weights of winner of last game
 */
class AI {
  constructor(i, lc, lp, lw, ww) {
    this.i = i // index of the player the AI is for in the playerList
    if(lc == 0) this.weights = generateWeights()
    else {
      if(lp == 0) {
        // keep same weights
        this.weights = lw
      } else if(lp == lc-1) {
        // randomise weights
        this.weights = generateWeights()
      } else {
        // move weights closer to winner weights
        this.weights = {
          win: 100,
          // for each weight, move it closer to the weights of the winner by 1/5th of the difference
          points: lw.points + (ww.points - lw.points)/5,
          diceProbability: lw.diceProbability + (ww.diceProbability - lw.diceProbability)/5,
          developmentCard: lw.developmentCard + (ww.developmentCard - lw.developmentCard)/5,
          recources: lw.resources + (ww.resources - lw.resources)/5,
          longerRoad: lw.longerRoad + (ww.longerRoad - lw.longerRoad)/5,
          largerArmy: lw.largerArmy + (ww.largerArmy - lw.largerArmy)/5,
          sameCards: lw.sameCards + (ww.sameCards - lw.sameCards)/5,
          manyCards: lw.manyCards + (ww.manyCards - lw.manyCards)/5,
          ports: lw.ports + (ww.ports - lw.ports)/5,
          resourceWeights: {
            lumber: lw.resourceWeights.lumber + (ww.resourceWeights.lumber - lw.resourceWeights.lumber)/5,
            wool: lw.resourceWeights.wool + (ww.resourceWeights.wool - lw.resourceWeights.wool)/5,
            ore: lw.resourceWeights.ore + (ww.resourceWeights.ore - lw.resourceWeights.ore)/5,
            brick: lw.resourceWeights.brick + (ww.resourceWeights.brick - lw.resourceWeights.brick)/5,
            grain: lw.resourceWeights.grain + (ww.resourceWeights.grain - lw.resourceWeights.grain)/5
          }
        }
      }  
    }
    this.gameCopy = {
      tileList: [],
      roadList: [],
      junctionList: [],
      playerList: [],   
      cardStack: [],
      longestRoadPlayer: false,
      largestArmyPlayer: false,
      resourceBank: {}
    }
  }
  startTurn() {
    this.gameCopy = this.copyGame()
    //this.findTurnActions()
  }
  // find an action to do
  findTurnActions() {
    let allActions = findActionWeight(gc)
    // not sure how exactly to do this, just try every possible set of actions and see which is best?
    
  }
  
  findActionWeight(gc, allActions = [], actionList = []) { // this will be recursive function
    let actions = this.findActionList(gc)
    for(let buy in actions.buy){
      for(let i in actions.buy[buy]) {
        this.buy(buy, actions[buy][i], gc)
        
        let w = this.calculateWeight(false, gc)
        
        actionListCopy = [...actionList]
        let newCopy = this.copyGame(gc)
        allActions = [...this.findAcionWeight(newCopy, allActions, actionListCopy), {weight: w, actions: actionList}]
      }
    }
    
    return allActions
  }
  
  buy(type, building, gc = this.gameCopy) {
    let cost = buyData[type].cost
    for(let r in cost) {
      gc.playerList[this.i].resources[r] -= cost[r]
      gc.resourceBank[r] += cost[r]
    }
    switch(type){
      case "road" :
        building.player = this.i;
        gc.playerList[this.i].roadLeft -= 1 
        break;
        
      case "settlement" :
        building.player = this.i
        gc.playerList[this.i].settlementLeft -= 1
        break;
        
      case "city" :
        building.player = this.i
        gc.playerList[this.i].cityLeft -= 1
        gc.playerList[this.i].settlementLeft += 1
        break;
      
      case "developmentCard" :
        gc.playerList[this.i].developmentCards.push(gc.cardStack.shift()) 
        break;
      
      default:
        console.log(type + " is not defined")
    }
  }
  
  // find all possible actions the player can do
  findActionList(gc = this.gameCopy) {
    let actions = {
      buy: { // things the ai can buy
        road: this.findBuildRoads(gc),
        settlement: this.findBuildSettlements(gc),
        city: this.findBuildCities(gc),
        developmentCard: true
      },
      trade: { // trades the ai can do
        player: [],
        bank: []
      },
      playCard: [...gc.playerList[this.i].developmentCards] // developmentcards the ai can play
      
    }
    
    // check if there are enough resources to buy the stuff
    for(let b in buyData) {
      if(b != 'developmentCard') {
        if(gc.playerList[this.i][b+"Left"] <= 0) actions.buy[b] = false;
      } else if(gc.cardStack.length == 0 ){
        actions.buy[b] = false;
      }
      let cost = buyData[b].cost
      for(let r in cost) {
        if(gc.playerList[this.i].resources[r] < cost[r]) actions.buy[b] = false;
      }
    }
    
    return actions
  }
  
  // find all roads that can be built
  findBuildRoads(gc = this.gameCopy) {
    let rl = gc.roadList 
    let jl = gc.junctionList
    let ownedRoads = []
    let ownedJunctions = []
    for(let r in rl){
      if(rl[r].player===this.i){
        ownedRoads.push(rl[r])
      }
    }
    for(let j in jl){
      if(jl[j].player===this.i){
        ownedJunctions.push(jl[j])
      }
    }
    let availableRoads = []
    for(let r in rl){
      for(let roads in ownedRoads){
        if(!ownedRoads.includes(rl[r])&&
           !availableRoads.includes(rl[r])&&
           ((rl[r].x1 == ownedRoads[roads].x1 && rl[r].y1 == ownedRoads[roads].y1)||
            (rl[r].x2 == ownedRoads[roads].x2 && rl[r].y2 == ownedRoads[roads].y2)||
            (rl[r].x1 == ownedRoads[roads].x2 && rl[r].y1 == ownedRoads[roads].y2)||
            (rl[r].x2 == ownedRoads[roads].x1 && rl[r].y2 == ownedRoads[roads].y1))&&
           (!(rl[r].player)&&rl[r].player!==0)&&
           rl[r].floorType.includes("land")){
          availableRoads.push(rl[r])
        }
      }
    }
    for(let r in rl){
      for(let junction in ownedJunctions){
        if(!availableRoads.includes(rl[r])&&
           ((rl[r].x1 == ownedJunctions[junction].x && rl[r].y1 == ownedJunctions[junction].y)||
            (rl[r].x2 == ownedJunctions[junction].x && rl[r].y2 == ownedJunctions[junction].y))&&
           (!(rl[r].player)&&rl[r].player!==0)&&
           rl[r].floorType.includes("land")){
          availableRoads.push(rl[r])
        }
      }
    }
    return availableRoads
  }
  
  // find all settlements that can be built
  findBuildSettlements(gc = this.gameCopy) {
    let rl = gc.roadList
    let jl = gc.junctionList
    let availableJunctions = []
    let viableJunctions = []
    let ownedRoads = []
    if(!setupPhase){ 
      for(let r in rl){
        if(rl[r].player===this.i){
          ownedRoads.push(rl[r])
        }
      }
      console.log(ownedRoads)
      // still needs to check whether building are too close
      for(let j in jl){
        for(let r in ownedRoads){
          if(!availableJunctions.includes(jl[j]) &&
             ((jl[j].x == ownedRoads[r].x1 && jl[j].y == ownedRoads[r].y1)||
              (jl[j].x == ownedRoads[r].x2 && jl[j].y == ownedRoads[r].y2))&&
              (!(jl[j].player)&&jl[j].player!==0)&&
              jl[j].floorType.includes("land")){
            availableJunctions.push(jl[j])
          }
        }
      }
    } else { // if it is in setupPhase
      if(setupPhase == "settlement"){
        for(let r of rl){
          
        }
      }
    }
      // function for checking if there are no settlements too close
      for(let j of availableJunctions){
        // all adjecent road for each settlement
        let adjacentRoads = rl.filter(r => (r.x1 == j.x && r.y1 == j.y) || (r.x2 == j.x && r.y2 == j.y))
        let closeJunctions = []
        // function that finds close junctions
        for(let road of adjacentRoads){
          closeJunctions.push(jl.find(junction => junction.x == road.x1 && junction.y == road.y1))
          closeJunctions.push(jl.find(junction => junction.x == road.x2 && junction.y == road.y2))
        }
        // sets flag for whether a junction is nearby
        let nearbyJunction = false
        // loop that goes past all close junctions to check if one is already owned by a player
        for(let closeJunction of closeJunctions){
          if(closeJunction.player || closeJunction.player ===0){ // checks if the road is already owned
            nearbyJunction = true // sets the flag
            break
          }
        }
        if(!nearbyJunction) viableJunctions.push(j) // if there is no road nearby than add the junction to the viable junctions
      }
    return viableJunctions
  }
  // find all cities that can be built
  findBuildCities(gc = this.gameCopy) {
    let jl = gc.junctionList
    let availableSettlements = []
    for(let j in jl){
      if(jl[j].player===this.i && jl[j].building=="settlement"){
        availableSettlements.push(jl[j])
      }
    }
    return availableSettlements
  }
  
  copyGame(copyCheck = true, gc = this.gameCopy) {
    let tl = (copyCheck ? tileList : gc.tileList) // tile list
    let rl = (copyCheck ? roadList : gc.roadList) // road list
    let jl = (copyCheck ? junctionList : gc.junctionList) // junction list
    let pl = (copyCheck ? playerList : gc.playerList) // player list
    let rb = (copyCheck ? resourceBank : gc.resourceBank) // resource bank
    let cs = (copyCheck ? cardStack : gc.cardStack) // card stack
    let gameCopy = {
      tileList: [],
      roadList: [],
      junctionList: [],
      playerList: [],
      cardStack: [],
      longestRoadPlayer: (copyCheck ? longestRoadPlayer : gc.longestRoadPlayer),
      largestArmyPlayer: (copyCheck ? largestArmyPlayer : gc.largestArmyPlayer),
      resourceBank: {}
    }
    // make copies of all objects
    for(let t of tl) gameCopy.tileList.push(new Tile(t.name,t.resource,t.dice,t.img,t.color,t.x,t.y,t.rot,t.robber,true))
    for(let r of rl) gameCopy.roadList.push(new Road(r.x1,r.y1,r.x2,r.y2,r.floorType,r.player))
    for(let j of jl) gameCopy.junctionList.push(new Junction(j.x,j.y,j.floorType,false,false,j.player,j.building,j.resources,j.tradeResources))
    
    for(let p of pl) gameCopy.playerList.push(p.copy(gameCopy))
    
    gameCopy.resourceBank = {...rb}
    gameCopy.cardStack = [...cs]
    console.log(gameCopy.resourceBank, gameCopy)
    return gameCopy
  }
  // find the total weight of the game state
  calculateWeight(copyCheck = true, gc = this.gameCopy) {
    let tl = (copyCheck ? tileList : gc.tileList) // tile list
    let rl = (copyCheck ? roadList : gc.roadList) // road list
    let jl = (copyCheck ? junctionList : gc.junctionList) // junction list
    let pl = (copyCheck ? playerList : gc.playerList) // player list
    
    let p = pl[this.i] // player being checked
    
    let weight = 0
    // point weight
    weight += p.points*this.weights.points
    
    // resource weight
    let tr = 0 // resource count so far
    for(let r in p.resources) {
      let rw = 0
      for(let i=0; i<p.resources[r]; i++) {
        // the weight of each resource card is the weight of the resource type combined with the weight for too many cards
        rw += this.weights.resourceWeights[r] - (tr > 7 ? this.weights.manyCards : 0)
        tr++
      } 
      weight += rw
      // add something in here for having many of the same card
    }
    
    // development card weight
    weight += p.developmentCards.length*this.weights.developmentCard
    
    // longest road / largest army weights
    weight += p.longestRoad*this.weights.longerRoad
    weight += p.armySize*this.weights.largerArmy
    
    // weights for each resource and port the player has built on
    for(let j of p.buildings) {
      console.log(j)
      for(let r of j.resources) {
        console.log(r)
        if(r.type && r.num) weight += this.weights.resourceWeights[r.type]*(j.building == "city" ? 2 : 1)*(this.weights.diceProbability**Math.abs(r.num-7))
      } 
      for(let r of j.tradeResources) {
        weight += this.weights.ports * this.weights.resourceWeights[r]
      }
    }
    //console.log(weight)
    return(weight)
  }
}

function generateWeights() {
  return {
    win: 100,
    fun: -100,
    points: Math.random(),
    diceProbability: Math.random(),
    developmentCard: Math.random(),
    resources: Math.random(),
    longerRoad: Math.random(),
    largerArmy: Math.random(),
    sameCards: Math.random(),
    manyCards: Math.random(),
    ports: Math.random(),
    resourceWeights: {
      lumber: Math.random(),
      wool: Math.random(),
      ore: Math.random(),
      brick: Math.random(),
      grain: Math.random()
    }
  }
}