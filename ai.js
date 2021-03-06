/*
 * lc: amount of players in the last game
 * lp: position in the last game (lower is better)
 * lw: weights in last game
 * ww: weights of winner of last game
 */
class AI {
  constructor(i, lc, lp, lw, ww) {
    this.i = i // index of the player the AI is for in the playerList
    this.gameWins = 0
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
          haveCards: lw.points + (ww.points - lw.points)/5,
          points: lw.points + (ww.points - lw.points)/5,
          diceProbability: lw.diceProbability + (ww.diceProbability - lw.diceProbability)/5,
          developmentCard: lw.developmentCard + (ww.developmentCard - lw.developmentCard)/5,
          resources: lw.resources + (ww.resources - lw.resources)/5,
          longerRoad: lw.longerRoad + (ww.longerRoad - lw.longerRoad)/5,
          largerArmy: lw.largerArmy + (ww.largerArmy - lw.largerArmy)/5,
          sameCards: lw.sameCards + (ww.sameCards - lw.sameCards)/5,
          manyCards: lw.manyCards + (ww.manyCards - lw.manyCards)/5,
          ports: lw.ports + (ww.ports - lw.ports)/5,
          newResource: lw.newResource + (ww.newResource - lw.newResource)/5,
          junctionPlaces: lw.junctionPlaces + (ww.junctionPlaces - lw.junctionPlaces)/5,
          resourceWeights: {
            lumber: lw.resourceWeights.lumber + (ww.resourceWeights.lumber - lw.resourceWeights.lumber)/5,
            wool: lw.resourceWeights.wool + (ww.resourceWeights.wool - lw.resourceWeights.wool)/5,
            ore: lw.resourceWeights.ore + (ww.resourceWeights.ore - lw.resourceWeights.ore)/5,
            brick: lw.resourceWeights.brick + (ww.resourceWeights.brick - lw.resourceWeights.brick)/5,
            grain: lw.resourceWeights.grain + (ww.resourceWeights.grain - lw.resourceWeights.grain)/5
          },
          affordBuyWeights: {
            road: lw.affordBuyWeights.road + (ww.affordBuyWeights.road - lw.affordBuyWeights.road)/5,
            settlement: lw.affordBuyWeights.settlement + (ww.affordBuyWeights.settlement - lw.affordBuyWeights.settlement)/5,
            city: lw.affordBuyWeights.city + (ww.affordBuyWeights.city - lw.affordBuyWeights.city)/5,
            developmentCard: lw.affordBuyWeights.develomentCards + (ww.affordBuyWeights.developmentCards - lw.affordBuyWeights.developmentCards)/5
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
      setupPhase: false,
      resourceBank: {}
    }
  }
  startTurn() {
    if(!setupPhase){
      rollDie()
    }
    this.gameCopy = this.copyGame(true)
    this.findBankTrades()
    this.findTurnActions()
    winCheck()
    /*if(playerList.length == aiList.length){
      let currentBuildingsLeft = []
      for(let player of playerList){
        currentBuildingsLeft.push([player.roadLeft,player.settlementLeft,player.cityLeft])
      }
      console.log(lastChangeBuildingsLeft,currentBuildingsLeft)
      if(lastChangeBuildingsLeft == currentBuildingsLeft){
        lastChangeCounter++
        if(lastChangeCounter == 250){ // if game keeps looping because noone does anything
          win = true
          console.log("new game because of loop")
        }
      } else {
        lastChangeCounter = 0
        lastChangeBuildingsLeft = [...currentBuildingsLeft]
      }
    } */
    if(!setupPhase){ 
      endTurn()
    } else {
      updateSidebar(turn, true)
    }
  }
  // find an action to do
  findTurnActions() {
    let gc = this.gameCopy
    let allActions = this.findActionWeight(gc)
    // console.log(allActions.length)
    // console.log(gc)
    // not sure how exactly to do this, just try every possible set of actions and see which is best?
    allActions.sort((a,b) => b.weight - a.weight)
    // force building road + settlement in setup phase
    if(setupPhase) allActions = allActions.filter(a => a.actions.length == 2)
    allActions = allActions.filter(a => {
      if(a.actions.map(a => a.str).includes("playCard_Victory Point")) {
        if(a.gameCopy.playerList[this.i].points >= 10) return true
        else return false
      } else return true
    })
    if(allActions.length){
      console.log(allActions[0])      
      //console.log(allActions[0].actions.length)
      tileList = allActions[0].gameCopy.tileList
      roadList = allActions[0].gameCopy.roadList
      junctionList = allActions[0].gameCopy.junctionList
      playerList = allActions[0].gameCopy.playerList
      cardStack = allActions[0].gameCopy.cardStack
      longestRoadPlayer = allActions[0].gameCopy.longestRoadPlayer
      largestArmyPlayer = allActions[0].gameCopy.largestArmyPlayer
      if(setupPhase){
        if(setupAmount === 0) turn++;
        else turn--;
        document.getElementById("informationDisplay").style.display = "none"
        if(turn >= playerList.length) {
          setupAmount++ 
          turn = playerList.length-1
        }
        if(turn < 0) {
          turn = 0;
          setupPhase = false;
          setupAmount++
          this.gameCopy.setupPhase = false;
          if(!playerList[0].ai){
            document.getElementById("dieButton").disabled = false;
          }
        } else if(setupPhase) setupPhase = "settlement"
      }
      //console.log(setupPhase)
      resourceBank = allActions[0].gameCopy.resourceBank
    }
  }
  
