//https://permadi.com/1996/05/ray-casting-tutorial-7/

var keys=[];
keyPressed=function(){keys[keyCode] = true;};
keyReleased=function(){keys[keyCode] = false;};

var LEFT_ARROW = 37;
var RIGHT_ARROW = 39;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

var Vector = function(x ,y){
    this.x = x;
    this.y = y;

    this.normalize = function(){
        var angle = Math.atan2(this.y, this.x);
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
    }

    this.add = function(other){
        if(!other.x){
            this.x += other;
            this.y += other;
        }else{
            this.x += other.x;
            this.y += other.y;
        }
    }

    this.subtract = function(other){
        if(!other.x){
            this.x -= other;
            this.y -= other;
        }else{
            this.x -= other.x;
            this.y -= other.y;
        }
    }

    this.mult = function(other){
        if(!other.x){
            this.x *= other;
            this.y *= other;
        }else{
            this.x *= other.x;
            this.y *= other.y;
        }
    }

    this.getAngle = function(){
        return Math.atan2(this.y, this.x);
    }

    this.length = function(){
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
}

var Ray = function(origin, direction){
    this.origin = origin;
    this.direction = direction;
}

var gameMap = {
    data : [
        "1100000011",
        "1200000021",
        "0000110000",
        "0000000000",
        "0010000100",
        "00100S0100",
        "0000000000",
        "0000110000",
        "1200000021",
        "1100000011",
    ],

    miniMapSize : 10,

    setup : function(){
        for(var y = 0; y < this.data.length; y++){
            for(var x = 0; x < this.data[y].length; x++){
                if(this.data[y][x] === "S"){
                    player.pos.x = x;
                    player.pos.y = y;
                }
            }
        }
    },

    drawMiniMap : function(){
        var blockSize = Math.ceil((width / this.miniMapSize) / (this.data.length > this.data[0].length ? this.data.length : this.data[0].length));
        for(var y = 0; y < this.data.length; y++){
            for(var x = 0; x < this.data[y].length; x++){
                if(this.data[y][x] === "1"){
                    fill(50, 50, 50);
                }else if(this.data[y][x] === "2"){
                    fill(255, 255, 0);
                }else{
                    continue;
                }
                
                rect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }

        push();
            fill(255, 0 , 0);
            rectMode(CENTER);
            translate(player.pos.x * blockSize, player.pos.y * blockSize);
            rotate(player.direction.getAngle());
            rect(0, 0, blockSize / 2, blockSize / 2);
            strokeWeight(2);
            stroke(255, 0, 0);
            line(0, 0, blockSize / 2, 0);
            noStroke();
        pop();
    },

    getRayCollision : function(ray){
        //Digital differential analyzer
        var dx = ray.direction.x;
        var dy = ray.direction.y;

        var xa;
        var ya;

        var xb;
        var yb;

        var hFirstHit = new Vector(0, 0);
        var vFirstHit = new Vector(0, 0);
        var angle = ray.direction.getAngle();

        if(dx > 0){
            hFirstHit.x = Math.ceil(ray.origin.x) - ray.origin.x;
            var px = hFirstHit.x;
            hFirstHit.y = Math.tan(angle) * px;
            xa = 1;
            ya = Math.tan(angle) * xa;
        }else{
            hFirstHit.x = Math.floor(ray.origin.x) - ray.origin.x;
            var px = hFirstHit.x;
            hFirstHit.y = Math.tan(angle) * px;
            xa = -1;
            ya = Math.tan(angle) * xa;
        }

        if(dy > 0){
            vFirstHit.y = Math.ceil(ray.origin.y) - ray.origin.y;
            var py = vFirstHit.y;
            vFirstHit.x = py / Math.tan(angle);
            yb = 1;
            xb = yb / Math.tan(angle);
        }else{
            vFirstHit.y = Math.floor(ray.origin.y) - ray.origin.y;
            var py = vFirstHit.y;
            vFirstHit.x = py / Math.tan(angle);
            yb = -1;
            xb = yb / Math.tan(angle);
        }

        var intersection = hFirstHit;
        var hOffset = new Vector(xa, ya);
        var vOffset = new Vector(xb, yb);
        var hit = null;

        var blockSize = Math.ceil((width / this.miniMapSize) / (this.data.length > this.data[0].length ? this.data.length : this.data[0].length));
        strokeWeight(5);
        stroke(0, 255, 0);

        //Horizontal intersections
        while(intersection.length() < ray.direction.length()){
            var mapX = xa > 0 ? player.pos.x + intersection.x : player.pos.x + intersection.x - 1;
            var mapY = Math.floor(player.pos.y + intersection.y);
            if(mapY >= 0 && mapY < this.data.length){
                if(mapX >= 0 && mapX < this.data[mapY].length){
                    var char = this.data[mapY][mapX];
                    if(char === "1"){
                        hit = {
                            char: char,
                            distance: intersection.length(),
                            vector: intersection,
                            x: xa,
                            y: ya
                        };
                        break;
                    }
                }
            }
            intersection.add(hOffset);
        }

        intersection = vFirstHit;

        //Vertical intersections
        while(intersection.length() < ray.direction.length()){
            if(hit != null){
                if(intersection.length() > hit.distance){
                    break;
                }
            }
            var mapX = Math.floor(player.pos.x + intersection.x);
            var mapY = yb > 0 ? player.pos.y + intersection.y : player.pos.y + intersection.y - 1;
            if(mapY >= 0 && mapY < this.data.length){
                if(mapX >= 0 && mapX < this.data[mapY].length){
                    var char = this.data[mapY][mapX];
                    if(char === "1"){
                        hit = {
                            char: char,
                            distance: intersection.length(),
                            vector: intersection,
                            x: xa,
                            y: ya
                        };
                        break;
                    }
                }
            }
            intersection.add(vOffset);
        }

        if(hit != null){
            point((player.pos.x + hit.vector.x) * blockSize, (player.pos.y + hit.vector.y) * blockSize);
        }

        noStroke();

        return hit;
    }
}

var player = {
    pos : new Vector(0, 0),
    size : 0.1,
    direction : new Vector(1,1),
    speed : 0,
    maxSpeed : 0.1,
    turnSpeed : Math.PI / 50,

    screenWidth : 320,
    screenHeight : 240,
    focalLength : 560,
    renderRange : 20,
    scale : 100,

    update : function(){
        this.move();
        this.render();
    },

    move : function(){
        this.direction.normalize();
        this.direction.mult(this.maxSpeed);

        var angle = this.direction.getAngle();

        if(keys[RIGHT_ARROW]){
            angle += this.turnSpeed;
        }

        if(keys[LEFT_ARROW]){
            angle -= this.turnSpeed;
        }

        this.direction = new Vector(Math.cos(angle) * this.direction.length(), Math.sin(angle) * this.direction.length());

        if(keys[UP_ARROW]){
            this.speed = 1;
        }else if(keys[DOWN_ARROW]){
            this.speed = -1;
        }else{
            this.speed = 0;
        }

        this.pos.x += this.direction.x * this.speed;
        this.collision(this.direction.x * this.speed, 0);
        this.pos.y += this.direction.y * this.speed;
        this.collision(0, this.direction.y * this.speed);
    },

    render : function(){
        for(var x = 0; x < this.screenWidth; x += this.scale){
            var relativeX = x - this.screenWidth / 2;
            var rayDirection = new Vector(relativeX, this.focalLength);
            var rayAngle = rayDirection.getAngle() + this.direction.getAngle() - Math.PI / 2;
            rayDirection = new Vector(Math.cos(rayAngle), Math.sin(rayAngle));
            rayDirection.mult(this.renderRange);
            var ray = new Ray(this.pos, rayDirection);
            var rayCollision = gameMap.getRayCollision(ray);
            if(rayCollision === null){
                continue;
            }
            var beta = this.direction.getAngle() - rayCollision.getAngle(); //angle of hit relative to viewing angle
            var distance = rayCollision.distance + Math.cos(beta);
        }
    },

    collision : function(dx, dy){
        for(var y = 0; y < gameMap.data.length; y++){
            for(var x = 0; x < gameMap.data[y].length; x++){
                if(gameMap.data[y][x] !== "1"){
                    continue;
                }
                if(this.pos.x > x - this.size && this.pos.x < x + 1 + this.size && this.pos.y > y -this.size && this.pos.y < y + 1 + this.size){
                    if(dx > 0){
                        this.pos.x = x - this.size;
                    }else if(dx < 0){
                        this.pos.x = x + 1 + this.size;
                    }

                    if(dy > 0){
                        this.pos.y = y - this.size;
                    }else if(dy < 0){
                        this.pos.y = y + 1 + this.size;
                    }
                }
            }
        }
    },

    setScreen : function(width, height){
        this.screenWidth = width;
        this.screenHeight = height;
    }
}

function setup(){
    createCanvas(document.body.clientWidth, window.innerHeight);
    player.setScreen(document.body.clientWidth, window.innerHeight);
    noStroke();
    gameMap.setup();
}

function windowResized() { 
    resizeCanvas(document.body.clientWidth, window.innerHeight); 
    player.setScreen(document.body.clientWidth, window.innerHeight);
}

function draw(){
    background(255, 255 ,255);
    gameMap.drawMiniMap();
    player.update();
}