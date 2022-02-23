function zoom(e) {
  if(e.deltaY < 0) zoomLevel += 0.05
  if(e.deltaY > 0) zoomLevel -= 0.05
  if(zoomLevel < 0.5) zoomLevel = 0.5
  if(zoomLevel > 2) zoomLevel = 2
}

function click(e) {
  let clicked = false;
  
  for(let j of junctionList) {
    let canBuild = false;
    // allow player to build in setup phase
    if(setupPhase == "settlement") canBuild = true;
    // check if a junction is clicked
    if(j.checkClickCollision(e.offsetX, e.offsetY)) {
      clicked = {type: "junction", info: j}
      // find the junctions close to this junction
      let adjacentRoads = roadList.filter(r => (r.x1 == j.x && r.y1 == j.y) || (r.x2 == j.x && r.y2 == j.y))
      let closeJunctions = []
      for(let road of adjacentRoads) {
        // allow the player to build if there's a road owned by that player next to it
        if(road.player === turn) canBuild = true;
        closeJunctions.push(junctionList.find(j => j.x == road.x1 && j.y == road.y1))
        closeJunctions.push(junctionList.find(j => j.x == road.x2 && j.y == road.y2))
      }
      // check if there are any settlements too close to the clicked junction
      for(let closeJunction of closeJunctions.filter(junc => junc!=j)) {
        if(closeJunction.player || closeJunction.player===0) canBuild = false
      }
      if(canBuild) {
        if(!j.player&&j.player!==0){
          if(j.floorType.includes("land")) {
            // if the junction can be built on, place the building.
            if(setupPhase == "settlement" || choosingBuilding == "settlement") {
              if(setupPhase == "settlement") setupPhase = "road"
              j.player = turn;
              if(j.tradeResources.length !== 0){
                if(j.tradeResources[0] == "general"){
                  for(r in playerList[turn].trades){
                    if(playerList[turn].trades[r]==4) playerList[turn].trades[r] = 3
                  }
                } else {
                  playerList[turn].trades[j.tradeResources[0]] = 2
                }
              }
              j.building = "settlement"
              playerList[turn].buildings.push(j)
              playerList[turn].settlementLeft--
              playerList[turn].points++
              if(!setupPhase) {
                let cost = buyData[choosingBuilding].cost
                for(let r in cost){
                  playerList[turn].resources[r] -= cost[r]
                  resourceBank[r] += cost[r] 
                  updateResourcesInBank()
                }
                choosingBuilding = false;
                soundEffect("https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/434130__89o__place.wav?v=1643479854443")
                document.getElementById("buyData").style.display="none"
                document.getElementById("shop").style.display="block"
              } else {
                if(setupAmount > 0) {
                  for(let r of j.resources) {
                    if(r.type){
                      playerList[turn].resources[r.type]++
                      resourceBank[r.type]-- 
                    }
                  } 
                  updateSidebar(turn)
                  updateResourcesInBank()
                }
                builtSettlement = j
                soundEffect("https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/434130__89o__place.wav?v=1643479854443")
              }       
              winCheck();
            }
            
          }
        } else if(j.player === turn && j.building == "settlement") {
          if(choosingBuilding == "city") {
            j.building = "city";
            playerList[turn].settlementLeft++;
            playerList[turn].cityLeft--;
            playerList[turn].points++
            let cost = buyData[choosingBuilding].cost
            for(let r in cost){
              playerList[turn].resources[r] -= cost[r]
              resourceBank[r] += cost[r]
              updateResourcesInBank()
            }
            choosingBuilding = false;
            soundEffect("https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/434130__89o__place.wav?v=1643479854443")
            showShop(true)
            document.getElementById("buyData").style.display="none"
            document.getElementById("shop").style.display="block"
            winCheck();
          }
          
        }
      }
      updateSidebar(turn)
      
      break;
    }
  }
  if(!clicked) {
    // check if a road is clicked
    for(let r of roadList) {
      let canBuild = false;
      if(r.checkClickCollision(e.offsetX, e.offsetY)) {
        clicked = {type: "road", info: r}
        // find the junctions attached to this road
        let adjacentJunctions = [junctionList.find(j => j.x == r.x1 && j.y == r.y1), junctionList.find(j => j.x == r.x2 && j.y == r.y2)]
        
        // in the setup phase, only allow the player to place the road next to the last built settlement
        if(setupPhase == "road") {
          adjacentJunctions = []
          if((builtSettlement.x == r.x1 && builtSettlement.y == r.y1) || (builtSettlement.x == r.x2 && builtSettlement.y == r.y2)) adjacentJunctions.push(builtSettlement)
        }
        
        let adjacentRoads = []
        
        //find the other roads attached to this road
        for(let j of adjacentJunctions) {
          // allow the player to build a road if they own either of the junctions attached to it
          if(j.player === turn) canBuild = true;
          adjacentRoads = [...adjacentRoads, ...roadList.filter(r => (r.x1 == j.x && r.y1 == j.y) || (r.x2 == j.x && r.y2 == j.y)).filter(road => road!=r)]
        }
        // allow the player to build the road if they own another road attached to this one
        for(let road of adjacentRoads) if(road.player === turn) canBuild = true;
        if(canBuild) {
          if(!r.player&&r.player!==0) {
            if(r.floorType.includes("land")) {
              if(setupPhase == "road") {
                builtSettlement = false;
                soundEffect("https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/434130__89o__place.wav?v=1643479854443")
                // road building in setup phase
                r.player = turn;
                playerList[turn].roads.push(r)
                playerList[turn].roadLeft--
                updateLongestRoad()
                
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
                  document.getElementById("dieButton").disabled = false;
                } else setupPhase = "settlement"
                updateSidebar(turn, true)
              } else {
                if(choosingBuilding == "road") {
                  r.player = turn;
                  playerList[turn].roads.push(r)
                  playerList[turn].roadLeft--
                  updateLongestRoad()
                  
                  updateSidebar(turn, true)
                  soundEffect("https://cdn.glitch.global/36f95d5d-d303-4106-929b-7b4cf36b4608/434130__89o__place.wav?v=1643479854443")
                  if(buyFreeRoads > 0) {
                    buyFreeRoads--
                  } else {
                    let cost = buyData[choosingBuilding].cost
                    for(let r in cost){
                      playerList[turn].resources[r] -= cost[r]
                      resourceBank[r] += cost[r]
                      updateResourcesInBank()
                    }
                  }
                  if(buyFreeRoads <=0) {
                    choosingBuilding = false;
                    showShop(true)
                    document.getElementById("buyData").style.display="none"
                    document.getElementById("shop").style.display="block"
                    document.getElementById("cancelBuyBtn").style.display = "block"
                  }
                  
                }
                
              }
              
            }
          }
        }
        
        break;
      }
    }
  }
  if(newRobberLocation){
    for(let tile in tileList){
      if(tileList[tile].checkClickCollision(e.offsetX,e.offsetY)){
        newRobberLocation = false;
        let output = "<table id='resourceStealing'>"
        output += "<tr><th>player</th><th>total resource cards</th><th>player selection</th><tr>"
        let totalResources = 0
        
        // find all corners of the tile
        let points = []
        let a = Math.PI/3
        for(let i=0; i<6; i++) { 
          // add the points of the corner of the hexagon to the list of points, round it to 5 decimals
          points.push([Math.round((Math.cos(a * i)+tileList[tile].x)*100000)/100000,Math.round((Math.sin(a * i)+tileList[tile].y)*100000)/100000])
        }
      
        // get a list of the players owning the junctions at these points
        let players = points.map(p => junctionList.find(j => (j.x == p[0] && j.y == p[1])).player).filter(p => p!==false)
        players = [...new Set(players)];
        players = players.sort(function (a, b) {  return a - b;  });
        if(players.length != 0 && !(players.length == 1 && players[0] == turn)){
          stealResource = true;
          for(let p in players){
            let victim = players[p]
            if(victim != turn){
              totalResources = 0
              for(let r in playerList[victim].resources){
                totalResources += playerList[victim].resources[r]
              }
              output +="<tr><td>"+playerList[victim].name+"</td><td>"+totalResources+"</td><td>"+"<button onclick='playerSteals("+victim+","+totalResources+")'>steal from " + playerList[victim].name + "</button></td></tr>"   
            }
          }
          output += "</table>"
          document.getElementById("informationDisplay").style.display = "block"
          document.getElementById("informationDisplay").innerHTML = output
        } else {
          disableButtons(false)
          /*
          document.getElementById("shopButton").disabled = false;  
          document.getElementById("endTurnButton").disabled = false;
          document.getElementById("bankTrade").disabled = false;
          document.getElementById("tradeWithPlayers").disabled = false;
          document.getElementById("playerCards"+turn).disabled = false;  
          */
        }
        document.getElementById("placeRobberInfo").style.display="none"
      } 
    }
  }
}
  