  findActionWeight(gc, allActions = [], actionList = [], j=false, tradeCount=0, cardCount = 0, cardsBought = 0) { // recursively loop through possible actions
    //console.log(gc)
    // hope this prevents memory errors by preventing it to go on too long
    if(allActions.length > 100000) return allActions
    let actionStrings = allActions.map(a => a.actions.map(a => a.str).sort())
    let newCopy = this.copyGame(false, gc)
    //console.log(newCopy)
    let actions = this.findActionList(newCopy)
    // console.log(actions)
    for(let buy in actions.buy){
      // console.log(buy)
      if(buy == "developmentCard" && !setupPhase){
        if(actions.buy[buy]){
          this.buy(buy, false, newCopy)
          cardsBought += 1
          let w = this.calculateWeight(false, newCopy)
          let buystr = "card"
          let actionListCopy = [...actionList, {type: buy, str: buystr}]
          let copyStrings = actionListCopy.map(a => a.str).sort()
            if(actionStrings.filter(strings => {
              if(strings.length != copyStrings.length) return false;
              for(let i in strings) {
                if(strings[i] != copyStrings[i]) return false;
              }
              return true;
            }).length <=0) {
              //console.log(actionListCopy[actionListCopy.length-1].building)
              allActions.push({weight: w, actions: actionListCopy, gameCopy : newCopy})
              //console.log(newCopy, actionListCopy)
              if(!setupPhase || actionListCopy.length < 2) allActions = [...this.findActionWeight(newCopy, [...allActions,{weight: w, actions: actionListCopy, gameCopy : newCopy}], actionListCopy, false,tradeCount,cardsBought) ]
            }
            // console.log(buy,i,actions)
            let action = actions.buy[buy]
            newCopy = this.copyGame(false, gc)

            actions = this.findActionList(newCopy, j)
        }
      } else {
        
        for(let i in actions.buy[buy]){
          // console.log(actions.buy[buy][i], buy)
          if(actions.buy[buy][i]) {
            let builtJunction = false // in setupPhase, the built junction should be passed into this variable to find roads next to it.
            if(newCopy.setupPhase && buy == 'settlement') builtJunction = actions.buy[buy][i]
            this.buy(buy, actions.buy[buy][i], newCopy)
            let w = this.calculateWeight(false, newCopy)
            let buystr = buy+"_"
            if(buy == "road") {
              buystr += actions.buy[buy][i].x1+"_"+actions.buy[buy][i].y1+"_"+actions.buy[buy][i].x2+"_"+actions.buy[buy][i].y2
            } else if(buy == "settlement" || buy == "city") {
              buystr += actions.buy[buy][i].x+"_"+actions.buy[buy][i].y
            }
            let actionListCopy = [...actionList, {type: buy, building: actions.buy[buy][i], str: buystr}]
            let copyStrings = actionListCopy.map(a => a.str).sort()
            if(actionStrings.filter(strings => {
              if(strings.length != copyStrings.length) return false;
              for(let i in strings) {
                if(strings[i] != copyStrings[i]) return false;
              }
              return true;
            }).length <=0) {
              //console.log(actionListCopy[actionListCopy.length-1].building)
              allActions.push({weight: w, actions: actionListCopy, gameCopy : newCopy})
              //console.log(newCopy, actionListCopy)
              if(!setupPhase || actionListCopy.length < 2) allActions = [...this.findActionWeight(newCopy, [...allActions,{weight: w, actions: actionListCopy, gameCopy : newCopy}], actionListCopy, builtJunction,tradeCount,cardCount,cardsBought) ]
            }
            // console.log(buy,i,actions)
            let action = actions.buy[buy][i]
            newCopy = this.copyGame(false, gc)

            actions = this.findActionList(newCopy, j)
          }

        }
      }
    }
    // console.log(tradeCount)
    if(tradeCount<3) {
      for(let trades in actions.trade){
        for(let t in actions.trade[trades]){
          if(trades == "bank"){
            //console.log(trades, actions.trade[trades][t][trade],actions.trade[trades][t][trade].give)
            newCopy.playerList[this.i].resources[actions.trade[trades][t].give] -= actions.trade[trades][t].giveAmount
            if(actions.trade[trades][t].giveAmount !== 0){ // needed for the non action moment
              newCopy.resourceBank[actions.trade[trades][t].get]--
              newCopy.resourceBank[actions.trade[trades][t].give] += actions.trade[trades][t].giveAmount 
              newCopy.playerList[this.i].resources[actions.trade[trades][t].get]++
              //console.log("TRADE!")
            }
            //console.log(JSON.stringify(newCopy.playerList[this.i].resources),JSON.stringify(newCopy.resourceBank))
            let w = this.calculateWeight(false, newCopy)
            //console.log(actionList)
            let tradestr = trades + "_"
            tradestr += actions.trade[trades][t].give+"_"+actions.trade[trades][t].giveAmount+"_"+actions.trade[trades][t].get
            let actionListCopy = [...actionList, {type: trades, trade: actions.trade[trades][t], str: tradestr}]
            let copyStrings = actionListCopy.map(a => a.str).sort()
            if(actionStrings.filter(strings => {
              if(strings.length != copyStrings.length) return false;
              for(let i in strings) {
                if(strings[i] != copyStrings[i]) return false;
              }
              return true;
            }).length <=0) {
              allActions.push({weight: w, actions: actionListCopy, gameCopy : newCopy})
              //console.log(actionListCopy)
              if(!setupPhase || actionListCopy.length < 2) allActions = [...this.findActionWeight(newCopy, [...allActions,{weight: w, actions: actionListCopy, gameCopy : newCopy}], actionListCopy,false,tradeCount+1,cardCount,cardsBought) ]
            }
            // console.log(buy,i,actions)
            let action = actions.trade[trades] 
          }
          newCopy = this.copyGame(false, gc)
          actions = this.findActionList(newCopy, j)
        }
      }
    }
    for(let card in actions.playCard){   
      if(cardCount<1||actions.playCard[card].name == "Victory Point"){
        if(card < actions.playCard.length-cardsBought||actions.playCard[card].name == "Victory Point"){
          let playstr = "playCard_" + actions.playCard[card].name
          newCopy = this.playCard(card,newCopy)
          let w = this.calculateWeight(false, newCopy)
          let actionListCopy = [...actionList, {type: "playCard", card: actions.playCard[card].name, str: playstr}]
          let copyStrings = actionListCopy.map(a => a.str).sort()
          if(actionStrings.filter(strings => {
            if(strings.length != copyStrings.length) return false;
            for(let i in strings) {
              if(strings[i] != copyStrings[i]) return false;
            }
            return true;
          }).length <=0){
            allActions.push({weight: w, actions: actionListCopy, gameCopy : newCopy})
            if(card >= actions.playCard.length-cardsBought) cardsBought-- //if a victory card has just been bought and can be played immediately
            if(!setupPhase || actionListCopy.length < 2) allActions = [...this.findActionWeight(newCopy, [...allActions,{weight: w, actions: actionListCopy, gameCopy : newCopy}], actionListCopy,false,tradeCount,cardCount+1,cardsBought) ]
          }
          let action = actions.playCard[card] 
          newCopy = this.copyGame(false, gc)
          actions = this.findActionList(newCopy, j)
        }
      }
    }
    return allActions
  }
  
