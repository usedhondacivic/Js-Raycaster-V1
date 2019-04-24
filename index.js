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
        "11      22          ",
        "1L      L2     1 1 1",
        "    66          2 2 ",
        "               3 3 3",
        "  5    5        4 4 ",
        "  5  S 5       5 5 5",
        "                6 6 ",
        "    66         1 1 1",
        "4L      L3      1 1",
        "44      33     1 1 1",
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

        this.colors = {
            "1" : color(230, 230, 230),
            "2" : color(255, 0, 0),
            "3" : color(0, 255, 0),
            "4" : color(0, 0, 255),
            "5" : color(0, 255, 255),
            "6" : color(255, 255, 0),
            floorStart : color(255, 255, 255),
            floorEnd : color(150, 150, 150),
            ceilingStart : color(150, 200, 200),
            ceilingEnd : color(0, 0, 75)
        };
    },

    drawMiniMap : function(){
        var blockSize = Math.ceil((width / this.miniMapSize) / (this.data.length > this.data[0].length ? this.data.length : this.data[0].length));

        fill(0, 0, 0, 50);
        rect(0, 0, this.data.length * blockSize, this.data[0].length * blockSize);

        for(var y = 0; y < this.data.length; y++){
            for(var x = 0; x < this.data[y].length; x++){
                if(parseInt(this.data[y][x])){
                    fill(this.colors[this.data[y][x]]);
                }else if(this.data[y][x] === "L"){
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
            mapX = Math.round(mapX);
            var mapY = Math.floor(player.pos.y + intersection.y);
            if(mapY >= 0 && mapY < this.data.length){
                if(mapX >= 0 && mapX < this.data[mapY].length){
                    var char = this.data[mapY][mapX];
                    if(parseInt(char)){
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
            mapY = Math.round(mapY);
            if(mapY >= 0 && mapY < this.data.length){
                if(mapX >= 0 && mapX < this.data[mapY].length){
                    var char = this.data[mapY][mapX];
                    if(parseInt(char)){
                        hit = {
                            char: char,
                            distance: intersection.length(),
                            vector: intersection,
                            x: xb,
                            y: yb
                        };
                        break;
                    }
                }
            }
            intersection.add(vOffset);
        }

        if(hit != null){
            //point((player.pos.x + hit.vector.x) * blockSize, (player.pos.y + hit.vector.y) * blockSize);
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
    maxSpeed : 0.05,
    turnSpeed : Math.PI / 100,

    screenWidth : 320,
    screenHeight : 240,
    focalLength : 560,
    fov : Math.PI / 3,
    renderRange : 20,
    scale : 2,

    colorMultiplier : 10,

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
        for(var y = 0; y < this.screenHeight / 2; y += this.scale * 2){
            
        }

        for(var y = this.screenHeight * 0.75; y > this.screenHeight / 2; y -= this.scale * 2){
            var color = lerpColor(gameMap.colors.floorEnd, gameMap.colors.floorStart, (y - this.screenHeight / 2) / (this.screenHeight * 0.25));
            fill(color);
            rect(0, Math.round(y), this.screenWidth, -this.scale * 2);
        }

        for(var x = 0; x < this.screenWidth; x += this.scale){
            var relativeX = -(x - this.screenWidth / 2);
            var rayDirection = new Vector(relativeX, this.focalLength);
            var rayAngle = rayDirection.getAngle() + this.direction.getAngle() - Math.PI / 2;
            rayDirection = new Vector(Math.cos(rayAngle), Math.sin(rayAngle));
            rayDirection.mult(this.renderRange);
            var ray = new Ray(this.pos, rayDirection);
            var rayCollision = gameMap.getRayCollision(ray);
            if(rayCollision === null){
                continue;
            }
            var beta = this.direction.getAngle() - rayCollision.vector.getAngle(); //angle of hit relative to viewing angle
            var distance = rayCollision.distance * Math.cos(beta); //Distance adjusted to remove fisheye effect

            var wallHeight = (1 / distance) * this.focalLength;

            noStroke();
            var color = this.getColor(gameMap.colors[rayCollision.char], distance, rayCollision.x);
            fill(color);
            rect(x, this.screenHeight / 2 - wallHeight / 2, this.scale, wallHeight);
        }
    },

    getColor : function(c, distance, dx){
        var shadow;
        if(Math.abs(dx) === 1){
            if(dx > 0){
                shadow = 1;
            }else{
                shadow = 0.7;
            }
        }else{
            shadow = 0.85;
        }
        return color(Math.min(c.levels[0] / distance * this.colorMultiplier * shadow, c.levels[0] * shadow), Math.min(c.levels[1] / distance * this.colorMultiplier * shadow, c.levels[1] * shadow), Math.min(c.levels[2] / distance * this.colorMultiplier * shadow, c.levels[2] * shadow));
    },

    collision : function(dx, dy){
        for(var y = 0; y < gameMap.data.length; y++){
            for(var x = 0; x < gameMap.data[y].length; x++){
                if(!parseInt(gameMap.data[y][x])){
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
        this.focalLength = (this.screenWidth / 2) / Math.tan(this.fov / 2);
    }
}

function setup(){
    createCanvas(document.body.clientWidth, window.innerHeight);
    player.setScreen(document.body.clientWidth, window.innerHeight);
    gameMap.setup();
}

function windowResized() { 
    resizeCanvas(document.body.clientWidth, window.innerHeight); 
    player.setScreen(document.body.clientWidth, window.innerHeight);
}

function draw(){
    background(255, 255 ,255);
    player.update();
    gameMap.drawMiniMap();
}