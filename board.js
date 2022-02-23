class Tile{
  constructor(name,resource,dice,img,color,x,y,rot, robber=false, copy=false){
    this.x = x // position of the tile
    this.y = y // position of the tile
    this.rot = rot*Math.PI/3 // rotation of the tile
    this.name = name // stores the tile name
    this.img = img
    this.color = color // just for testing fase, probably will be removed later
    this.resource = resource // stores the resource that the field gives when its value is roled on the dice
    this.dice = dice // what number has to be rolled for this field to give away resources  
    this.robber = robber; // stores whether the robber is on this tile
    
    // dont do all this stuff if it's just copying the board
    if(!copy) {
      if(name == "desert" && !robberPlaced) {
        this.robber = true;
        robberPlaced = true;
      }
      //setup stuff for adjacent roads/junctions
      let points = []
      let a = Math.PI/3
      for(let i=0; i<6; i++) { 
        // add the points of the corner of the hexagon to the list of points, 
        // round it to 5 decimals
        points.push([Math.round((Math.cos(a * i)+x)*100000)/100000,Math.round((Math.sin(a * i)+y)*100000)/100000])
      }
      for(let p in points) {
        // set some variables for finding and setting junctions/roads
        p=+p
        let tradeResource = resource
        let point = points[p]
        let nextPoint = (p+1 < points.length ? points[p+1] : points[0])
        let floor = (name == "water" || name == "port" ? "water" : "land")
        if(name == "port") {
          let r1 = rot+1
          let r2 = rot+2
          if(r1 >= 6) r1-=6
          if(r2 >= 6) r2-=6
          if(p == r1 || p == r2) {} else tradeResource = false
        }
        // add all junctions attached to the tile to the list of junctions
        let existJunction = junctionList.find(j => (j.x == point[0] && j.y == point[1]))
        if(existJunction) {
          if(!existJunction.floorType.includes(floor)) existJunction.floorType.push(floor)
          if(name == "port" && tradeResource) existJunction.tradeResources.push(tradeResource)
          else if(name != "water") existJunction.resources.push({type: resource, num: dice})
        } else junctionList.push(new Junction(point[0],point[1], [floor], (name == "port" ? false : {type: resource, num: dice}), (name == "port" ? tradeResource : false)))

        // add all roads attached to the tile to the list of roads
        let existRoad = roadList.find(r => (
                               [r.x1, r.x2].includes(point[0]) && [r.x1, r.x2].includes(nextPoint[0]) && 
                               [r.y1, r.y2].includes(point[1]) && [r.y1, r.y2].includes(nextPoint[1])
                        )) 
        if(existRoad) {
          if(!existRoad.floorType.includes(floor)) existRoad.floorType.push(floor)
        } else roadList.push(new Road(point[0],point[1],nextPoint[0],nextPoint[1], [floor]))
      }
    }
    
    
  }
  draw() {
    // position and stuff
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel
    let rot = this.rot
    let x = this.x*scl
    let y = this.y*scl

    let w = (Math.cos(0)-Math.cos(Math.PI))*scl
    let h = (Math.sin(60*Math.PI/180)-Math.sin(240*Math.PI/180))*scl

    let image = this.img

    // canvas transformations
    ctx.save()
    ctx.translate(x+canvas.width/2,y+canvas.height/2)
    if(rot) ctx.rotate(rot)
    
    
    // draw the tile
    ctx.drawImage(image, -0.5*w, -0.5*h, w, h)
    if(this.dice) {
      // draw the number on the tile
      let nr = scl*0.6
      if(rot) ctx.rotate(-rot)
      ctx.drawImage(numImage,-nr/2,-nr/2,nr,nr)
      nr = scl*0.7*(1/Math.sqrt(Math.abs(7-this.dice)))
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = (this.dice == 6 || this.dice == 8 ? "#ff0000" : "#000000")
      ctx.font = nr*0.8 + 'px serif';
      ctx.fillText(this.dice, 0, 0.03*nr)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
    if(this.robber){ // draw the robber if it is on the tile
      ctx.drawImage(robberImage,-0.5*w, -0.65*h, w, h)
    }
    //undo canvas transformations
    ctx.restore()
  }
  checkClickCollision(clickX, clickY){
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel
    let rot = this.rot
    let x = this.x
    let y = this.y
    let h = (Math.sin(60*Math.PI/180)-Math.sin(240*Math.PI/180))*scl
    let a = Math.PI/3
    let vs = []    
    for(let i=0; i<6; i++) { 
      vs.push([(Math.cos(a * i)+x)*scl+canvas.width/2,(Math.sin(a * i)+y)*scl+canvas.height/2])
    }
    if(this.name != "water" && this.name != "port" && this.name != "desert" && !this.robber){
      var inside = false;
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          var xi = vs[i][0], yi = vs[i][1];
          var xj = vs[j][0], yj = vs[j][1];

          var intersect = ((yi > clickY) != (yj > clickY))
              && (clickX < (xj - xi) * (clickY - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      } 
      if(inside){
        for(let t in tileList){
          if(tileList[t].robber){
            tileList[t].robber=false;
            break;
          }
        }
        return this.robber = true
      }
    }
  }
}

class Road {
  constructor(sx, sy, fx, fy, floorType=[], player=false) {
    // position of the road  
    this.x1 = sx
    this.y1 = sy
    this.x2 = fx
    this.y2 = fy
    
    // center of the road
    let cx = (sx+fx)/2
    let cy = (sy+fy)/2
    
    // points of road hitbox
    this.p1 = [(sx-cx)*0.4+cx,(sy-cy)*0.4+cy]
    this.p2 = [(fx-cx)*0.4+cx,(fy-cy)*0.4+cy]
    
    this.player = player 
    this.floorType = [...floorType] //land/water
  } 
  draw() { 
    // position and stuff
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let x1 = this.p1[0]*scl + canvas.width/2
    let y1 = this.p1[1]*scl + canvas.height/2
    let x2 = this.p2[0]*scl + canvas.width/2
    let y2 = this.p2[1]*scl + canvas.height/2
    
    // draw the road if a player has built it
    if(this.player||this.player===0){
      ctx.strokeStyle = "black"
      ctx.lineCap = "square"
      ctx.lineWidth = scl*0.15
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.strokeStyle = playerList[this.player].color
      ctx.lineWidth = scl*0.12
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.lineCap = "butt"
    }
  }
  checkClickCollision(clickX, clickY) {
    // check if this road was clicked
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let p1 = [this.p1[0]*scl+ canvas.width/2,this.p1[1]*scl+ canvas.height/2]
    let p2 = [this.p2[0]*scl+ canvas.width/2,this.p2[1]*scl+ canvas.height/2]
    if(distToSegment([clickX, clickY],p1,p2) < 0.07*scl) {
      return true;
    } else return false;
  }
}


class Junction {
  constructor(x,y,floorType,resource,tradeResource,player=false,building=false,resources=[],tradeResources=[]) {
    // positions of the junction
    this.x = x
    this.y = y
    this.player = player
    this.building = building
    
    this.floorType = [...floorType] //land/water
    
    // what resources the junction has available, and wat ports it has access to
    this.resources = [...resources]
    this.tradeResources = [...tradeResources]
    if(resource && resource.type) this.resources.push(resource)
    if(tradeResource) this.tradeResources.push(tradeResource)
  }
  draw() {
    // position and stuff
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let x = this.x*scl + canvas.width/2
    let y = this.y*scl + canvas.height/2
    // draw a settlement or a city if a player has built it
    ctx.lineWidth = 0.03*scl
    if(this.player||this.player===0){
      ctx.strokeStyle = "#000000"
      ctx.fillStyle = playerList[this.player].color
      if(this.building == "city") {
        ctx.beginPath();
        ctx.moveTo(x-0.2*scl,y+0.2*scl)
        ctx.lineTo(x+0.2*scl,y+0.2*scl)
        ctx.lineTo(x+0.2*scl,y)
        ctx.lineTo(x,y)
        ctx.lineTo(x,y-0.1*scl)
        ctx.lineTo(x-0.1*scl,y-0.25*scl)
        ctx.lineTo(x-0.2*scl,y-0.1*scl)
        
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(x,y-0.25*scl)
        ctx.lineTo(x+0.12*scl,y-0.12*scl)
        ctx.lineTo(x+0.12*scl,y+0.12*scl)
        ctx.lineTo(x-0.12*scl,y+0.12*scl)
        ctx.lineTo(x-0.12*scl,y-0.12*scl)
        
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
      }
    }
    
  }
  checkClickCollision(clickX, clickY) {
    // check if this junction was clicked
    let scl = (Math.min(canvas.width,canvas.height)/13)*zoomLevel    
    let x = this.x*scl + canvas.width/2
    let y = this.y*scl + canvas.height/2
    
    let r = scl*0.175
    if(Math.sqrt(Math.abs(x-clickX)**2+Math.abs(y-clickY)**2) < r) {
      return true;
    } else return false;
  }
}