  buy(type, building, gc = this.gameCopy) {
    if(gc.setupPhase != type){
      let cost = buyData[type].cost
      for(let r in cost) {
        gc.playerList[this.i].resources[r] -= cost[r]
        gc.resourceBank[r] += cost[r]
      }
    }
    switch(type){
      case "road" :
        // console.log(building, gc.roadList.indexOf(building)/*.findIndex(building), gc*/)
        //console.log(building)
        building.player = this.i
        
        // console.log(gc.roadList[gc.roadList.findIndex(building)])
        // gc.roadList[gc.roadList.findIndex(building)].player = this.i;
        gc.playerList[this.i].roadLeft--
        gc.playerList[this.i].roads.push(building)
        if(gc.setupPhase == "road"){
          gc.setupPhase = false
        }
        updateLongestRoad(gc)
        break;
        
      case "settlement" :
        building.player = this.i
        building.building="settlement"
        gc.playerList[this.i].settlementLeft--
        //console.log(building)
        gc.playerList[this.i].buildings.push(building)
        //console.log(gc.playerList[this.i])
        gc.playerList[this.i].points++
        if(building.tradeResources.length !== 0){
          if(building.tradeResources[0] == "general"){
            for(let r in gc.playerList[this.i].trades){
              if(gc.playerList[this.i].trades[r]==4) gc.playerList[this.i].trades[r] = 3
            }
          } else {
            gc.playerList[this.i].trades[building.tradeResources[0]] = 2
          }
        }
        if(gc.setupPhase == "settlement"){
          gc.setupPhase = "road"
          if(gc.playerList[this.i].settlementLeft == 3){
            for(let r of building.resources){
              if(r.type && r.num){
                gc.playerList[this.i].resources[r.type]++
                gc.resourceBank[r.type]--
              }
            }
          }
        }
        updateLongestRoad(gc)
        break;
        
      case "city" :
        building.player = this.i
        building.building="city"
        gc.playerList[this.i].cityLeft -= 1
        gc.playerList[this.i].settlementLeft += 1
        gc.playerList[this.i].points++
        break;
      
      case "developmentCard" :
        gc.playerList[this.i].developmentCards.push(gc.cardStack.shift()) 
        break;
      
      default:
        console.log(type + " is not defined")
    }
  }
  