// update the longest road length for each player
function updateLongestRoad() {
  // loop through all roads owned by a player
  for(let road of roadList) {
    if(road.player !== false) {
      // find the length for that road
      let player = road.player
      let roadLen = checkLongestRoad(player, road)
      
      // update the longest road for the player
      if(roadLen > playerList[player].longestRoad) playerList[player].longestRoad = roadLen
      // update the person who holds the longest road if the road is longer
      if(longestRoadPlayer === false && playerList[player].longestRoad >=5) {
        // if no one has the largest road yet and the player's road length is 5 or more, they are now the longest road holder
        longestRoadPlayer = player
        playerList[player].longestRoadHolder = true;
        playerList[player].points+=2
      } else if(longestRoadPlayer !== false) {
        // if someone already has the longest road, check if the player's road length is bigger than that of the current longest road
        let longestRoadHolder = playerList[longestRoadPlayer]
        if(playerList[player].longestRoad > longestRoadHolder.longestRoad) {
          longestRoadHolder.points-=2
          playerList[player].points+=2
          longestRoadHolder.longestRoadHolder = false;
          playerList[player].longestRoadHolder = true
        }
      }
    }
  }
  updateSidebar()
}

// find the longst road a player has
function checkLongestRoad(p, r, l=0, checked=[], j=false) {
  let adjacentJunctions = [junctionList.find(j => j.x == r.x1 && j.y == r.y1), junctionList.find(j => j.x == r.x2 && j.y == r.y2)]
  if(j) {
    adjacentJunctions = adjacentJunctions.filter(junc => j!=junc)
    if(j.player !== p && j.player !== false) return l;
  }
  let adjacentRoads = []
  
  let oldL = l
  
  //find the other roads attached to this road
  for(let j of adjacentJunctions) {
    if(j.player === turn) canBuild = true;
    adjacentRoads = [...adjacentRoads, ...roadList.filter(r => (r.x1 == j.x && r.y1 == j.y) || (r.x2 == j.x && r.y2 == j.y)).filter(road => road!=r)]
  }
  let best = l
  // loop through all roads next to the junction(s)
  for(let roadI in adjacentRoads) {
    let road = adjacentRoads[roadI]
    // if the road wasnt checked yet and if it is owned by the player, continue the path that way
    if(!checked.includes(r.x1+"_"+r.y1+"_"+r.x2+"_"+r.y2) && r.player === p) {
      let nj = adjacentJunctions[(roadI < 2 ? 0 : 1)]
      // make a copy of the array of checked roads for each possible path from here
      let checkedCopy = [...checked, r.x1+"_"+r.y1+"_"+r.x2+"_"+r.y2]
      // check if the new path is better than the old path
      best = Math.max(checkLongestRoad(p, road, l+1, checkedCopy, nj), best)
    }
    
  }
  return best;
}