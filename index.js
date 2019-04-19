//https://permadi.com/1996/05/ray-casting-tutorial-7/

var keys=[];
keyPressed=function(){keys[keyCode] = true;};
keyReleased=function(){keys[keyCode] = false;};

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

    this.mult = function(other){
        if(!other.x){
            this.x *= other;
            this.y *= other;
        }else{
            this.x *= other.x;
            this.y *= other.y;
        }
    }

    this.length = function(){
        return Math.sqrt(Math.pow(this.x, 2), Math.pow(this.y, 2));
    }
}

var Ray = function(origin, direction){
    this.origin = origin;
    this.direction = direction;
}

var gameMap = {
    data : [
        ["1100000011"],
        ["1200000021"],
        ["0000110000"],
        ["0000000000"],
        ["0010000100"],
        ["0010000100"],
        ["0000000000"],
        ["0000110000"],
        ["1200000021"],
        ["1100000011"],
    ],

    setup : function(){

    },

    drawMiniMap : function(){
        
    },

    getRayCollision : function(ray){
        //Digital differential analyzer
        var dx = ray.direction.x;
        var dy = ray.direction.y;

        if(Math.abs(dx) > Math.abs(dy)){
            //find direction, use floor / ceil to get first intersection.
            if(dx > 0){

            }else{

            }
        }else{

        }
    }
}

var player = {
    pos : new Vector(0, 0),
    direction : new Vector(0,0),
    speed : 5,

    screenWidth : 320,
    screenHeight : 240,
    focalLength : 200,
    renderRange : 20,
    scale : 1,

    update : function(){
        this.move();
        this.render();
    },

    move : function(){
        this.direction.normalize();
        this.pos.add(this.direction.mult(this.speed));
    },

    render : function(){
        for(var x = 0; x < this.screenWidth; x++){
            var relativeX = this.screenWidth / 2 - x;
            var rayDirection = new Vector(relativeX, this.focalLength);
            rayDirection.normalize();
            rayDirection.mult(this.renderRance);
            var ray = new Ray(this.pos, rayDirection);
            var rayCollision = gameMap.getRayCollision(ray);
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
}