  // find all possible actions the player can do
  findActionList(gc = this.gameCopy, builtJunction=false) {
    let actions = {
      buy: { // things the ai can buy
        road: this.findBuildRoads(gc, builtJunction),
        settlement: this.findBuildSettlements(gc),
        city: this.findBuildCities(gc),
        developmentCard: true
      },
      trade: { // trades the ai can do
        player: [],
        bank: this.findBankTrades(gc)
      },
      playCard: [...gc.playerList[this.i].developmentCards], // developmentcards the ai can play
      // bankTrades: this.findBankTrades(gc)
    }
    // check if there are enough resources to buy the stuff
    for(let b in buyData) {
      if(b != 'developmentCard') {
        if(gc.playerList[this.i][b+"Left"] <= 0) actions.buy[b] = false;
      } else if(gc.cardStack.length == 0 ){
        actions.buy[b] = false;
      } 
      let cost = buyData[b].cost
      //console.log(gc.setupPhase == b)
      if(b != gc.setupPhase){
        for(let r in cost) {
          if(gc.playerList[this.i].resources[r] < cost[r]) actions.buy[b] = false;
        }
      } 
    }
    return actions
  }
  
  playCard(index,gc = this.gameCopy){
    let player = gc.playerList[this.i]
    let success = true
    switch(player.developmentCards[index].name){
        case "Knight Card":
          player.armySize++
          this.moveRobber(false,gc) // moves robber without changing the main game
          if(gc.largestArmyPlayer === false && player.armySize >=3) {
            // if no one has the largest army yet and the player's army size is 3 or more, they are now the largest army holder
            gc.largestArmyPlayer = this.i
            player.largestArmyHolder = true;
            player.points+=2
          } else if(gc.largestArmyPlayer !== false) {
            // if someone already is the largest army holder, check if the player's army size is bigger than that of the current largest army holder
            let largestArmyHolder = gc.playerList[gc.largestArmyPlayer]
            if(player.armySize > largestArmyHolder.armySize) {
              largestArmyHolder.points-=2
              player.points+=2
              largestArmyHolder.largestArmyHolder = false;
              player.largestArmyHolder = true
              gc.largestArmyPlayer = this.i
            }
          }
          break
        
        case "Road Building":
          if(gc.playerList[this.i].roadLeft >= 2) {
            let bestRoads = false;
            // this code is also dumb :) but needs to be speedy, so here we are
            let buildableRoads = this.findBuildRoads(gc)
            for(let r of buildableRoads) {
              let saveRoadPlayer = r.player
              r.player = this.i
              let newGameCopy = this.copyGame(false, gc)
              r.player = saveRoadPlayer
              newGameCopy.playerList[this.i].roadLeft--

              let nBuildRoads = this.findBuildRoads(newGameCopy)
              for(let nr of nBuildRoads) {
                let saveRoadPlayer = nr.player
                nr.player = this.i
                let newNewGameCopy = this.copyGame(false, newGameCopy)
                nr.player = saveRoadPlayer
                newNewGameCopy.playerList[this.i].roadLeft--

                let w = this.calculateWeight(false, newNewGameCopy)
                if(!bestRoads || bestRoads.w < w) {
                  bestRoads = {gameCopy: newNewGameCopy, weight: w}
                }
              }
            }
            if(bestRoads){
              success = true
              gc = bestRoads.gameCopy
            }
          }
          
          break
        
        case "Year Of Plenty":
          let bestCombination = false;
          // this code is dumb :) but would take too much time otherwise, so here we are
          for(let r1 in gc.resourceBank){
            for(let r2 in gc.resourceBank){
              let newGameCopy = this.copyGame(false, gc)
              newGameCopy.resourceBank[r1]--
              newGameCopy.playerList[this.i].resources[r1]++
              if(bank[r1] > 0){
                banknewGameCopy.resourceBank[r2]--
                newGameCopy.playerList[this.i].resources[r2]++
                if(bank[r2] > 0){
                  if(bestCombination){
                    let w = this.calculateWeight(false, newGameCopy)
                    if(w > bestCombination.weight){
                      bestCombination = {gameCopy: newGameCopy, weight: w}
                    }
                  } else {
                    bestCombination = {gameCopy: newGameCopy, weight: this.calculateWeight(false, newGameCopy)}
                  }
                  success = true
                }
              }
            }
          }
          if(bestCombination){
            gc = bestCombination.gameCopy
          }
          break
        
        case "Monopoly":
          let bestResource = false
          // more stupid code go brr
          for(let r in gc.resourceBank) {
            let newGameCopy = this.copyGame(false, gc)
            for(let p in newGameCopy.playerList) {
              if(p != this.i) {
                let amount = newGameCopy.playerList[p].resources[r]
                newGameCopy.playerList[this.i].resources[r]+=amount
                newGameCopy.playerList[p].resources[r]=0
              }
            }
            let w = this.calculateWeight(false, newGameCopy)
            if(!bestResource || bestResource.weight < w) {
              bstCombination = {gameCopy: newGameCopy, weight: w}
            }
          }
          if(bestResource) {
            success = true
            gc = bestResource.gameCopy
          }
          break
        
        case "Victory Point":
          player.points ++
          break
    }
    // remove the card from the player
    if(success) player.developmentCards.splice(index, 1)
    return gc
  }
  
  moveRobber(changeMain = true,gc = false){
    if(!gc){
      gc = this.copyGame(true)
    }
    let locationList = []
    let possibleLocations = gc.tileList.filter(t => t.name != "water" && t.name != "port" && t.name!="desert" && !t.robber)
    gc.tileList.find(t => t.robber).robber = false
    for(let location of possibleLocations){
      let points = []
      let a = Math.PI/3
      for(let i=0; i<6; i++) { 
        // add the points of the corner of the hexagon to the list of points, round it to 5 decimals
        points.push([Math.round((Math.cos(a * i)+location.x)*100000)/100000,Math.round((Math.sin(a * i)+location.y)*100000)/100000])
      }
      // get a list of the players owning the junctions at these points
      let players = points.map(p => gc.junctionList.find(j => (j.x == p[0] && j.y == p[1])).player).filter(p => p!==false)
      let junctions = points.map(p => gc.junctionList.find(j => (j.x == p[0] && j.y == p[1]))).filter(j => j.player != this.i && j.building)
      let totalResources = 0
      for(let j of junctions){
        if(j.building == "settlement"){
          totalResources += 1
        } else {
          totalResources += 2
        }
      }
      players = [...new Set(players)];      
      let totalPoints = 0;
      for(let p of players){
        totalPoints += playerList[p].points
      }
      locationList.push({players: players, totalResources: totalResources, location: location, totalPoints: totalPoints})
    }
    /* removes the tiles with the player itself and sorts by the tiles with the most players */
    locationList = locationList.filter(l => !l.players.includes(this.i)).sort((a, b) => b.totalResources- a.totalResources)
    /* keeps only the tiles with the most settlements next to it and sorts by best dice value */
    locationList = locationList.filter(l => l.totalResources == locationList[0].totalResources).sort((a, b) => Math.abs(7-a.location.dice) - Math.abs(7-b.location.dice))
    /* keeps only the best dice value and sorts by the total amount of points of the player that are next to the tiles */
    locationList = locationList.filter(l => Math.abs(7-l.location.dice) == Math.abs(7-locationList[0].location.dice)).sort((a, b)=> b.totalPoints - a.totalPoints)
    /* selects a location of all locations that are left */
    let bestLocation = locationList[Math.floor(Math.random()*locationList.length)]
    bestLocation.location.robber = true
    let victim = false
    let possiblePlayerSteals = bestLocation.players.filter(p => playerList[p].resources.lumber || playerList[p].resources.wool|| playerList[p].resources.ore|| playerList[p].resources.brick||playerList[p].resources.grain)
    if(possiblePlayerSteals.length != 0){
      victim = possiblePlayerSteals[Math.floor(Math.random()*possiblePlayerSteals.length)]     
      let totalResources = 0
      for(let r in gc.playerList[victim].resources){
        totalResources += gc.playerList[victim].resources[r]
      }
      if(totalResources!=0){
        let stolenResource = Math.ceil(Math.random()*totalResources)
        for(let r in gc.playerList[victim].resources){
          stolenResource -= gc.playerList[victim].resources[r]
          if(stolenResource <=0){
            gc.playerList[victim].resources[r] -=1
            gc.playerList[this.i].resources[r] += 1
            break;
          }
        }
      }
    }
    if(changeMain){
      tileList = gc.tileList
      playerList = gc.playerList
      updateSidebar(false)
    }
    return
  }
    
  robberLosing(amount){
    let resourcesRemoving = {
      lumber:0,
      wool:0,
      ore:0,
      brick:0,
      grain:0
    }
    let totalPickedResources = 0
    let allActions = []
    // loop that goes past all possbile combinations of resources to give away 
    while(resourcesRemoving.grain <= amount && resourcesRemoving.grain <= playerList[this.i].resources.grain){
      this.gameCopy = this.copyGame(true)
      totalPickedResources = 0
      // loop that checks if the exact amount of resources needed has been selected
      for(let r of Object.keys(resourcesRemoving)){
        totalPickedResources += resourcesRemoving[r]
      }
      // removes the resources in the game copy
      if(totalPickedResources == amount){
        for(let r of Object.keys(resourcesRemoving)){
          this.gameCopy.playerList[this.i].resources[r] -= resourcesRemoving[r]
          this.gameCopy.resourceBank[r] += resourcesRemoving[r]
        }
        allActions.push({weight: this.calculateWeight(false,this.gameCopy), removedResources: JSON.parse(JSON.stringify(resourcesRemoving)), gameCopy : this.gameCopy})
      }
      //loop makes sure all resource combinations are checked
      for(let r of Object.keys(resourcesRemoving)){
        resourcesRemoving[r] += 1
        if((resourcesRemoving[r]>amount||resourcesRemoving[r]>playerList[this.i].resources[r])&&r != "grain"){
          resourcesRemoving[r] = 0
        } else {
          break;
        }
      }
    }
    // check if an action has to take place
    if(allActions.length !== 0){
      // order the actions by weight
      allActions.sort((a,b) => b.weight - a.weight)
      // copy the best game copy over to the main game
      playerList = allActions[0].gameCopy.playerList
      resourceBank = allActions[0].gameCopy.resourceBank
      updateSidebar(false)
      updateResourcesInBank()
    }
  }
  
  /* function for eveluating player trades */
  acceptPlayerTrade(tradeGive,tradeGet){
    let gc = this.gameCopy
    let currentWeight = this.calculateWeight(false,gc)
    let tradePossible = true
    for(let r in tradeGive){
      gc.playerList[this.i].resources[r] += tradeGet[r]
      gc.playerList[turn].resources[r] += tradeGet[r]
      gc.playerList[this.i].resources[r] -= tradeGive[r]
      gc.playerList[turn].resources[r] += tradeGive[r]
      if(gc.playerList[this.i].resources[r] < 0){
        tradePossible = false;
        break;
      }
    }
    if(tradePossible){
      if(currentWeight < this.calculateWeight(false,gc)){
        return true;
      }
    }
    return false
  }
  
  findBankTrades(gc = this.gameCopy){
    let possibleTrades = []//[{give:"grain", giveAmount:0, get:"grain"}]]// this also gives the possibility for the ai to do no trade 
    let player = gc.playerList[this.i]
    for(let r in player.resources){
      if(player.resources[r] >= player.trades[r]){
        for(let resource in gc.resourceBank){
          if(resource != r &&gc.resourceBank[r]>0){ // prevents the trading of the same resource to a lower amount, which is dumb
            possibleTrades.push({give:r, giveAmount:player.trades[r], get:resource})
          }
        }
      }
    }
    // filter to remove duplicates
    return [...new Map(possibleTrades.map((item, key) => [item[key], item])).values()]
  }
  
  // find all roads that can be built
  findBuildRoads(gc = this.gameCopy, builtJunction=false) {
    let rl = gc.roadList 
    let jl = gc.junctionList
    let ownedRoads = []
    let ownedJunctions = []
    let availableRoads = []    
    if(gc.setupPhase != "road"){
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
      if(builtJunction) {
        // console.log(builtJunction)
        ownedRoads = []
        ownedJunctions = [builtJunction]
      }
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
    } else {
      let newestBuilding = gc.playerList[this.i].buildings[gc.playerList[this.i].buildings.length-1]
      for(let r in rl){
        if(!availableRoads.includes(rl[r])&&
           ((rl[r].x1 == newestBuilding.x && rl[r].y1 == newestBuilding.y)||
            (rl[r].x2 == newestBuilding.x && rl[r].y2 == newestBuilding.y))&&
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
    if(!gc.setupPhase){ 
      for(let r in rl){
        if(rl[r].player===this.i){
          ownedRoads.push(rl[r])
        }
      }
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
      if(gc.setupPhase == "settlement"){
        for(let j in jl){
          if((!(jl[j].player)&&jl[j].player!==0)&&
              jl[j].floorType.includes("land")){
            availableJunctions.push(jl[j]) 
          }
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
  
  copyGame(copyCheck = false, gc = this.gameCopy) {
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
      setupPhase: (copyCheck ? setupPhase : gc.setupPhase),
      resourceBank: {}
    }
    // make copies of all objects
    for(let t of tl) gameCopy.tileList.push(new Tile(t.name,t.resource,t.dice,t.img,t.color,t.x,t.y,t.rot,t.robber,true))
    for(let r of rl) gameCopy.roadList.push(new Road(r.x1,r.y1,r.x2,r.y2,r.floorType,r.player))
    for(let j of jl) gameCopy.junctionList.push(new Junction(j.x,j.y,j.floorType,false,false,j.player,j.building,j.resources,j.tradeResources,j.robber))
    
    for(let p of pl) {
      gameCopy.playerList.push(p.copy(gameCopy,jl))
    }
    
    gameCopy.resourceBank = {...rb}
    gameCopy.cardStack = [...cs]
    //console.log(gameCopy.resourceBank, gameCopy)
    return gameCopy
  }
  // find the total weight of the game state
  calculateWeight(copyCheck = true, gc = this.gameCopy) {
    let tl = (copyCheck ? tileList : gc.tileList) // tile list
    let rl = (copyCheck ? roadList : gc.roadList) // road list
    let jl = (copyCheck ? junctionList : gc.junctionList) // junction list
    let pl = (copyCheck ? playerList : gc.playerList) // player list
    
    let sp = (copyCheck ? setupPhase : gc.setupPhase)
    
    let p = pl[this.i] // player being checked
    
    let weight = 0
    
    // console.log(this.weights.points)
    // point weight
    weight += p.points*this.weights.points*25
    
    if(p.points >= 10) weight += this.weights.win
    
    // resource weight
    let tr = 0 // resource count so far
    for(let r in p.resources) {
      let rw = 0
      for(let i=0; i<p.resources[r]; i++) {
        tr++
        // the weight of each resource card is the weight of the resource type combined with the weight for too many cards
        rw += (this.weights.resourceWeights[r] - (tr > this.weights.haveCards ? this.weights.manyCards+this.weights.resourceWeights[r]/2 : 0))/10
        
      } 
      weight += rw
      // add something in here for having many of the same card???
    }
    
    // development card weight
    weight += p.developmentCards.length*this.weights.developmentCard
    // longest road / largest army weights
    weight += p.longestRoad*this.weights.longerRoad/(p.longestRoadHolder ? 2 : 1)
    weight += p.armySize*this.weights.largerArmy/(p.largestArmyHolder ? 2 : 1)
    // maximize amount of possible build junctions to build roads sensibly
    let buildJunctions = this.findBuildSettlements(gc)
    weight += (buildJunctions.length+p.buildings.length)*(this.weights.junctionPlaces)/5
    // keep track of which resources the bot has access to already
    let builtResources = {lumber:0,wool:0,ore:0,brick:0,grain:0}
    
    // weights for each resource and port the player has built on
    for(let j of jl) {
      if(j.player !== this.i || !j.building) continue;
      for(let r of j.resources) {
        // console.log(r)
        if(r.type && r.num) {
          weight += (this.weights.resourceWeights[r.type]*(j.building == "city" ? 2 : 1)
                      *(this.weights.diceProbability**Math.abs(r.num-7))*10)
                      /(builtResources[r.type] == 0 ? (1-this.weights.newResource)/10 : 1)
          if(isNaN(weight)) console.log(weight)
          builtResources[r.type]++
        }
      } 
      for(let r of j.tradeResources) {
        if(j.tradeResources != "general"){
          weight += this.weights.ports * this.weights.resourceWeights[r]/5
        }
        if(isNaN(weight)) console.log(weight,this.weights.ports,this.weights.resourceWeights[r],r)
      }
    }
    if(isNaN(weight)) console.log(weight)
    for(let buy in buyData) {
      let canBuy = true;
      let cost = buyData[buy].cost
      for(let r in cost) {
        if(gc.playerList[this.i].resources[r] < cost[r]) canBuy=false;
      }
      if(canBuy) weight+=this.weights.affordBuyWeights[buy]
      if(isNaN(weight)) console.log(weight,this.weights.affordBuyWeights[buy],buy) 
    }
    if(isNaN(weight)) console.log(weight)    
    
    return weight
  }
}

function generateWeights() {
  return {
    win: 1000000,
    haveCards: 7+Math.floor(Math.random()*10),
    points: Math.random(),
    diceProbability: Math.random(),
    developmentCard: Math.random(),
    resources: Math.random(),
    longerRoad: Math.random(),
    largerArmy: Math.random(),
    sameCards: Math.random(),
    manyCards: Math.random(),
    ports: Math.random(),
    roads: Math.random(),
    newResource: Math.random(),
    junctionPlaces: Math.random(),
    resourceWeights: {
      lumber: Math.random(),
      wool: Math.random(),
      ore: Math.random(),
      brick: Math.random(),
      grain: Math.random(),
      general: Math.random()
    },
    affordBuyWeights: {
      road: Math.random(),
      settlement: Math.random(),
      city: Math.random(),
      developmentCard: Math.random()
    }
    /*resourceWeights: {
      lumber: 0.5,
      wool: 0.5,
      ore: 0.5,
      brick: 0.5,
      grain: 0.5,
      general: 0.5
    }*/
  }
}